import { createContext, useContext, useEffect, useState } from 'preact/compat';
import { importCourseArchive, getAvailableCourses, loadBundledRegistry } from '../lib/coursePackages';
import { removePackage, setCourseActive, setPackageActive } from '../lib/courseStorage';

const LibraryContext = createContext(null);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};

export const LibraryProvider = ({ children }) => {
  const [registry, setRegistry] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshLibrary = async () => {
    setLoading(true);
    setError('');
    try {
      const loadedRegistry = registry || await loadBundledRegistry();
      const availableCourses = await getAvailableCourses(loadedRegistry);
      setRegistry(loadedRegistry);
      setCourses(availableCourses);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLibrary();
  }, []);

  const libraryCourses = courses.filter((course) => course.placement === 'library');
  const activeCourses = libraryCourses.filter((course) => course.active);
  const helpCourses = courses.filter((course) => course.placement === 'help');

  const setCourseActiveState = async (courseId, active) => {
    const course = courses.find((item) => item.id === courseId);
    if (course?.bundled) {
      await setCourseActive(courseId, active);
    } else {
      await setPackageActive(courseId, active);
    }
    await refreshLibrary();
  };

  const uninstallCourse = async (courseId) => {
    const course = courses.find((item) => item.id === courseId);
    if (course?.bundled) {
      await setCourseActive(courseId, false);
    } else {
      await removePackage(courseId);
    }
    await refreshLibrary();
  };

  const importCourse = async (file) => {
    const result = await importCourseArchive(file);
    await refreshLibrary();
    return result.course;
  };

  const value = {
    courses,
    libraryCourses,
    activeCourses,
    helpCourses,
    registry,
    loading,
    error,
    refreshLibrary,
    setCourseActive: setCourseActiveState,
    uninstallCourse,
    importCourse,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};