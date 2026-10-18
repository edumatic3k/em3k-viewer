import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const contentRoot = path.resolve('public/content');
const packageRoot = path.join(contentRoot, 'bundled');
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${path.relative(process.cwd(), filePath)}: ${error.message}`);
  }
}

function assertValid(validator, value, filePath) {
  if (!validator(value)) {
    const details = validator.errors
      ?.map((error) => `${error.instancePath || '/'} ${error.message}`)
      .join('; ');
    throw new Error(`${path.relative(process.cwd(), filePath)}: ${details}`);
  }
}

function resolvePackageFile(basePath, relativePath) {
  if (
    typeof relativePath !== 'string' ||
    !relativePath ||
    relativePath.startsWith('/') ||
    relativePath.includes('\\') ||
    /^[a-z][a-z\d+.-]*:/i.test(relativePath) ||
    relativePath.split('/').some((part) => part === '.' || part === '..')
  ) {
    throw new Error(`Invalid package-relative path: ${relativePath}`);
  }

  const filePath = path.resolve(basePath, relativePath);
  if (!filePath.startsWith(`${basePath}${path.sep}`)) {
    throw new Error(`Package path escapes its root: ${relativePath}`);
  }
  return filePath;
}

const validateRegistry = ajv.compile(readJson('src/schemas/bundled-courses.schema.json'));
const validateCourse = ajv.compile(readJson('src/schemas/course.schema.json'));
const validateLesson = ajv.compile(readJson('src/schemas/lesson.schema.json'));
const registryPath = path.join(contentRoot, 'bundled-courses.json');
const registry = readJson(registryPath);
assertValid(validateRegistry, registry, registryPath);

const courseIds = new Set();
for (const entry of registry.courses) {
  if (courseIds.has(entry.id)) throw new Error(`Duplicate bundled course ID: ${entry.id}`);
  courseIds.add(entry.id);

  const coursePath = resolvePackageFile(packageRoot, entry.entry);
  const course = readJson(coursePath);
  assertValid(validateCourse, course, coursePath);
  if (course.id !== entry.id) throw new Error(`${coursePath}: registry and package IDs differ`);

  const packageDir = path.dirname(coursePath);
  const checkAsset = (assetPath) => {
    const filePath = resolvePackageFile(packageDir, assetPath);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      throw new Error(`${path.relative(process.cwd(), coursePath)}: missing asset ${assetPath}`);
    }
  };
  if (course.thumbnail) checkAsset(course.thumbnail);

  const lessonIds = new Set();
  for (const reference of course.lessons) {
    if (lessonIds.has(reference.id)) throw new Error(`${coursePath}: duplicate lesson ID ${reference.id}`);
    lessonIds.add(reference.id);
    const lessonPath = resolvePackageFile(packageDir, reference.file);
    const lesson = readJson(lessonPath);
    assertValid(validateLesson, lesson, lessonPath);
    if (lesson.id !== reference.id) throw new Error(`${lessonPath}: referenced lesson ID differs`);

    const pageIds = new Set();
    for (const page of lesson.pages) {
      if (pageIds.has(page.id)) throw new Error(`${lessonPath}: duplicate page ID ${page.id}`);
      pageIds.add(page.id);
      for (const block of page.blocks) {
        if (block.type === 'image' || block.type === 'video') checkAsset(block.src);
        if (block.type === 'slideshow') block.images.forEach((image) => checkAsset(image.src));
      }
    }
  }
}

console.log(`Validated ${courseIds.size} bundled course packages.`);