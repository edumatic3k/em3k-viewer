import { useState, useEffect, useCallback } from 'preact/hooks';
import { useJsonResource } from './useJsonResource';

export function useCourse(courseSlug) {
  const [course, setCourse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});

  if (!courseSlug) {
    return { loading: false, error: "No course slug" };
  }

  // Smart path detection
  const isSystemCourse = courseSlug.includes('tutorial') || courseSlug.startsWith('system-');
  const coursePath = isSystemCourse 
    ? `/content/system/${courseSlug}/course.json`
    : `/content/library/teachers/em3k-system/courses/${courseSlug}/course.json`;

  const { data: manifest, loading, error } = useJsonResource(coursePath);

  useEffect(() => {
    if (manifest) {
      setCourse(manifest);
      console.log(`✅ Course loaded successfully: ${manifest.title}`);
      console.log('Path used:', coursePath);
    }
    if (error) {
      console.error('Failed to load course from:', coursePath, error);
    }
  }, [manifest, error, coursePath]);

  const currentBlock = course?.sequence?.[currentIndex] || null;

  const navigate = {
    next: useCallback(() => {
      if (currentIndex < (course?.sequence?.length || 0) - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, [currentIndex, course]),

    back: useCallback(() => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }, [currentIndex]),
  };

  const getContentPath = () => {
    return isSystemCourse 
      ? `/content/system/${courseSlug}/`
      : `/content/library/teachers/em3k-system/courses/${courseSlug}/`;
  };

  return {
    course,
    currentBlock,
    currentIndex,
    progress,
    loading,
    error,
    navigate,
    getContentPath,
  };
}