import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCourse } from './useCourse';
import Quiz from '../pages/courseviewer/quiz';

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

function CourseQuizHarness({ courseId }) {
  courseState = useCourse(courseId);
  if (courseState.loading) return h('div', null, 'loading');
  const step = courseState.currentStep;
  if (step?.kind === 'quiz') {
    return h(Quiz, {
      quizData: step.quiz,
      lessonId: step.lesson.id,
      attempt: courseState.quizAttempt,
      isFreshQuiz: courseState.isFreshQuiz,
      allowRetakes: step.quiz.allowRetakes === true,
      bestPassingScore: courseState.bestPassingScore,
      onQuizResult: courseState.onQuizResult,
      onBack: courseState.navigate.back,
      onReviewAnswers: () => courseState.reviewQuizAnswers(step.lesson.id),
    });
  }
  if (step?.kind === 'quiz-results') return h('div', { 'data-testid': 'answers-step' }, 'Answers step');
  return h('div', null, step?.kind || 'introduction');
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

  it('resumes saved Answers and restores the latest submitted responses', async () => {
    const loadedPackage = {
      course: { id: 'answers-course', version: '1.0.0', title: 'Answers course' },
      lessons: [{
        id: 'lesson-one',
        title: 'Lesson one',
        pages: [{ id: 'page-one', heading: 'Page one', blocks: [] }],
        quiz: { title: 'Practice', passPercent: 70, questions: [{ id: 'q1' }] },
      }],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    const attempt = {
      lessonId: 'lesson-one',
      attemptId: 'attempt-one',
      answers: { q1: 'option-a' },
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
      submittedAt: '2026-01-01T00:00:00.000Z',
    };
    mocks.loadCoursePackage.mockResolvedValue(loadedPackage);
    mocks.getCourseProgress.mockResolvedValue({
      formatVersion: 2,
      courseId: 'answers-course',
      courseVersion: '1.0.0',
      lastLocation: { kind: 'quiz-results', lessonId: 'lesson-one' },
      visitedPages: [],
      completedLessons: [{ lessonId: 'lesson-one', completedAt: attempt.submittedAt }],
      quizResults: [attempt],
      courseCompletedAt: null,
      updatedAt: attempt.submittedAt,
    });

    await act(() => render(h(CourseHarness, { courseId: 'answers-course' }), container));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz-results'));
    expect(courseState.stepIndex).toBe(2);
    expect(courseState.quizAttempt).toEqual(attempt);
    expect(courseState.isFreshQuiz).toBe(false);

    await act(() => render(null, container));
    mocks.getCourseProgress.mockResolvedValue({
      formatVersion: 2,
      courseId: 'answers-course',
      courseVersion: '1.0.0',
      lastLocation: { kind: 'quiz', lessonId: 'lesson-one' },
      visitedPages: [],
      completedLessons: [{ lessonId: 'lesson-one', completedAt: attempt.submittedAt }],
      quizResults: [attempt],
      courseCompletedAt: null,
      updatedAt: attempt.submittedAt,
    });
    await act(() => render(h(CourseHarness, { courseId: 'answers-course' }), container));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz'));
    expect(courseState.quizAttempt.answers).toEqual({ q1: 'option-a' });
    expect(courseState.isFreshQuiz).toBe(false);
  });

  it('does not award course completion after a failed quiz even at the final screen', async () => {
    const loadedPackage = {
      course: { id: 'failed-course', version: '1.0.0', title: 'Failed course' },
      lessons: [{
        id: 'lesson-one',
        title: 'Lesson one',
        pages: [{ id: 'page-one', heading: 'Page one', blocks: [] }],
        quiz: { title: 'Practice', passPercent: 70, questions: [{ id: 'q1' }] },
      }],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    mocks.loadCoursePackage.mockResolvedValue(loadedPackage);
    mocks.getCourseProgress.mockResolvedValue(null);

    await act(() => render(h(CourseHarness, { courseId: 'failed-course' }), container));
    await vi.waitFor(() => expect(courseState.course?.id).toBe('failed-course'));
    await act(async () => { await courseState.navigate.goToStep(1); });
    await act(async () => {
      await courseState.onQuizResult('lesson-one', {
        attemptId: 'failed-attempt',
        answers: { q1: 'wrong' },
        correct: 0,
        total: 1,
        percent: 0,
        passed: false,
      });
    });

    expect(courseState.currentStep?.kind).toBe('quiz-results');
    expect(mocks.savedProgress.completedLessons).toEqual([]);
    await act(async () => { await courseState.startQuizAgain('lesson-one'); });
    expect(mocks.savedProgress.activeQuizLessonId).toBe('lesson-one');
    await act(() => render(null, container));
    mocks.getCourseProgress.mockResolvedValue(mocks.savedProgress);
    await act(() => render(h(CourseHarness, { courseId: 'failed-course' }), container));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz'));
    expect(courseState.isFreshQuiz).toBe(true);
    expect(courseState.quizAttempt.attemptId).toBe('failed-attempt');
    await act(async () => { await courseState.navigate.goToStep(2); });
    await act(async () => { await courseState.navigate.next(); });
    expect(courseState.showCompletionScreen).toBe(true);
    expect(courseState.hasCompletedCourse).toBe(false);
    expect(mocks.savedProgress.courseCompletedAt).toBeNull();
  });

  it('keeps the failed Quiz attempt active and retries it once before resuming Answers', async () => {
    const loadedPackage = {
      course: { id: 'save-failure-course', version: '1.0.0', title: 'Save failure course' },
      lessons: [{
        id: 'lesson-one',
        title: 'Lesson one',
        pages: [{ id: 'page-one', heading: 'Page one', blocks: [] }],
        quiz: {
          title: 'Practice',
          passPercent: 70,
          questions: [{
            id: 'question-one',
            type: 'multiple-choice',
            prompt: 'Pick yes',
            answer: 'yes',
            options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }],
          }],
        },
      }],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    mocks.loadCoursePackage.mockResolvedValue(loadedPackage);
    mocks.getCourseProgress.mockResolvedValue(null);
    let retrySaveResolver;
    const submittedWrites = [];
    mocks.saveCourseProgress.mockImplementation(async (_courseId, progress) => {
      if (progress.quizResults.length > 0) {
        submittedWrites.push(progress);
        if (submittedWrites.length === 1) throw new Error('IndexedDB write failed');
        if (submittedWrites.length === 2) {
          await new Promise((resolve) => { retrySaveResolver = resolve; });
        }
      }
      mocks.savedProgress = progress;
    });

    await act(() => render(h(CourseQuizHarness, { courseId: 'save-failure-course' }), container));
    await vi.waitFor(() => expect(courseState.course?.id).toBe('save-failure-course'));
    await act(async () => { await courseState.navigate.goToStep(1); });
    expect(courseState.currentStep.kind).toBe('quiz');
    await act(() => container.querySelector('input[value="yes"]').click());
    await act(() => container.querySelector('button[type="submit"]').click());
    await vi.waitFor(() => expect(container.textContent).toContain('Your result could not be saved.'));

    const firstAttemptId = submittedWrites[0].quizResults[0].attemptId;
    expect(firstAttemptId).toEqual(expect.any(String));
    expect(courseState.currentStep.kind).toBe('quiz');
    expect(container.querySelector('[data-testid="answers-step"]')).toBeNull();
    expect(container.querySelector('input[value="yes"]').checked).toBe(true);
    expect(mocks.savedProgress.quizResults).toEqual([]);

    const retryButton = [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Retry saving result');
    await act(() => {
      retryButton.click();
      retryButton.click();
    });
    await vi.waitFor(() => expect(retrySaveResolver).toBeDefined());
    expect(submittedWrites).toHaveLength(2);
    expect(submittedWrites[1].quizResults[0].attemptId).toBe(firstAttemptId);
    expect(courseState.currentStep.kind).toBe('quiz');
    expect(container.querySelector('[data-testid="answers-step"]')).toBeNull();

    retrySaveResolver();
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz-results'));
    expect(container.querySelector('[data-testid="answers-step"]')).not.toBeNull();
    expect(mocks.savedProgress.quizResults).toHaveLength(1);
    expect(mocks.savedProgress.quizResults[0].attemptId).toBe(firstAttemptId);
    expect(mocks.savedProgress.lastLocation).toEqual({ kind: 'quiz-results', lessonId: 'lesson-one' });

    await act(() => render(null, container));
    mocks.getCourseProgress.mockResolvedValue(mocks.savedProgress);
    await act(() => render(h(CourseQuizHarness, { courseId: 'save-failure-course' }), container));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz-results'));
    expect(container.querySelector('[data-testid="answers-step"]')).not.toBeNull();
    expect(courseState.quizAttempt.attemptId).toBe(firstAttemptId);
  });

  it('rejects quiz persistence when course progress is unavailable', async () => {
    await act(() => render(h(CourseHarness, { courseId: '' }), container));

    await expect(courseState.onQuizResult('lesson-one', {
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    })).rejects.toThrow('Course progress is unavailable; quiz result could not be saved.');
    expect(mocks.saveCourseProgress).not.toHaveBeenCalled();
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
    expect(courseState.steps.map((step) => step.kind)).toEqual(['page', 'page', 'quiz', 'quiz-results', 'page']);
    expect(courseState.stepIndex).toBe(1);
    expect(courseState.progressPercent).toBe(67);

    await act(async () => { await courseState.navigate.goToStep(4); });
    await vi.waitFor(() => expect(courseState.currentStep?.page?.id).toBe('page-three'));
    expect(courseState.stepIndex).toBe(4);
    expect(courseState.progressPercent).toBe(100);
    expect(courseState.progressPercent).toBeGreaterThan(67);

    await act(async () => { await courseState.navigate.back(); });
    await vi.waitFor(() => expect(courseState.stepIndex).toBe(3));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz-results'));
    expect(courseState.progressPercent).toBe(100);
    expect(mocks.savedProgress.lastLocation).toEqual({ kind: 'quiz-results', lessonId: 'lesson-one' });
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
    expect(courseState.steps.map((step) => step.kind)).toEqual(['page', 'quiz', 'quiz-results', 'page']);
    await act(async () => { await courseState.navigate.goToStep(1); });
    await vi.waitFor(() => expect(courseState.stepIndex).toBe(1));
    await vi.waitFor(() => expect(courseState.currentStep?.kind).toBe('quiz'));
    mocks.saveCourseProgress.mockRejectedValueOnce(new Error('Storage unavailable'));
    let quizSaveError;
    await act(async () => {
      try {
        await courseState.onQuizResult('lesson-one', {
          attemptId: 'attempt-one', answers: { q1: 'answer' }, correct: 1, total: 1, percent: 100, passed: true,
        });
      } catch (error) {
        quizSaveError = error;
      }
    });
    expect(quizSaveError).toEqual(new Error('Storage unavailable'));
    expect(mocks.savedProgress.quizResults).toEqual([]);
    await act(async () => {
      await courseState.onQuizResult('lesson-one', {
        attemptId: 'attempt-one', answers: { q1: 'answer' }, correct: 1, total: 1, percent: 100, passed: true,
      });
    });
    await vi.waitFor(() => expect(mocks.savedProgress.quizResults).toHaveLength(1));
    expect(mocks.savedProgress.quizResults[0]).toMatchObject({
      lessonId: 'lesson-one',
      attemptId: 'attempt-one',
      answers: { q1: 'answer' },
      correct: 1,
      percent: 100,
      passed: true,
    });
    expect(courseState.currentStep.kind).toBe('quiz-results');
    expect(mocks.savedProgress.lastLocation).toEqual({ kind: 'quiz-results', lessonId: 'lesson-one' });
    await act(async () => { await courseState.navigate.back(); });
    expect(courseState.currentStep.kind).toBe('quiz');
    expect(courseState.quizAttempt.attemptId).toBe('attempt-one');
    expect(courseState.isFreshQuiz).toBe(false);
    await act(async () => { await courseState.reviewQuizAnswers('lesson-one'); });
    expect(courseState.currentStep.kind).toBe('quiz-results');
    expect(mocks.savedProgress.quizResults).toHaveLength(1);
    await act(async () => { await courseState.navigate.next(); });
    await vi.waitFor(() => expect(mocks.savedProgress.completedLessons).toHaveLength(1));
    expect(mocks.savedProgress.completedLessons).toEqual([
      expect.objectContaining({ lessonId: 'lesson-one' }),
    ]);

    await act(async () => { await courseState.navigate.next(); });
    expect(courseState.showCompletionScreen).toBe(true);
    expect(courseState.hasCompletedCourse).toBe(true);
    const completionTime = mocks.savedProgress.courseCompletedAt;
    expect(completionTime).toBeTruthy();

    await act(async () => { await courseState.navigate.goToStep(0); });
    expect(courseState.showCompletionScreen).toBe(false);
    expect(courseState.hasCompletedCourse).toBe(true);
    expect(mocks.savedProgress.courseCompletedAt).toBe(completionTime);
    expect(mocks.savedProgress.lastLocation).toEqual({ kind: 'page', lessonId: 'lesson-one', pageId: 'page-one' });

    await act(() => render(null, container));
    mocks.getCourseProgress.mockResolvedValue(mocks.savedProgress);
    await act(() => render(h(CourseHarness, { courseId: 'complete-course' }), container));
    await vi.waitFor(() => expect(courseState.currentStep?.page?.id).toBe('page-one'));
    expect(courseState.showCompletionScreen).toBe(false);
    expect(courseState.hasCompletedCourse).toBe(true);
    expect(courseState.courseCompletedAt).toBe(completionTime);
  });
});
