import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCourse } from './useCourse';

const mocks = vi.hoisted(() => ({
  loadCoursePackage: vi.fn(),
  releasePackageAssets: vi.fn(),
  resolvePackageAsset: vi.fn(),
  getCourseProgress: vi.fn(),
  saveCourseProgress: vi.fn(),
  savedProgress: null,
  registry: { courses: [] },
}));

vi.mock('../contexts/LibraryContext', () => ({
  useLibrary: () => ({ registry: mocks.registry }),
}));
vi.mock('../lib/coursePackages', () => ({
  loadCoursePackage: mocks.loadCoursePackage,
  releasePackageAssets: mocks.releasePackageAssets,
  resolvePackageAsset: mocks.resolvePackageAsset,
}));
vi.mock('../lib/courseStorage', () => ({
  getCourseProgress: mocks.getCourseProgress,
  saveCourseProgress: mocks.saveCourseProgress,
}));

let courseState;
function CourseHarness({ courseId }) {
  courseState = useCourse(courseId);
  return h('div', null, courseState.loading ? 'loading' : courseState.error || courseState.course?.title || 'empty');
}

describe('useCourse loading state', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mocks.loadCoursePackage.mockReset();
    mocks.releasePackageAssets.mockReset();
    mocks.resolvePackageAsset.mockReset();
    mocks.getCourseProgress.mockReset().mockResolvedValue({ stepIndex: 0 });
    mocks.savedProgress = null;
    mocks.saveCourseProgress.mockReset().mockImplementation(async (_courseId, progress) => {
      mocks.savedProgress = progress;
    });
    mocks.releasePackageAssets.mockImplementation(() => {
      expect(container.textContent).not.toBe('First course');
    });
    courseState = null;
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
  });

  it('clears the previous course and progress index when a course load fails', async () => {
    const loadedPackage = {
      course: { id: 'first-course', title: 'First course' },
      lessons: [{ id: 'lesson', title: 'Lesson', pages: [{ id: 'page', heading: 'Page', blocks: [] }] }],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    mocks.loadCoursePackage.mockImplementation((courseId) => courseId === 'first-course'
      ? Promise.resolve(loadedPackage)
      : Promise.reject(new Error('Course unavailable.')));

    await act(() => {
      render(h(CourseHarness, { courseId: 'first-course' }), container);
    });
    await vi.waitFor(() => expect(courseState.course).toEqual(loadedPackage.course));
    expect(courseState.course).toEqual(loadedPackage.course);
    expect(courseState.stepIndex).toBe(0);
    expect(mocks.releasePackageAssets).not.toHaveBeenCalled();

    await act(() => {
      render(h(CourseHarness, { courseId: 'missing-course' }), container);
    });
    await vi.waitFor(() => expect(courseState.error).toBe('Course unavailable.'));

    expect(courseState.course).toBeNull();
    expect(courseState.lessons).toEqual([]);
    expect(courseState.currentStep).toBeNull();
    expect(courseState.stepIndex).toBe(-1);
    expect(courseState.error).toBe('Course unavailable.');
    expect(container.textContent).toBe('Course unavailable.');
    expect(mocks.releasePackageAssets).toHaveBeenCalledWith(loadedPackage);
  });

  it('resumes a stable location and allows outline jumps and backward navigation without losing visits', async () => {
    const loadedPackage = {
      course: { id: 'multi-course', version: '1.0.0', title: 'Multi course' },
      lessons: [
        {
          id: 'lesson-one',
          title: 'Lesson one',
          pages: [{ id: 'page-one', heading: 'Page one', blocks: [] }, { id: 'page-two', heading: 'Page two', blocks: [] }],
          quiz: { title: 'Quiz one', passPercent: 50, questions: [{ id: 'q1' }] },
        },
        { id: 'lesson-two', title: 'Lesson two', pages: [{ id: 'page-three', heading: 'Page three', blocks: [] }] },
      ],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    mocks.loadCoursePackage.mockResolvedValue(loadedPackage);
    mocks.getCourseProgress.mockResolvedValue({
      formatVersion: 1,
      courseId: 'multi-course',
      courseVersion: '1.0.0',
      lastLocation: { kind: 'page', lessonId: 'lesson-one', pageId: 'page-two' },
      visitedPages: [{ lessonId: 'lesson-one', pageIds: ['page-one', 'page-two'] }],
      completedLessons: [],
      quizResults: [],
      courseCompletedAt: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    await act(() => render(h(CourseHarness, { courseId: 'multi-course' }), container));
    await vi.waitFor(() => expect(courseState.currentStep?.page?.id).toBe('page-two'));
    expect(courseState.steps.map((step) => step.kind)).toEqual(['page', 'page', 'quiz', 'page']);
    expect(courseState.stepIndex).toBe(1);
    expect(courseState.progressPercent).toBe(67);

    await act(async () => { await courseState.navigate.goToStep(3); });
    await vi.waitFor(() => expect(courseState.currentStep?.page?.id).toBe('page-three'));
    expect(courseState.stepIndex).toBe(3);
    expect(courseState.progressPercent).toBe(100);
    expect(courseState.progressPercent).toBeGreaterThan(67);

    await act(async () => { await courseState.navigate.back(); });
    await vi.waitFor(() => expect(courseState.stepIndex).toBe(2));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz'));
    expect(courseState.progressPercent).toBe(100);
    expect(mocks.savedProgress.lastLocation).toEqual({ kind: 'quiz', lessonId: 'lesson-one' });
  });

  it('records lesson and course completion as explicit milestones that survive review navigation', async () => {
    const loadedPackage = {
      course: { id: 'complete-course', version: '1.0.0', title: 'Complete course' },
      lessons: [
        {
          id: 'lesson-one',
          title: 'Lesson one',
          pages: [{ id: 'page-one', heading: 'Page one', blocks: [] }],
          quiz: { title: 'Quiz one', passPercent: 50, questions: [{ id: 'q1' }] },
        },
        { id: 'lesson-two', title: 'Lesson two', pages: [{ id: 'page-two', heading: 'Page two', blocks: [] }] },
      ],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    mocks.loadCoursePackage.mockResolvedValue(loadedPackage);
    mocks.getCourseProgress.mockResolvedValue(null);

    await act(() => render(h(CourseHarness, { courseId: 'complete-course' }), container));
    await vi.waitFor(() => expect(courseState.course?.id).toBe('complete-course'));
    expect(courseState.steps.map((step) => step.kind)).toEqual(['page', 'quiz', 'page']);
    await act(async () => { await courseState.navigate.goToStep(1); });
    await vi.waitFor(() => expect(courseState.stepIndex).toBe(1));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz'));
    await act(async () => {
      await courseState.onQuizResult('lesson-one', { correct: 1, total: 1, percent: 100, passed: true });
    });
    await vi.waitFor(() => expect(mocks.savedProgress.quizResults).toHaveLength(1));
    expect(mocks.savedProgress.quizResults[0]).toMatchObject({
      lessonId: 'lesson-one',
      score: 1,
      percent: 100,
      passed: true,
    });
    await act(async () => { await courseState.navigate.next(); });
    await vi.waitFor(() => expect(mocks.savedProgress.completedLessons).toHaveLength(1));
    expect(mocks.savedProgress.completedLessons).toEqual([
      expect.objectContaining({ lessonId: 'lesson-one' }),
    ]);

    await act(async () => { await courseState.navigate.next(); });
    expect(courseState.completed).toBe(true);
    const completionTime = mocks.savedProgress.courseCompletedAt;
    expect(completionTime).toBeTruthy();

    await act(async () => { await courseState.navigate.goToStep(0); });
    expect(courseState.completed).toBe(false);
    expect(mocks.savedProgress.courseCompletedAt).toBe(completionTime);
    expect(mocks.savedProgress.lastLocation).toEqual({ kind: 'page', lessonId: 'lesson-one', pageId: 'page-one' });
  });
});
