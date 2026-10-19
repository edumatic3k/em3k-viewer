import { describe, expect, it } from 'vitest';
import {
  completeCourse,
  completeLesson,
  areCourseLessonsComplete,
  createCourseProgress,
  getBestPassingScore,
  getPageProgressPercent,
  getVisitedPageCount,
  normalizeCourseProgress,
  recordPageVisit,
  recordQuizResult,
  resolveProgressLocation,
} from './courseProgress';

const course = { id: 'course-one', version: '1.2.0' };
const lessons = [
  { id: 'lesson-one', pages: [{ id: 'page-one' }, { id: 'page-two' }] },
  { id: 'lesson-two', pages: [{ id: 'page-three' }] },
];
const steps = lessons.flatMap((lesson) => lesson.pages.map((page) => ({ kind: 'page', lesson, page })));

describe('course progress model', () => {
  it('initializes a versioned course record at the introduction', () => {
    expect(createCourseProgress(course, '2026-01-01T00:00:00.000Z')).toEqual({
      formatVersion: 2,
      courseId: 'course-one',
      courseVersion: '1.2.0',
      lastLocation: { kind: 'intro' },
      visitedPages: [],
      completedLessons: [],
      quizResults: [],
      activeQuizLessonId: null,
      courseCompletedAt: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('migrates valid legacy indexes to stable IDs without inventing history', () => {
    const { progress, stepIndex } = normalizeCourseProgress(
      { stepIndex: 1, completed: false, updatedAt: '2025-12-01T00:00:00.000Z' },
      course,
      lessons,
      steps,
      '2026-01-01T00:00:00.000Z',
    );

    expect(progress.lastLocation).toEqual({ kind: 'page', lessonId: 'lesson-one', pageId: 'page-two' });
    expect(progress.visitedPages).toEqual([]);
    expect(progress.completedLessons).toEqual([]);
    expect(progress.updatedAt).toBe('2025-12-01T00:00:00.000Z');
    expect(stepIndex).toBe(1);
    expect(normalizeCourseProgress(progress, course, lessons, steps).progress).toEqual(progress);
  });

  it('upgrades score-only attempts without inventing response data', () => {
    const saved = {
      formatVersion: 1,
      quizResults: [{ lessonId: 'lesson-one', score: 2, total: 3, percent: 67, passed: false, submittedAt: '2025-12-01' }],
    };
    const upgraded = normalizeCourseProgress(saved, course, lessons, steps).progress;

    expect(upgraded.formatVersion).toBe(2);
    expect(upgraded.quizResults).toEqual([{
      ...saved.quizResults[0],
      attemptId: 'legacy-lesson-one-0',
    }]);
    expect(upgraded.quizResults[0]).not.toHaveProperty('answers');
    expect(normalizeCourseProgress(upgraded, course, lessons, steps).progress.quizResults).toEqual(upgraded.quizResults);
  });

  it('migrates legacy completion and safely handles invalid indexes', () => {
    const completed = normalizeCourseProgress({ stepIndex: 1, completed: true, updatedAt: '2025-12-01' }, course, lessons, steps);
    const invalid = normalizeCourseProgress({ stepIndex: 99 }, course, lessons, steps);

    expect(completed.progress.lastLocation).toEqual({ kind: 'complete' });
    expect(completed.progress.courseCompletedAt).toBe('2025-12-01');
    expect(completed.stepIndex).toBe(steps.length);
    expect(invalid.progress.lastLocation).toEqual({ kind: 'intro' });
    expect(invalid.stepIndex).toBe(-1);
  });

  it('resolves legacy positions using the pre-Answers step order', () => {
    const quizLessons = [
      { id: 'lesson-one', pages: [{ id: 'page-one' }], quiz: {} },
      { id: 'lesson-two', pages: [{ id: 'page-two' }] },
    ];
    const currentSteps = [
      { kind: 'page', lesson: quizLessons[0], page: quizLessons[0].pages[0] },
      { kind: 'quiz', lesson: quizLessons[0] },
      { kind: 'quiz-results', lesson: quizLessons[0] },
      { kind: 'page', lesson: quizLessons[1], page: quizLessons[1].pages[0] },
    ];
    const migrated = normalizeCourseProgress({ stepIndex: 2 }, course, quizLessons, currentSteps);

    expect(migrated.progress.lastLocation).toEqual({ kind: 'page', lessonId: 'lesson-two', pageId: 'page-two' });
    expect(migrated.stepIndex).toBe(3);
  });

  it('resolves reordered and missing page IDs by stable identity and lesson fallback', () => {
    const reordered = [steps[2], steps[0], steps[1]];
    expect(resolveProgressLocation({ kind: 'page', lessonId: 'lesson-one', pageId: 'page-two' }, lessons, reordered)).toBe(2);
    expect(resolveProgressLocation({ kind: 'page', lessonId: 'lesson-one', pageId: 'removed' }, lessons, reordered)).toBe(1);
    expect(resolveProgressLocation({ kind: 'page', lessonId: 'removed-lesson', pageId: 'removed' }, lessons, reordered)).toBe(-1);
  });

  it('rewrites missing saved locations to a valid lesson start or the introduction', () => {
    const missingPage = normalizeCourseProgress({
      formatVersion: 1,
      lastLocation: { kind: 'page', lessonId: 'lesson-one', pageId: 'removed' },
    }, course, lessons, steps);
    const missingLesson = normalizeCourseProgress({
      formatVersion: 1,
      lastLocation: { kind: 'page', lessonId: 'removed-lesson', pageId: 'removed' },
    }, course, lessons, steps);

    expect(missingPage.progress.lastLocation).toEqual({ kind: 'page', lessonId: 'lesson-one', pageId: 'page-one' });
    expect(missingPage.stepIndex).toBe(0);
    expect(missingLesson.progress.lastLocation).toEqual({ kind: 'intro' });
    expect(missingLesson.stepIndex).toBe(-1);
  });

  it('records unique page visits and calculates progress independently of navigation', () => {
    const initial = createCourseProgress(course, '2026-01-01T00:00:00.000Z');
    const once = recordPageVisit(initial, steps[0], '2026-01-02T00:00:00.000Z');
    const twice = recordPageVisit(once, steps[0], '2026-01-03T00:00:00.000Z');
    const later = recordPageVisit(twice, steps[2], '2026-01-04T00:00:00.000Z');

    expect(twice.visitedPages).toEqual([{ lessonId: 'lesson-one', pageIds: ['page-one'] }]);
    expect(getVisitedPageCount(later, lessons)).toBe(2);
    expect(getPageProgressPercent(later, lessons)).toBe(67);
    expect(getPageProgressPercent(later, [{ id: 'lesson-one', pages: [{ id: 'page-one' }] }])).toBe(100);
  });

  it('preserves lesson and course completion when revisiting earlier pages', () => {
    const initial = createCourseProgress(course);
    const withLesson = completeLesson(initial, 'lesson-one', '2026-01-02T00:00:00.000Z');
    const withCourse = completeCourse(withLesson, '2026-01-03T00:00:00.000Z');
    const revisited = recordPageVisit(withCourse, steps[0], '2026-01-04T00:00:00.000Z');

    expect(revisited.completedLessons).toEqual([{ lessonId: 'lesson-one', completedAt: '2026-01-02T00:00:00.000Z' }]);
    expect(revisited.courseCompletedAt).toBe('2026-01-03T00:00:00.000Z');
    expect(revisited.lastLocation).toEqual({ kind: 'page', lessonId: 'lesson-one', pageId: 'page-one' });
    expect(completeLesson(withLesson, 'lesson-one', '2026-02-01T00:00:00.000Z')).toBe(withLesson);
    expect(completeCourse(withCourse, '2026-02-01T00:00:00.000Z').courseCompletedAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('retains every quiz attempt, including retakes, in submission order', () => {
    const initial = createCourseProgress(course);
    const first = recordQuizResult(initial, 'lesson-one', {
      attemptId: 'attempt-one', answers: { q1: 'a' }, correct: 1, total: 2, percent: 50, passed: false,
    }, '2026-01-01');
    const retake = recordQuizResult(first, 'lesson-one', {
      attemptId: 'attempt-two', answers: { q1: 'b' }, correct: 2, total: 2, percent: 100, passed: true,
    }, '2026-01-02');

    expect(retake.quizResults).toEqual([
      { lessonId: 'lesson-one', attemptId: 'attempt-one', answers: { q1: 'a' }, correct: 1, total: 2, percent: 50, passed: false, submittedAt: '2026-01-01' },
      { lessonId: 'lesson-one', attemptId: 'attempt-two', answers: { q1: 'b' }, correct: 2, total: 2, percent: 100, passed: true, submittedAt: '2026-01-02' },
    ]);
    expect(recordQuizResult(retake, 'lesson-one', {
      attemptId: 'attempt-two', answers: { q1: 'b' }, correct: 2, total: 2, percent: 100, passed: true,
    })).toBe(retake);
  });

  it('keeps course eligibility tied to quiz passes and retains the highest passing score', () => {
    const quizLessons = [
      { id: 'lesson-one', quiz: {} },
      { id: 'lesson-two', pages: [{}] },
    ];
    const progress = {
      ...createCourseProgress(course),
      completedLessons: [{ lessonId: 'lesson-one' }, { lessonId: 'lesson-two' }],
      quizResults: [
        { lessonId: 'lesson-one', percent: 80, passed: true },
        { lessonId: 'lesson-one', percent: 50, passed: false },
      ],
    };

    expect(areCourseLessonsComplete(progress, quizLessons)).toBe(true);
    expect(getBestPassingScore(progress.quizResults, 'lesson-one')).toBe(80);
    expect(getBestPassingScore([{ lessonId: 'lesson-one', percent: 0, passed: true }], 'lesson-one')).toBe(0);
    expect(getBestPassingScore([], 'lesson-one')).toBeNull();
    expect(areCourseLessonsComplete({ ...progress, quizResults: [{ lessonId: 'lesson-one', percent: 50, passed: false }] }, quizLessons)).toBe(false);
  });
});