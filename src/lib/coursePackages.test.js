import { afterEach, describe, expect, it, vi } from 'vitest';
import { strToU8, zipSync } from 'fflate';
import {
  importCourseArchive,
  releasePackageAssets,
  resolvePackageAsset,
} from './coursePackages';
import { getInstalledPackage, getCourseProgress, removePackage, saveCourseProgress } from './courseStorage';

function createArchive(courseId, title = 'Test course', quiz = null) {
  const course = {
    formatVersion: 1,
    id: courseId,
    version: '1.0.0',
    title,
    publisherId: 'test-publisher',
    language: 'en',
    license: 'CC0-1.0',
    lessons: [{ id: 'lesson-one', title: 'Lesson one', file: 'lesson.json' }],
  };
  const lesson = {
    formatVersion: 1,
    id: 'lesson-one',
    title: 'Lesson one',
    pages: [{ id: 'page-one', heading: 'Page one', blocks: [] }],
    ...(quiz ? { quiz } : {}),
  };
  const bytes = zipSync({
    [`${courseId}/course.json`]: strToU8(JSON.stringify(course)),
    [`${courseId}/lesson.json`]: strToU8(JSON.stringify(lesson)),
  });
  return {
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}

describe('course package corrections', () => {
  it('rejects duplicate imports without replacing the installed package', async () => {
    const courseId = `duplicate-${crypto.randomUUID()}`;
    await importCourseArchive(createArchive(courseId, 'Original course'));

    await expect(importCourseArchive(createArchive(courseId, 'Replacement course')))
      .rejects.toThrow(`A course with ID "${courseId}" is already installed.`);

    await expect(getInstalledPackage(courseId)).resolves.toMatchObject({
      course: { title: 'Original course' },
    });
  });

  it('rejects imports whose IDs belong to bundled courses', async () => {
    const courseId = `bundled-${crypto.randomUUID()}`;
    await expect(importCourseArchive(createArchive(courseId), [courseId]))
      .rejects.toThrow(`A course with ID "${courseId}" is already available in the library.`);
    await expect(getInstalledPackage(courseId)).resolves.toBeUndefined();
  });

  it('validates optional allowRetakes as a boolean and accepts it omitted', async () => {
    const validId = `retakes-valid-${crypto.randomUUID()}`;
    const quiz = {
      title: 'Practice',
      passPercent: 70,
      allowRetakes: true,
      questions: [{
        id: 'question-one',
        type: 'multiple-choice',
        prompt: 'Pick one',
        options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
        answer: 'a',
      }],
    };
    await importCourseArchive(createArchive(validId, 'Valid retakes', quiz));

    const invalidId = `retakes-invalid-${crypto.randomUUID()}`;
    await expect(importCourseArchive(createArchive(invalidId, 'Invalid retakes', {
      ...quiz,
      allowRetakes: 'yes',
    }))).rejects.toThrow(/must be boolean|allowRetakes/i);

    const omittedId = `retakes-omitted-${crypto.randomUUID()}`;
    const { allowRetakes, ...legacyQuiz } = quiz;
    await importCourseArchive(createArchive(omittedId, 'Omitted retakes', legacyQuiz));
    expect(allowRetakes).toBe(true);
  });

  it('uninstalls a package without deleting its learner progress', async () => {
    const courseId = `progress-${crypto.randomUUID()}`;
    const progress = {
      formatVersion: 1,
      courseId,
      courseVersion: '1.0.0',
      lastLocation: { kind: 'page', lessonId: 'lesson-one', pageId: 'page-one' },
      visitedPages: [{ lessonId: 'lesson-one', pageIds: ['page-one'] }],
      completedLessons: [],
      quizResults: [],
      courseCompletedAt: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    await importCourseArchive(createArchive(courseId));
    await saveCourseProgress(courseId, progress);

    await removePackage(courseId);

    await expect(getInstalledPackage(courseId)).resolves.toBeUndefined();
    await expect(getCourseProgress(courseId)).resolves.toMatchObject(progress);

    await importCourseArchive(createArchive(courseId));
    await expect(getInstalledPackage(courseId)).resolves.toBeDefined();
    await expect(getCourseProgress(courseId)).resolves.toMatchObject(progress);
  });

  it('stores independent progress records for different course IDs', async () => {
    const firstCourseId = `progress-first-${crypto.randomUUID()}`;
    const secondCourseId = `progress-second-${crypto.randomUUID()}`;
    const firstProgress = { formatVersion: 1, courseId: firstCourseId, visitedPages: [] };
    const secondProgress = { formatVersion: 1, courseId: secondCourseId, visitedPages: [] };

    await saveCourseProgress(firstCourseId, firstProgress);
    await saveCourseProgress(secondCourseId, secondProgress);

    await expect(getCourseProgress(firstCourseId)).resolves.toMatchObject(firstProgress);
    await expect(getCourseProgress(secondCourseId)).resolves.toMatchObject(secondProgress);
  });

  it('caches imported asset URLs and revokes them when released', () => {
    const createObjectURL = vi.fn(() => 'blob:course-asset');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const coursePackage = {
      files: { 'media/image.png': new Uint8Array([1, 2, 3]) },
    };

    expect(resolvePackageAsset(coursePackage, 'media/image.png')).toBe('blob:course-asset');
    expect(resolvePackageAsset(coursePackage, 'media/image.png')).toBe('blob:course-asset');
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    releasePackageAssets(coursePackage);

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:course-asset');
    expect(coursePackage.objectUrls.size).toBe(0);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
