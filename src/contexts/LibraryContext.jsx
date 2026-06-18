// @ts-nocheck
import { createContext, useContext, useEffect, useState } from 'preact/compat';
import { useConfig } from './ConfigContext';
import { useJsonResource } from '../hooks/useJsonResource';

const LibraryContext = createContext(null);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  const { contentIndex, isFirstRun, userPrefs } = useConfig();

  const { data: indexData, loading: indexLoading, error: indexError } = useJsonResource(
    '/content/metadata/content-index.json',
    { cache: true }
  );

  // Future: load active courses, installed content, etc.
  const [activeCourses, setActiveCourses] = useState([]);

  useEffect(() => {
    if (indexData?.active) {
      setActiveCourses(indexData.active);
    }
  }, [indexData]);

  // Basic selectors
  const getSystemCourses = () => indexData?.system?.courses || [];
  const getInstalledCourses = () => indexData?.installed?.courses || [];
  const getAllCourses = () => [...getSystemCourses(), ...getInstalledCourses()];

  const getActiveCourses = () => {
    // On first run, show tutorial + sample
    if (isFirstRun || activeCourses.length === 0) {
      return getSystemCourses().concat(getInstalledCourses().slice(0, 1)); // sample-france
    }
    return activeCourses;
  };

  const value = {
    // Data
    contentIndex: indexData,
    activeCourses: getActiveCourses(),
    systemCourses: getSystemCourses(),
    installedCourses: getInstalledCourses(),

    // States
    loading: indexLoading,
    error: indexError,

    // Selectors
    getAllCourses,
    getActiveCourses,
    getSystemCourses,
    getInstalledCourses,

    // Future helpers
    refreshLibrary: () => window.location.reload(), // temporary
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};