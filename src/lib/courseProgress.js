export const COURSE_PROGRESS_FORMAT_VERSION = 1;

export function createCourseProgress(course, now = new Date().toISOString()) {
  return {
    formatVersion: COURSE_PROGRESS_FORMAT_VERSION,
    courseId: course.id,
    courseVersion: course.version,
    lastLocation: { kind: 'intro' },
    visitedPages: [],
    completedLessons: [],
    quizResults: [],
    courseCompletedAt: null,
    updatedAt: now,
  };
}

export function locationForStep(step) {
  if (!step) return { kind: 'intro' };
  return step.kind === 'page'
    ? { kind: 'page', lessonId: step.lesson.id, pageId: step.page.id }
    : { kind: 'quiz', lessonId: step.lesson.id };
}

export function resolveProgressLocation(location, lessons, steps) {
  if (location?.kind === 'intro') return -1;
  if (location?.kind === 'complete') return steps.length;

  const lesson = lessons.find((item) => item.id === location?.lessonId);
  if (!lesson) return -1;

  const exactStepIndex = steps.findIndex((step) => (
    step.lesson.id === location.lessonId
    && (location.kind === 'page'
      ? step.kind === 'page' && step.page.id === location.pageId
      : location.kind === 'quiz' && step.kind === 'quiz')
  ));
  if (exactStepIndex >= 0) return exactStepIndex;

  return steps.findIndex((step) => step.lesson.id === lesson.id);
}

export function normalizeCourseProgress(saved, course, lessons, steps, now = new Date().toISOString()) {
  if (saved?.formatVersion === COURSE_PROGRESS_FORMAT_VERSION) {
    const progress = {
      ...createCourseProgress(course, now),
      ...saved,
      courseId: course.id,
      courseVersion: course.version,
      visitedPages: Array.isArray(saved.visitedPages)
        ? saved.visitedPages
          .filter((item) => item && typeof item.lessonId === 'string' && Array.isArray(item.pageIds))
          .map((item) => ({
            lessonId: item.lessonId,
            pageIds: [...new Set(item.pageIds.filter((pageId) => typeof pageId === 'string'))],
          }))
        : [],
      completedLessons: Array.isArray(saved.completedLessons)
        ? saved.completedLessons.filter((item) => item && typeof item.lessonId === 'string')
        : [],
      quizResults: Array.isArray(saved.quizResults)
        ? saved.quizResults.filter((item) => item && typeof item.lessonId === 'string')
        : [],
      lastLocation: saved.lastLocation && typeof saved.lastLocation.kind === 'string'
        ? saved.lastLocation
        : { kind: 'intro' },
      courseCompletedAt: saved.courseCompletedAt || null,
      updatedAt: saved.updatedAt || now,
    };
    const stepIndex = resolveProgressLocation(progress.lastLocation, lessons, steps);
    if (progress.lastLocation.kind === 'page' || progress.lastLocation.kind === 'quiz') {
      progress.lastLocation = stepIndex < 0 ? { kind: 'intro' } : locationForStep(steps[stepIndex]);
    }
    return { progress, stepIndex };
  }

  const legacyIndex = saved?.stepIndex;
  const legacyStep = Number.isInteger(legacyIndex) && legacyIndex >= 0 && legacyIndex < steps.length
    ? steps[legacyIndex]
    : null;
  const isCompleted = saved?.completed === true;
  const progress = {
    ...createCourseProgress(course, now),
    lastLocation: isCompleted
      ? { kind: 'complete' }
      : legacyStep
        ? locationForStep(legacyStep)
        : { kind: 'intro' },
    courseCompletedAt: isCompleted ? saved.updatedAt || now : null,
    updatedAt: saved?.updatedAt || now,
  };
  return { progress, stepIndex: resolveProgressLocation(progress.lastLocation, lessons, steps) };
}

export function recordPageVisit(progress, step, now = new Date().toISOString()) {
  if (step?.kind !== 'page') return progress;
  const lessonPages = progress.visitedPages.find((item) => item.lessonId === step.lesson.id);
  const alreadyVisited = lessonPages?.pageIds.includes(step.page.id) || false;
  const visitedPages = alreadyVisited
    ? progress.visitedPages
    : lessonPages
      ? progress.visitedPages.map((item) => item.lessonId === step.lesson.id
        ? { ...item, pageIds: [...item.pageIds, step.page.id] }
        : item)
      : [...progress.visitedPages, { lessonId: step.lesson.id, pageIds: [step.page.id] }];
  return {
    ...progress,
    lastLocation: locationForStep(step),
    visitedPages,
    updatedAt: now,
  };
}

export function updateProgressLocation(progress, location, now = new Date().toISOString()) {
  return { ...progress, lastLocation: location, updatedAt: now };
}

export function completeLesson(progress, lessonId, now = new Date().toISOString()) {
  if (progress.completedLessons.some((item) => item.lessonId === lessonId)) return progress;
  return {
    ...progress,
    completedLessons: [...progress.completedLessons, { lessonId, completedAt: now }],
    updatedAt: now,
  };
}

export function completeCourse(progress, now = new Date().toISOString()) {
  return {
    ...progress,
    lastLocation: { kind: 'complete' },
    courseCompletedAt: progress.courseCompletedAt || now,
    updatedAt: now,
  };
}

export function recordQuizResult(progress, lessonId, result, now = new Date().toISOString()) {
  return {
    ...progress,
    quizResults: [...progress.quizResults, {
      lessonId,
      score: result.correct,
      total: result.total,
      percent: result.percent,
      passed: result.passed,
      submittedAt: now,
    }],
    updatedAt: now,
  };
}

export function getVisitedPageCount(progress, lessons) {
  const currentPages = new Map(lessons.map((lesson) => [
    lesson.id,
    new Set(lesson.pages.map((page) => page.id)),
  ]));
  return progress.visitedPages.reduce((count, lessonPages) => {
    const currentIds = currentPages.get(lessonPages.lessonId);
    if (!currentIds) return count;
    return count + new Set(lessonPages.pageIds.filter((pageId) => currentIds.has(pageId))).size;
  }, 0);
}

export function getPageProgressPercent(progress, lessons) {
  const pageCount = lessons.reduce((count, lesson) => count + lesson.pages.length, 0);
  return pageCount === 0 ? 0 : Math.min(100, Math.round((getVisitedPageCount(progress, lessons) / pageCount) * 100));
}