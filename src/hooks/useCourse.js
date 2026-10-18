import { useCallback, useEffect, useState } from 'preact/hooks';
import { useLibrary } from '../contexts/LibraryContext';
import { loadCoursePackage, releasePackageAssets, resolvePackageAsset } from '../lib/coursePackages';
import { getCourseProgress, saveCourseProgress } from '../lib/courseStorage';

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
  const [loadStatus, setLoadStatus] = useState({ courseId: null, registry: null, loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setCoursePackage(null);
      setPackageRegistry(null);
      setStepIndex(-1);
      setLoadStatus({ courseId, registry, loading: true, error: '' });
      if (!courseId || !registry) {
        setLoadStatus({ courseId, registry, loading: false, error: '' });
        return;
      }
      try {
        const [loadedPackage, progress] = await Promise.all([
          loadCoursePackage(courseId, registry),
          getCourseProgress(courseId),
        ]);
        if (cancelled) return;
        setCoursePackage(loadedPackage);
        setPackageRegistry(registry);
        setStepIndex(progress?.stepIndex ?? -1);
      } catch (loadError) {
        if (!cancelled) {
          setCoursePackage(null);
          setPackageRegistry(null);
          setStepIndex(-1);
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

  /** @type {(nextIndex: number) => Promise<void>} */
  const goToStep = useCallback(async (nextIndex) => {
    const boundedIndex = Math.max(-1, Math.min(nextIndex, steps.length));
    setStepIndex(boundedIndex);
    if (courseId) await saveCourseProgress(courseId, {
      stepIndex: boundedIndex,
      completed: boundedIndex >= steps.length,
      updatedAt: new Date().toISOString(),
    });
  }, [courseId, steps.length]);

  const next = useCallback(() => goToStep(stepIndex + 1), [goToStep, stepIndex]);
  const back = useCallback(() => goToStep(stepIndex - 1), [goToStep, stepIndex]);

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
    isCourseIntro: stepIndex < 0,
    completed: stepIndex >= steps.length && steps.length > 0,
    loading,
    error,
    navigate: { next, back, goToStep },
    resolveAsset,
  };
}