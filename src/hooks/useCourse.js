import { useState, useEffect, useCallback } from 'preact/hooks';
import { useJsonResource } from '../hooks/useJsonResource';

export function useCourse(courseSlug, variant = 'default') {
  const [course, setCourse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});

  // Load course manifest
  const coursePath = `/content/library/teachers/em3k-system/courses/${courseSlug}/course.json`;
  const { data: manifest, loading, error } = useJsonResource(coursePath);

  useEffect(() => {
    if (manifest) {
      setCourse(manifest);
      // TODO: Load saved progress from local storage / Dexie
      // setProgress(savedProgress || {});
    }
  }, [manifest]);

  const currentBlock = course?.sequence?.[currentIndex] || null;

  const navigate = {
    next: useCallback(() => {
      if (currentIndex < (course?.sequence?.length || 0) - 1) {
        setCurrentIndex(prev => prev + 1);
        // TODO: Save progress
      }
    }, [currentIndex, course]),

    back: useCallback(() => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }, [currentIndex]),

    goTo: useCallback((index) => {
      if (index >= 0 && index < (course?.sequence?.length || 0)) {
        setCurrentIndex(index);
      }
    }, [course]),
  };

  const isComplete = currentIndex === (course?.sequence?.length || 0) - 1;

  return {
    course,
    currentBlock,
    currentIndex,
    progress,
    loading,
    error,
    navigate,
    isComplete,
    // Helper to get full content path for a block
    getContentPath: (block) => {
      if (!block) return null;
      if (block.folder) {
        return `/content/library/teachers/em3k-system/courses/${course.slug}/${block.folder}/`;
      }
      return `/content/library/teachers/em3k-system/courses/${course.slug}/`;
    }
  };
}