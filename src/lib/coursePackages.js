import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Unzip, UnzipInflate, UnzipPassThrough } from 'fflate';
import bundledCoursesSchema from '../schemas/bundled-courses.schema.json';
import courseSchema from '../schemas/course.schema.json';
import lessonSchema from '../schemas/lesson.schema.json';
import {
  getCourseSettings,
  getInstalledPackage,
  installPackage,
  listInstalledPackages,
} from './courseStorage';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateRegistry = ajv.compile(bundledCoursesSchema);
const validateCourse = ajv.compile(courseSchema);
const validateLesson = ajv.compile(lessonSchema);
const MAX_ARCHIVE_FILES = 2000;
const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} is not valid JSON.`);
  }
}

function assertValid(validator, value, label) {
  if (!validator(value)) {
    const details = validator.errors
      ?.map((error) => `${error.instancePath || '/'} ${error.message}`)
      .join('; ');
    throw new Error(`${label} does not match the em3k format: ${details}`);
  }
}

function normalizePackagePath(value) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.startsWith('/') ||
    value.includes('\\') ||
    value.split('/').some((segment) => segment === '.' || segment === '..') ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  ) {
    throw new Error(`Invalid package-relative path: ${value}`);
  }
  return value;
}

function bytesToText(value, label) {
  if (typeof value === 'string') return value;
  if (value instanceof Uint8Array) return new TextDecoder().decode(value);
  throw new Error(`${label} was not found in the course package.`);
}

function joinChunks(chunks, size) {
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function unzipArchive(data) {
  return new Promise((resolve, reject) => {
    const files = {};
    const unzipper = new Unzip();
    let fileCount = 0;
    let declaredBytes = 0;
    let extractedBytes = 0;
    let pendingFiles = 0;
    let inputFinished = false;
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const completeIfReady = () => {
      if (!settled && inputFinished && pendingFiles === 0) {
        settled = true;
        resolve(files);
      }
    };

    unzipper.onfile = (file) => {
      if (file.name.endsWith('/')) return;
      try {
        normalizePackagePath(file.name);
        fileCount += 1;
        if (fileCount > MAX_ARCHIVE_FILES) throw new Error('Course package contains too many files.');
        if (Number.isFinite(file.originalSize)) {
          declaredBytes += file.originalSize;
          if (declaredBytes > MAX_ARCHIVE_BYTES) {
            throw new Error('Course package is larger than 50 MB when unpacked.');
          }
        }

        pendingFiles += 1;
        const chunks = [];
        let fileSize = 0;
        file.ondata = (error, chunk, final) => {
          if (error) {
            fail(error);
            return;
          }
          fileSize += chunk.length;
          extractedBytes += chunk.length;
          if (extractedBytes > MAX_ARCHIVE_BYTES) {
            file.terminate();
            fail(new Error('Course package is larger than 50 MB when unpacked.'));
            return;
          }
          if (chunk.length) chunks.push(chunk);
          if (final) {
            files[file.name] = joinChunks(chunks, fileSize);
            pendingFiles -= 1;
            completeIfReady();
          }
        };
        file.start();
      } catch (error) {
        file.terminate();
        fail(error);
      }
    };

    unzipper.register(UnzipPassThrough);
    unzipper.register(UnzipInflate);
    try {
      unzipper.push(data, true);
      inputFinished = true;
      completeIfReady();
    } catch (error) {
      fail(error);
    }
  });
}

export async function loadBundledRegistry() {
  const response = await fetch('/content/bundled-courses.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Could not load the bundled course registry.');
  const registry = await response.json();
  assertValid(validateRegistry, registry, 'Bundled course registry');
  return registry;
}

function bundledBaseUrl(entry) {
  const safeEntry = normalizePackagePath(entry);
  return `/content/bundled/${safeEntry.slice(0, safeEntry.lastIndexOf('/') + 1)}`;
}

async function fetchPackageJson(baseUrl, relativePath, label) {
  const safePath = normalizePackagePath(relativePath);
  const response = await fetch(`${baseUrl}${safePath}`, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${label} (${response.status}).`);
  return response.json();
}

async function validateCourseContents(course, loadLesson) {
  assertValid(validateCourse, course, `Course ${course?.id || ''}`);
  const categoryIds = new Set();
  for (const classification of course.categories || []) {
    if (categoryIds.has(classification.category)) {
      throw new Error(`Duplicate course category ID: ${classification.category}`);
    }
    categoryIds.add(classification.category);
  }
  const lessons = [];
  const lessonIds = new Set();
  const packagePaths = [course.thumbnail].filter(Boolean).map(normalizePackagePath);

  for (const reference of course.lessons) {
    normalizePackagePath(reference.file);
    if (lessonIds.has(reference.id)) throw new Error(`Duplicate lesson ID: ${reference.id}`);
    lessonIds.add(reference.id);
    const lesson = await loadLesson(reference.file);
    assertValid(validateLesson, lesson, `Lesson ${reference.id}`);
    if (lesson.id !== reference.id) {
      throw new Error(`Lesson ID mismatch for ${reference.file}.`);
    }
    const pageIds = new Set();
    for (const page of lesson.pages) {
      if (pageIds.has(page.id)) throw new Error(`Duplicate page ID in lesson ${lesson.id}: ${page.id}`);
      pageIds.add(page.id);
      for (const block of page.blocks) {
        const assetPaths = block.type === 'image'
          ? [block.src]
          : block.type === 'video'
            ? [block.src]
            : block.type === 'slideshow'
              ? block.images.map((image) => image.src)
              : [];
        packagePaths.push(...assetPaths.map(normalizePackagePath));
      }
    }
    if (lesson.quiz) {
      const questionIds = new Set();
      for (const question of lesson.quiz.questions) {
        if (questionIds.has(question.id)) throw new Error(`Duplicate question ID in lesson ${lesson.id}: ${question.id}`);
        questionIds.add(question.id);
        if (question.type === 'multiple-choice' && !question.options.some((option) => option.id === question.answer)) {
          throw new Error(`Quiz answer does not match an option in question ${question.id}.`);
        }
      }
    }
    lessons.push(lesson);
  }

  return { lessons, packagePaths };
}

export async function loadCoursePackage(courseId, registry) {
  const bundled = registry.courses.find((course) => course.id === courseId);
  if (bundled) {
    const baseUrl = bundledBaseUrl(bundled.entry);
    const course = await fetchPackageJson(baseUrl, 'course.json', 'course manifest');
    if (course.id !== bundled.id) throw new Error('Bundled course ID does not match its registry entry.');
    const { lessons, packagePaths } = await validateCourseContents(
      course,
      (file) => fetchPackageJson(baseUrl, file, `lesson ${file}`),
    );
    for (const assetPath of packagePaths) {
      const response = await fetch(`${baseUrl}${assetPath}`, { method: 'HEAD', cache: 'no-cache' });
      if (!response.ok) throw new Error(`Course asset was not found: ${assetPath}`);
    }
    return { course, lessons, placement: bundled.placement, baseUrl, files: null };
  }

  const record = await getInstalledPackage(courseId);
  if (!record) throw new Error(`Course ${courseId} is not installed.`);
  const { lessons, packagePaths } = await validateCourseContents(record.course, async (file) =>
    parseJson(bytesToText(record.files[normalizePackagePath(file)], file), file),
  );
  for (const assetPath of packagePaths) {
    if (!(record.files[assetPath] instanceof Uint8Array)) {
      throw new Error(`Course asset was not found: ${assetPath}`);
    }
  }
  return { course: record.course, lessons, placement: 'library', baseUrl: null, files: record.files };
}

export function resolvePackageAsset(coursePackage, assetPath) {
  const safePath = normalizePackagePath(assetPath);
  if (!coursePackage.files) return `${coursePackage.baseUrl}${safePath}`;

  const bytes = coursePackage.files[safePath];
  if (!(bytes instanceof Uint8Array)) return '';
  const cachedUrls = (coursePackage.objectUrls ||= new Map());
  if (!cachedUrls.has(safePath)) {
    const extension = safePath.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      gif: 'image/gif',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      ogg: 'audio/ogg',
      png: 'image/png',
      svg: 'image/svg+xml',
      webm: 'video/webm',
      webp: 'image/webp',
    };
    const type = mimeTypes[extension] || 'application/octet-stream';
    cachedUrls.set(safePath, URL.createObjectURL(new Blob([bytes], { type })));
  }
  return cachedUrls.get(safePath);
}

export function releasePackageAssets(coursePackage) {
  if (!coursePackage.objectUrls) return;
  for (const objectUrl of coursePackage.objectUrls.values()) {
    URL.revokeObjectURL(objectUrl);
  }
  coursePackage.objectUrls.clear();
}

export async function importCourseArchive(file, reservedCourseIds = []) {
  if (!file) throw new Error('Choose a course package archive.');
  if (file.size > MAX_ARCHIVE_BYTES) throw new Error('Course package archive is larger than 50 MB.');
  const filesInArchive = await unzipArchive(new Uint8Array(await file.arrayBuffer()));
  const names = Object.keys(filesInArchive);

  const manifestNames = names.filter((name) => name.endsWith('course.json'));
  if (manifestNames.length !== 1) throw new Error('Archive must contain exactly one course.json.');
  const manifestPath = manifestNames[0];
  const packageRoot = manifestPath.slice(0, -'course.json'.length);
  const files = {};
  for (const name of names) {
    if (!name.startsWith(packageRoot)) continue;
    const relativePath = name.slice(packageRoot.length);
    if (relativePath) files[normalizePackagePath(relativePath)] = filesInArchive[name];
  }

  const course = parseJson(bytesToText(files['course.json'], 'course.json'), 'course.json');
  const { lessons, packagePaths } = await validateCourseContents(course, async (lessonPath) =>
    parseJson(bytesToText(files[normalizePackagePath(lessonPath)], lessonPath), lessonPath),
  );
  for (const packagePath of packagePaths) {
    if (!(files[packagePath] instanceof Uint8Array)) {
      throw new Error(`Course asset was not found: ${packagePath}`);
    }
  }
  if (reservedCourseIds.includes(course.id)) {
    throw new Error(`A course with ID "${course.id}" is already available in the library.`);
  }

  const record = {
    id: course.id,
    course,
    files,
    active: true,
    installedAt: new Date().toISOString(),
  };
  await installPackage(record);
  return { course, lessons };
}

export async function getAvailableCourses(registry) {
  const [installedRecords, settings] = await Promise.all([
    listInstalledPackages(),
    getCourseSettings(),
  ]);
  const installedById = new Map(installedRecords.map((record) => [record.id, record]));
  const settingsById = new Map(settings.map((record) => [record.courseId, record]));

  const bundledCourses = await Promise.all(registry.courses.map(async (entry) => {
    const { course } = await loadCoursePackage(entry.id, registry);
    const installed = installedById.get(entry.id);
    return {
      id: course.id,
      slug: course.id,
      name: course.title,
      title: course.title,
      teacherSlug: course.publisherId,
      description: course.description || '',
      placement: entry.placement,
      active: settingsById.get(entry.id)?.active ?? entry.placement === 'library',
      bundled: true,
      version: course.version,
    };
  }));

  const bundledIds = new Set(registry.courses.map((entry) => entry.id));
  const installedCourses = installedRecords
    .filter((record) => !bundledIds.has(record.id))
    .map(({ course, active }) => ({
      id: course.id,
      slug: course.id,
      name: course.title,
      title: course.title,
      teacherSlug: course.publisherId,
      description: course.description || '',
      placement: 'library',
      active: settingsById.get(course.id)?.active ?? active ?? true,
      bundled: false,
      version: course.version,
    }));

  return [...bundledCourses, ...installedCourses];
}
