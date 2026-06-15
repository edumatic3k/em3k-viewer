import { createContext } from 'preact';
import { useContext, useState, useEffect, useCallback } from 'preact/hooks';
import { useConfig } from '@contexts/ConfigContext.jsx';
import { getSaved, saveData } from '@utils/storage.js';
import { generateNewCode } from '@utils/token.js';

/**
 * Journey Context - Master progress tracker for the entire application
 * 
 * The journey object structure:
 * {
 *   jid: string,                    // Unique journey ID (token)
 *   starttime: ISO timestamp,       // When journey began
 *   lastchange: ISO timestamp,      // Last update time
 *   currentLessonId: string,        // Current lesson set (e.g., "tutorial")
 *   currentLessonNumber: number,    // Current lesson number within set (1, 2, 3...)
 *   currentPage: number,            // Current page within lesson
 *   currentUrl: string,             // Current route URL
 *   lessonsCompleted: [{            // Array of completed lessons with details
 *     lessonNumber: number,
 *     completedAt: ISO timestamp,
 *     quizScore: number | null,     // Quiz score percentage if quiz was taken
 *     quizPassed: boolean,
 *     timeSpent: number,            // Total time in seconds
 *     quizData: {                   // Complete quiz results (if quiz was taken)
 *       answers: {},                // User's answers
 *       score: {                    // Score details
 *         earnedPoints: number,
 *         totalPoints: number,
 *         scorePct: number,
 *         passed: boolean
 *       },
 *       quizInfo: {}                // Quiz metadata (title, grading, etc.)
 *     }
 *   }],
 *   lessonProgress: {               // Per-lesson highest page reached
 *     1: { highestPage: 5, lastVisited: timestamp },
 *     2: { highestPage: 2, lastVisited: timestamp }
 *   }
 * }
 */

const JourneyContext = createContext();

/**
 * Hook to consume journey state and actions from JourneyContext.
 * @returns {{ journey: Object|null, isInitialized: boolean, isLessonCompleted: function, canAccessLesson: function, canAccessPage: function, getHighestPage: function, areAllLessonsComplete: function, getLessonQuizData: function, updateCurrentPosition: function, updateLessonProgress: function, completeLesson: function, advanceToNextLesson: function, resetJourney: function, resetToFirstLesson: function, setEndTime: function, refresh: function }}
 */
export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}

/**
 * Provider component for journey progress state.
 * @param {Object} props
 * @param {import('preact').ComponentChildren} props.children
 */
export function JourneyProvider({ children }) {
  const [journey, setJourneyState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { config } = useConfig();

  /**
   * Persist journey state to localStorage and update React state.
   * @param {function|Object} updater - Either a new journey object or an updater function.
   */
  const persistJourney = useCallback((updater) => {
    setJourneyState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next) {
        next.lastchange = new Date().toISOString();
        saveData('journey', next);
      }
      return next;
    });
  }, []);

  /**
   * Initialize journey state from storage or create a new journey record.
   * @returns {void}
   */
  const initializeJourney = useCallback(() => {
    try {
      let existingJourney = getSaved('journey');
      
      // If journey exists and is valid, use it
      if (existingJourney && existingJourney.jid) {
        // Migrate old journey structure if needed
        if (!existingJourney.lessonsCompleted) {
          existingJourney = migrateJourney(existingJourney);
        }
        setJourneyState(existingJourney);
        setIsInitialized(true);
        return;
      }

      // Create new journey
      const defaultLessonId = config?.defaultLesson || 'tutorial';

      const newJourney = {
        jid: generateNewCode(),
        starttime: new Date().toISOString(),
        lastchange: new Date().toISOString(),
        currentLessonId: defaultLessonId,
        currentLessonNumber: 1,
        currentPage: 1,
        currentUrl: `/lessons/${defaultLessonId}/page/1`,
        lessonsCompleted: [],
        lessonProgress: {}
      };

      saveData('journey', newJourney);
      setJourneyState(newJourney);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize journey:', error);
      setIsInitialized(true); // Still mark as initialized to prevent infinite loop
    }
  }, [config]);

  // Initialize journey once config is available
  useEffect(() => {
    if (config) {
      initializeJourney();
    }
  }, [config, initializeJourney]);

  // Migrate old journey structure to new format
  const migrateJourney = (oldJourney) => {
    return {
      jid: oldJourney.jid || generateNewCode(),
      starttime: oldJourney.starttime || new Date().toISOString(),
      lastchange: new Date().toISOString(),
      currentLessonId: oldJourney.lesson || 'tutorial',
      currentLessonNumber: oldJourney.currentLessonNumber || 1,
      currentPage: oldJourney.page || 1,
      currentUrl: oldJourney.url || '/',
      lessonsCompleted: oldJourney.completedLessons?.map(num => ({
        lessonNumber: num,
        completedAt: new Date().toISOString(),
        quizScore: null,
        quizPassed: false,
        timeSpent: 0
      })) || [],
      lessonProgress: oldJourney.lessonProgress || {}
    };
  };

  /**
   * Update the current lesson/page position in the journey.
   * @param {string} lessonId
   * @param {number} lessonNumber
   * @param {number} page
   * @param {string} url
   */
  const updateCurrentPosition = useCallback((lessonId, lessonNumber, page, url) => {
    persistJourney((prev) => ({
      ...prev,
      currentLessonId: lessonId,
      currentLessonNumber: lessonNumber,
      currentPage: page,
      currentUrl: url
    }));
  }, [persistJourney]);

  /**
   * Record progress for the current lesson, preserving the highest page reached.
   * @param {number} lessonNumber
   * @param {number} pageNumber
   */
  const updateLessonProgress = useCallback((lessonNumber, pageNumber) => {
    persistJourney((prev) => {
      const currentProgress = prev.lessonProgress[lessonNumber] || { highestPage: 0 };
      
      return {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonNumber]: {
            highestPage: Math.max(currentProgress.highestPage, pageNumber),
            lastVisited: new Date().toISOString()
          }
        }
      };
    });
  }, [persistJourney]);

  // Back-compat: get number of pages for a lesson from config
  const getNumberOfPages = useCallback((lessonNum) => {
    if (!config || !config.lessons || !Array.isArray(config.lessons)) return null;
    const lesson = config.lessons.find(l => l.number === Number(lessonNum));
    return lesson ? lesson.pages : null;
  }, [config]);

  // Back-compat: update stored total page count in journey if present
  const updatePageTotal = useCallback(() => {
    const j = getSaved('journey');
    if (!j) return;
    const total = getNumberOfPages(j.currentLessonNumber || j.lesson);
    if (j.total !== undefined) {
      const next = { ...j, total };
      saveData('journey', next);
      setJourneyState(next);
    }
  }, [getNumberOfPages]);

  // Back-compat: update elapsed time and store in legacy 'progress' object
  const updateElapsedTime = useCallback((lnum) => {
    const sdo = getSaved('journey');
    if (!sdo) return false;
    sdo.endtime = new Date().toISOString();
    const start = new Date(sdo.starttime);
    const end = new Date(sdo.endtime);
    const diffMs = end - start;
    const diffSecs = Math.floor(diffMs/1000);
    const diffMins = (diffMs/(1000*60)).toFixed(2);
    const diffHrs = (diffMs/(1000*60*60)).toFixed(2);
    let pdo = getSaved('progress') || { jid: sdo.jid, lesson: [], lastvisit: null };
    let li = pdo.lesson.findIndex(l => l.number === lnum);
    if (li === -1) {
      pdo.lesson.push({ number: lnum, totaltime: [{ totalhrs: diffHrs, totalmins: diffMins, totalsecs: diffSecs }], quizpass: false, score: '', status: 'pending' });
    } else {
      if ((pdo.lesson[li].totaltime || []).length === 0) {
        pdo.lesson[li].totaltime.push({ totalhrs: diffHrs, totalmins: diffMins, totalsecs: diffSecs });
        pdo.lesson[li].status = 'pending';
      }
    }
    pdo.lastvisit = new Date().toISOString();
    saveData('progress', pdo);
    return true;
  }, []);

  /**
   * Mark a specific lesson as completed and optionally attach quiz data.
   * @param {number} lessonNumber
   * @param {Object|null} quizData
   */
  const completeLesson = useCallback((lessonNumber, quizData = null) => {
    persistJourney((prev) => {
      // Check if already completed
      const alreadyCompleted = prev.lessonsCompleted.some(
        lesson => lesson.lessonNumber === lessonNumber
      );

      if (alreadyCompleted) {
        // Update existing completion data (e.g., retaking quiz)
        return {
          ...prev,
          lessonsCompleted: prev.lessonsCompleted.map(lesson =>
            lesson.lessonNumber === lessonNumber
              ? {
                  ...lesson,
                  quizScore: quizData?.score ?? lesson.quizScore,
                  quizPassed: quizData?.passed ?? lesson.quizPassed,
                  quizData: quizData?.fullQuizData ?? lesson.quizData,
                  completedAt: new Date().toISOString()
                }
              : lesson
          )
        };
      }

      // Add new completion
      return {
        ...prev,
        lessonsCompleted: [
          ...prev.lessonsCompleted,
          {
            lessonNumber,
            completedAt: new Date().toISOString(),
            quizScore: quizData?.score ?? null,
            quizPassed: quizData?.passed ?? false,
            quizData: quizData?.fullQuizData ?? null,
            timeSpent: calculateTimeSpent(prev.starttime)
          }
        ]
      };
    });
  }, [persistJourney]);

  /**
   * Advance the journey to the next lesson if available.
   * @param {Object} manifest - Lesson manifest containing lesson metadata.
   */
  const advanceToNextLesson = useCallback((manifest) => {
    persistJourney((prev) => {
      const currentNum = prev.currentLessonNumber;
      const totalLessons = manifest?.lessons?.length || 0;
      
      // Don't advance if already at last lesson
      if (currentNum >= totalLessons) {
        return prev;
      }

      return {
        ...prev,
        currentLessonNumber: currentNum + 1,
        currentPage: 1
      };
    });
  }, [persistJourney]);

  /**
   * Determine whether the specified lesson is marked complete.
   * @param {number} lessonNumber
   * @returns {boolean}
   */
  const isLessonCompleted = useCallback((lessonNumber) => {
    return journey?.lessonsCompleted?.some(
      lesson => lesson.lessonNumber === lessonNumber
    ) || false;
  }, [journey]);

  /**
   * Determine whether the user may access the requested lesson.
   * @param {number} lessonNumber
   * @returns {boolean}
   */
  const canAccessLesson = useCallback((lessonNumber) => {
    if (!journey) return false;

    // Can always access current lesson or any completed lesson
    if (lessonNumber <= journey.currentLessonNumber) {
      return true;
    }

    // Check if previous lesson is completed
    return isLessonCompleted(lessonNumber - 1);
  }, [journey, isLessonCompleted]);

  /**
   * Determine whether the user may access a specific page in a lesson.
   * @param {number} lessonNumber
   * @param {number} pageNumber
   * @returns {boolean}
   */
  const canAccessPage = useCallback((lessonNumber, pageNumber) => {
    if (!journey) return false;

    // Check if can access the lesson first
    if (!canAccessLesson(lessonNumber)) {
      return false;
    }

    // If it's a completed lesson, allow all pages
    if (isLessonCompleted(lessonNumber)) {
      return true;
    }

    // For current/in-progress lesson, check page progress
    const lessonProgress = journey.lessonProgress[lessonNumber];
    
    // If no progress yet, only allow page 1
    if (!lessonProgress) {
      return pageNumber === 1;
    }

    // Allow access up to (highest + 1) to enable progression
    return pageNumber <= lessonProgress.highestPage + 1;
  }, [journey, canAccessLesson, isLessonCompleted]);

  /**
   * Return the highest unlocked page number for a given lesson.
   * @param {number} lessonNumber
   * @returns {number}
   */
  const getHighestPage = useCallback((lessonNumber) => {
    if (!journey) return 0;
    return journey.lessonProgress[lessonNumber]?.highestPage || 0;
  }, [journey]);

  /**
   * Determine whether the user has completed all lessons in the manifest.
   * @param {Object} manifest
   * @returns {boolean}
   */
  const areAllLessonsComplete = useCallback((manifest) => {
    if (!journey || !manifest?.lessons) return false;
    const totalLessons = manifest.lessons.length;
    return journey.lessonsCompleted.length >= totalLessons;
  }, [journey]);

  /**
   * Retrieve stored quiz data for a completed lesson.
   * @param {number} lessonNumber
   * @returns {Object|null}
   */
  const getLessonQuizData = useCallback((lessonNumber) => {
    if (!journey) return null;
    return journey.lessonsCompleted.find(
      lesson => lesson.lessonNumber === lessonNumber
    ) || null;
  }, [journey]);

  /**
   * Reset the journey to a fresh initial state.
   */
  const resetJourney = useCallback(() => {
    const defaultLessonId = config?.defaultLesson || 'tutorial';

    const newJourney = {
      jid: generateNewCode(),
      starttime: new Date().toISOString(),
      lastchange: new Date().toISOString(),
      currentLessonId: defaultLessonId,
      currentLessonNumber: 1,
      currentPage: 1,
      currentUrl: `/lessons/${defaultLessonId}/page/1`,
      lessonsCompleted: [],
      lessonProgress: {}
    };

    saveData('journey', newJourney);
    setJourneyState(newJourney);
  }, [config]);
  
  /**
   * Reset the current lesson position to the first lesson/page.
   */
  const resetToFirstLesson = useCallback(() => {
    persistJourney((prev) => ({
      ...prev,
      currentLessonNumber: 1,
      currentPage: 1
    }));
  }, [persistJourney]);

  /**
   * Record an end timestamp for the current journey.
   * @param {string} isoString - ISO formatted end time (optional)
   */
  const setEndTime = useCallback((isoString) => {
    persistJourney((prev) => ({
      ...prev,
      endtime: isoString || new Date().toISOString()
    }));
  }, [persistJourney]);

  const contextValue = {
    // State
    journey,
    isInitialized,
    
    // Getters
    isLessonCompleted,
    canAccessLesson,
    canAccessPage,
    getHighestPage,
    areAllLessonsComplete,
    getLessonQuizData,
    
    // Actions
    updateCurrentPosition,
    updateLessonProgress,
    completeLesson,
    advanceToNextLesson,
    resetJourney,
    resetToFirstLesson,
    setEndTime,
    
    // Raw access for debugging
    refresh: initializeJourney
  };

  return (
    <JourneyContext.Provider value={contextValue}>
      {children}
    </JourneyContext.Provider>
  );
}

// Helper function to calculate time spent
function calculateTimeSpent(startTime) {
  try {
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000); // seconds
  } catch (e) {
    return 0;
  }
}
