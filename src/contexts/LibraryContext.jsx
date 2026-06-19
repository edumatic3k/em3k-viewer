import { createContext, useContext, useEffect, useState } from 'preact/compat';
import { useConfig } from './ConfigContext';
import { useJsonResource } from '../hooks/useJsonResource';

/**
 * @typedef {{ slug: string, name?: string, teacherSlug?: string }} Course
 * @typedef {{
 *   active?: Course[],
 *   system?: { courses?: Course[] },
 *   installed?: { courses?: Course[] }
 * }} ContentIndexData
 * @typedef {{
 *   contentIndex: ContentIndexData | null,
 *   activeCourses: Course[],
 *   systemCourses: Course[],
 *   installedCourses: Course[],
 *   loading: boolean,
 *   error: any,
 *   getAllCourses: () => Course[],
 *   getActiveCourses: () => Course[],
 *   getSystemCourses: () => Course[],
 *   getInstalledCourses: () => Course[],
 *   refreshLibrary: () => void
 * }} LibraryContextValue
 */

const LibraryContext = createContext(/** @type {LibraryContextValue | null} */ (null));

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
/**
 * @param {object} props
 * @param {import('preact').ComponentChildren} props.children
 */
export const LibraryProvider = ({ children }) => {
  const { isFirstRun } = useConfig();

  /** @type {{ data: ContentIndexData | null, loading: boolean, error: any }} */
  const { data: indexData, loading: indexLoading, error: indexError } = useJsonResource(
    '/content/metadata/content-index.json',
    { cache: true }
  );

  const [activeCourses, setActiveCourses] = useState(/** @type {Course[]} */ ([]));

  useEffect(() => {
    if (Array.isArray(indexData?.active)) {
      setActiveCourses(/** @type {Course[]} */ (indexData.active));
    }
  }, [indexData]);

  const getSystemCourses = () => /** @type {Course[]} */ (indexData?.system?.courses || []);
  const getInstalledCourses = () => /** @type {Course[]} */ (indexData?.installed?.courses || []);
  const getAllCourses = () => [...getSystemCourses(), ...getInstalledCourses()];

  const getActiveCourses = () => {
    if (isFirstRun || activeCourses.length === 0) {
      return getSystemCourses().concat(getInstalledCourses().slice(0, 1));
    }
    return activeCourses;
  };

  const value = {
    contentIndex: indexData,
    activeCourses: getActiveCourses(),
    systemCourses: getSystemCourses(),
    installedCourses: getInstalledCourses(),
    loading: indexLoading,
    error: indexError,
    getAllCourses,
    getActiveCourses,
    getSystemCourses,
    getInstalledCourses,
    refreshLibrary: () => window.location.reload(),
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};