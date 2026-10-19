import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useLibrary } from '../contexts/LibraryContext';
import { loadCoursePackage, releasePackageAssets, resolvePackageAsset } from '../lib/coursePackages';
import { getCourseProgress, saveCourseProgress } from '../lib/courseStorage';
import {
  completeCourse,
  completeLesson,
  getPageProgressPercent,
  locationForStep,
  normalizeCourseProgress,
  recordPageVisit,
  recordQuizResult,
  updateProgressLocation,
} from '../lib/courseProgress';

/** @typedef {{ id: string, heading: string, subhead?: string, blocks: Array<{ type: string, src?: string, images?: Array<{ src: string }> }> }} CoursePage */
/** @typedef {{ id: string, title: string, pages: CoursePage[], quiz?: { title: string, passPercent: number, questions: Array<{ id: string }> } }} CourseLesson */
/** @typedef {{ id: string, title: string, description?: string, lessons: Array<{ id: string, title: string, file: string }> }} CourseManifest */
/** @typedef {{ course: CourseManifest, lessons: CourseLesson[], placement: string, baseUrl: string | null, files: Record<string, Uint8Array> | null, objectUrls?: Map<string, string> }} LoadedCoursePackage */
/** @typedef {{ kind: 'page', lesson: CourseLesson, lessonIndex: number, page: CoursePage, pageIndex: number, pageCount: number } | { kind: 'quiz', lesson: CourseLesson, lessonIndex: number, quiz: NonNullable<CourseLesson['quiz']> }} CourseStep */

/** @param {CourseLesson[]} lessons @returns {CourseStep[]} */
function buildSteps(lessons) {
  return lessons.flatMap((lesson, lessonIndex) => [
    ...lesson.pages.map((page, pageIndex) => ({
      kind: /** @type {'page'} */ ('page'),
      lesson,
      lessonIndex,
      page,
      pageIndex,
      pageCount: lesson.pages.length,
    })),
    ...(lesson.quiz ? [{ kind: /** @type {'quiz'} */ ('quiz'), lesson, lessonIndex, quiz: lesson.quiz }] : []),
  ]);
}

/** @param {string} courseId */
export function useCourse(courseId) {
  const { registry } = useLibrary();
  const [coursePackage, setCoursePackage] = useState(/** @type {LoadedCoursePackage | null} */ (null));
  const [packageRegistry, setPackageRegistry] = useState(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [progress, setProgress] = useState(null);
  const progressRef = useRef(null);
  const openedPageRef = useRef(null);
  const [loadStatus, setLoadStatus] = useState({ courseId: null, registry: null, loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setCoursePackage(null);
      setPackageRegistry(null);
      setStepIndex(-1);
      setProgress(null);
      progressRef.current = null;
      openedPageRef.current = null;
      setLoadStatus({ courseId, registry, loading: true, error: '' });
      if (!courseId || !registry) {
        setLoadStatus({ courseId, registry, loading: false, error: '' });
        return;
      }
      try {
        const [loadedPackage, savedProgress] = await Promise.all([
          loadCoursePackage(courseId, registry),
          getCourseProgress(courseId),
        ]);
        if (cancelled) return;
        const loadedSteps = buildSteps(loadedPackage.lessons);
        const normalized = normalizeCourseProgress(
          savedProgress,
          loadedPackage.course,
          loadedPackage.lessons,
          loadedSteps,
        );
        setCoursePackage(loadedPackage);
        setPackageRegistry(registry);
        setStepIndex(normalized.stepIndex);
        setProgress(normalized.progress);
        progressRef.current = normalized.progress;
        await saveCourseProgress(courseId, normalized.progress);
      } catch (loadError) {
        if (!cancelled) {
          setCoursePackage(null);
          setPackageRegistry(null);
          setStepIndex(-1);
          setProgress(null);
          progressRef.current = null;
          setLoadStatus({
            courseId,
            registry,
            loading: false,
            error: loadError instanceof Error ? loadError.message : String(loadError),
          });
        }
      } finally {
        if (!cancelled) {
          setLoadStatus((status) => ({ ...status, loading: false }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [courseId, registry]);

  useEffect(() => () => {
    if (coursePackage) releasePackageAssets(coursePackage);
  }, [coursePackage]);

  const currentPackage = coursePackage?.course.id === courseId && packageRegistry === registry
    ? coursePackage
    : null;
  const statusIsCurrent = loadStatus.courseId === courseId && loadStatus.registry === registry;
  const loading = !statusIsCurrent || loadStatus.loading || !registry;
  const error = statusIsCurrent ? loadStatus.error : '';
  const steps = currentPackage ? buildSteps(currentPackage.lessons) : [];
  const currentStep = stepIndex < 0 ? null : steps[stepIndex] || null;

  const updateProgress = useCallback((update) => {
    const current = progressRef.current;
    if (!current || !courseId) return Promise.resolve();
    const nextProgress = update(current);
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    return saveCourseProgress(courseId, nextProgress);
  }, [courseId]);

  useEffect(() => {
    if (currentStep?.kind !== 'page' || !progress) return;
    const pageKey = `${courseId}:${currentStep.lesson.id}:${currentStep.page.id}`;
    if (openedPageRef.current === pageKey) return;
    openedPageRef.current = pageKey;
    updateProgress((current) => recordPageVisit(current, currentStep));
  }, [courseId, currentStep?.kind, currentStep?.lesson.id, currentStep?.page?.id, progress, updateProgress]);

  /** @type {(nextIndex: number, completedLessonId?: string|null, completesCourse?: boolean) => Promise<void>} */
  const moveToStep = useCallback(async (nextIndex, completedLessonId = null, completesCourse = false) => {
    const boundedIndex = Math.max(-1, Math.min(nextIndex, steps.length));
    setStepIndex(boundedIndex);
    const location = boundedIndex < 0
      ? { kind: 'intro' }
      : boundedIndex >= steps.length
        ? { kind: 'complete' }
        : locationForStep(steps[boundedIndex]);
    await updateProgress((current) => {
      let nextProgress = updateProgressLocation(current, location);
      if (completedLessonId) nextProgress = completeLesson(nextProgress, completedLessonId);
      if (completesCourse) nextProgress = completeCourse(nextProgress);
      return nextProgress;
    });
  }, [steps, updateProgress]);

  /** @type {(nextIndex: number) => Promise<void>} */
  const goToStep = useCallback((nextIndex) => moveToStep(nextIndex), [moveToStep]);

  const next = useCallback(() => {
    const nextStep = steps[stepIndex + 1];
    const completesLesson = currentStep && nextStep?.lesson.id !== currentStep.lesson.id
      ? currentStep.lesson.id
      : null;
    return moveToStep(stepIndex + 1, completesLesson, stepIndex + 1 >= steps.length);
  }, [currentStep, moveToStep, stepIndex, steps]);
  const back = useCallback(() => moveToStep(stepIndex - 1), [moveToStep, stepIndex]);

  const onQuizResult = useCallback((lessonId, result) => (
    updateProgress((current) => recordQuizResult(current, lessonId, result))
  ), [updateProgress]);

  /** @type {(assetPath: string) => string} */
  const resolveAsset = useCallback((assetPath) => {
    if (/^(?:https?:|data:|blob:)/i.test(assetPath)) return assetPath;
    return currentPackage ? resolvePackageAsset(currentPackage, assetPath) : '';
  }, [currentPackage]);

  return {
    course: currentPackage?.course || null,
    lessons: currentPackage?.lessons || [],
    currentStep,
    steps,
    stepIndex,
    totalSteps: steps.length,
    progressPercent: progress && currentPackage
      ? getPageProgressPercent(progress, currentPackage.lessons)
      : 0,
    courseCompletedAt: progress?.courseCompletedAt || null,
    isCourseIntro: stepIndex < 0,
    completed: stepIndex >= steps.length && steps.length > 0,
    loading,
    error,
    navigate: { next, back, goToStep },
    onQuizResult,
    resolveAsset,
  };
}