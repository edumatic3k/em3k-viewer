import { useState, useEffect, useCallback } from 'preact/hooks';
import { useJsonResource } from './useJsonResource';

export function useCourse(courseSlug) {
  const [course, setCourse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [coursePath, setCoursePath] = useState(null);

  if (!courseSlug) {
    return { loading: false, error: "No course slug provided" };
  }

  // First attempt: Try system courses
  let initialPath = `/content/system/${courseSlug}/course.json`;

  const { data: manifest, loading, error } = useJsonResource(initialPath);

  useEffect(() => {
    if (manifest) {
      // System course loaded successfully
      setCourse(manifest);
      setCoursePath(initialPath);
      console.log(`✅ System course loaded: ${manifest.title}`);
    } else if (error && !loading) {
      // Try library path if system path failed
      const libraryPath = `/content/library/teachers/${manifest?.teacherSlug || 'em3k-system'}/courses/${courseSlug}/course.json`;
      
      // For now we'll need a second useJsonResource, but to keep it simple for this step:
      console.warn("System course not found, trying library path...");
    }
  }, [manifest, error, loading, courseSlug]);

  // Better version with fallback (recommended)
  const systemManifest = useJsonResource(`/content/system/${courseSlug}/course.json`);
  const libraryManifest = useJsonResource(
    courseSlug === 'sample-france' 
      ? `/content/library/teachers/em3k-system/courses/${courseSlug}/course.json`
      : null
  );

  const activeManifest = systemManifest.data || libraryManifest.data;
  const activeError = systemManifest.error && libraryManifest.error;
  const activeLoading = systemManifest.loading || libraryManifest.loading;

  useEffect(() => {
    if (activeManifest) {
      setCourse(activeManifest);
      console.log(`✅ Course loaded: ${activeManifest.title} (${courseSlug})`);
    }
  }, [activeManifest]);

  const currentBlock = course?.sequence?.[currentIndex] || null;

  const getContentPath = (block) => {
    if (!course) return '';
    
    if (course.teacherSlug) {
      return `/content/library/teachers/${course.teacherSlug}/courses/${courseSlug}/`;
    }
    // System course
    return `/content/system/${courseSlug}/`;
  };

  const navigate = {
    next: useCallback(() => {
      if (currentIndex < (course?.sequence?.length || 0) - 1) {
        setCurrentIndex(i => i + 1);
      }
    }, [currentIndex, course]),

    back: useCallback(() => {
      if (currentIndex > 0) setCurrentIndex(i => i - 1);
    }, [currentIndex]),
  };

  return {
    course: activeManifest || course,
    currentBlock,
    currentIndex,
    progress,
    loading: activeLoading,
    error: activeError,
    navigate,
    getContentPath,
    courseSlug,
  };
}