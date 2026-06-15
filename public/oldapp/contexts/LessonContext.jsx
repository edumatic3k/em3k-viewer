import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { loadLessonManifest, loadPageJson, getPagesList } from '@utils/lessonLoader.js';
import { saveData } from '@utils/storage.js';

// Create the context
const LessonContext = createContext();

// Custom hook to use the lesson context
export function useLessonData() {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessonData must be used within a LessonProvider');
  }
  return context;
}

// Lesson Provider component
export function LessonProvider({ children, lessonId }) {
  const { journey } = useJourney();
  const [manifest, setManifest] = useState(null);
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (lessonId) {
      loadLessonData(lessonId);
    } else {
      // No lesson ID, reset state
      setManifest(null);
      setPages({});
      setLoading(false);
      setError(null);
    }
  }, [lessonId]);

  const loadLessonData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress({ loaded: 0, total: 0 });

      // console.log(`Loading lesson data for: ${id}`);

      // 1. Load the manifest first
      const manifestData = await loadLessonManifest(id);
      if (!manifestData) {
        throw new Error(`Failed to load manifest for lesson ${id}`);
      }

      setManifest(manifestData);
      
      // 2. Get list of all pages to preload
      const pagesList = getPagesList(manifestData);
      const totalPages = pagesList.length;
      setLoadingProgress({ loaded: 0, total: totalPages });

      // 3. Preload all page content
      const loadedPages = {};
      let loadedCount = 0;

      for (const pageInfo of pagesList) {
        let pageData = null;
        
        // Handle different page types
        if (pageInfo.type === 'intro' && pageInfo.filename) {
          pageData = await loadPageJson(id, pageInfo.filename);
        } else if (pageInfo.type === 'page' && pageInfo.filename) {
          pageData = await loadPageJson(id, pageInfo.filename);
        } else if (pageInfo.type === 'quiz' && pageInfo.filename) {
          pageData = await loadPageJson(id, pageInfo.filename);
        }

        if (pageData) {
          // Create a key for this page
          const pageKey = pageInfo.type === 'intro' 
            ? `lesson-${pageInfo.lessonNumber}-intro`
            : pageInfo.type === 'quiz'
            ? `lesson-${pageInfo.lessonNumber}-quiz`
            : `lesson-${pageInfo.lessonNumber}-page-${pageInfo.page}`;
          
          loadedPages[pageKey] = {
            ...pageData,
            _meta: pageInfo
          };
        }

        loadedCount++;
        setLoadingProgress({ loaded: loadedCount, total: totalPages });
      }

      setPages(loadedPages);
      
      // Cache the lesson data
      const cacheData = {
        manifest: manifestData,
        pages: loadedPages,
        loadedAt: Date.now(),
        lessonId: id
      };
      saveData(`lesson-cache-${id}`, cacheData);

      // console.log(`Successfully loaded ${Object.keys(loadedPages).length} pages for lesson ${id}`);

    } catch (err) {
      console.error('Lesson loading error:', err);
      setError(err.message || 'Failed to load lesson data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current lesson number from journey
  const getCurrentLessonNumber = () => {
    try {
      return journey?.currentLessonNumber || 1;
    } catch (e) {
      return 1;
    }
  };

  // Helper function to get a specific page
  const getPage = (lessonNumber, pageNumber) => {
    // If lessonNumber not specified, use current lesson from journey
    const actualLessonNum = lessonNumber || getCurrentLessonNumber();
    const pageKey = `lesson-${actualLessonNum}-page-${pageNumber}`;
    return pages[pageKey] || null;
  };

  // Helper function to get intro page
  const getIntroPage = (lessonNumber) => {
    const actualLessonNum = lessonNumber || getCurrentLessonNumber();
    const pageKey = `lesson-${actualLessonNum}-intro`;
    return pages[pageKey] || null;
  };

  // Helper function to get quiz page
  const getQuizPage = (lessonNumber) => {
    const actualLessonNum = lessonNumber || getCurrentLessonNumber();
    const pageKey = `lesson-${actualLessonNum}-quiz`;
    return pages[pageKey] || null;
  };

  // Helper function to get lesson info by number
  const getLessonInfo = (lessonNumber) => {
    if (!manifest || !manifest.lessons) return null;
    const actualLessonNum = lessonNumber || getCurrentLessonNumber();
    return manifest.lessons.find(lesson => lesson.number === actualLessonNum);
  };

  // Get all lessons in this manifest
  const getLessons = () => {
    return manifest?.lessons || [];
  };

  const contextValue = {
    // Data
    manifest,
    pages,
    lessonId,
    
    // Loading states
    loading,
    error,
    loadingProgress,
    
    // Helper functions
    getPage,
    getIntroPage,
    getQuizPage,
    getLessonInfo,
    getLessons,
    
    // Actions
    reload: () => loadLessonData(lessonId)
  };

  return (
    <LessonContext.Provider value={contextValue}>
      {children}
    </LessonContext.Provider>
  );
}

// Loading component for lessons
export function LessonLoader({ children, fallback }) {
  const { loading, error, loadingProgress } = useLessonData();

  if (loading) {
    const progressText = loadingProgress.total > 0 
      ? `Loading lesson content... (${loadingProgress.loaded}/${loadingProgress.total})`
      : 'Loading lesson...';
      
    return fallback || (
      <div className="p-4 text-center">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {progressText}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 alert alert-danger">
        <h4>Lesson Loading Error</h4>
        <p>{error}</p>
        <p>Please check that the lesson files exist and are valid JSON.</p>
      </div>
    );
  }

  return children;
}