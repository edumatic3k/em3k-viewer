import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useConfig } from '@contexts/ConfigContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { getSaved } from '@utils/storage.js';
import { loadLessonManifest } from '@utils/lessonLoader.js';

// Create the context
const RouteGuardContext = createContext();

/**
 * Hook to consume route guard state and actions.
 * @returns {{ linearModalVisible: boolean, modalLessonId: string|null, modalLessonNumber: number|null, modalAllowedPage: number, currentRoute: string|null, handleRouteChange: function, closeModal: function, showLinearModal: function, checkRouteAccess: function, canAccessLesson: function, isLessonCompleted: function }}
 */
export function useRouteGuard() {
  const context = useContext(RouteGuardContext);
  if (!context) {
    throw new Error('useRouteGuard must be used within a RouteGuardProvider');
  }
  return context;
}

/**
 * Provider component that manages route access logic, linear gating, and student info guard.
 * @param {Object} props
 * @param {import('preact').ComponentChildren} props.children
 */
export function RouteGuardProvider({ children }) {
  const [linearModalVisible, setLinearModalVisible] = useState(false);
  const [modalLessonId, setModalLessonId] = useState(null);
  const [modalLessonNumber, setModalLessonNumber] = useState(null);
  const [modalAllowedPage, setModalAllowedPage] = useState(1);
  const [currentRoute, setCurrentRoute] = useState(null);
  const { journey } = useJourney();
  const { config } = useConfig();

  /**
   * Determine whether all lesson content should be unlocked.
   * Checks both global config and manifest-level overrides.
   * @param {Object|null} manifest
   * @returns {Promise<boolean>}
   */
  const isUnlockAllEnabled = async (manifest) => {
    const cfg = config || {};
    if ((cfg.features && cfg.features.unlockAll) || cfg.unlockAll) {
      return true;
    }
    if (manifest && manifest.settings && (manifest.settings.linear === false || manifest.settings.unlockAll === true)) {
      return true;
    }
    return false;
  };

  /**
   * Return true if the given lesson is already completed.
   * @param {number} lessonNumber
   * @returns {boolean}
   */
  const isLessonCompleted = (lessonNumber) => {
    return journey?.lessonsCompleted?.some(
      lesson => lesson.lessonNumber === lessonNumber
    ) || false;
  };

  /**
   * Determine whether the user may access a lesson based on progression rules.
   * @param {number} lessonNumber
   * @returns {boolean}
   */
  const canAccessLesson = (lessonNumber) => {
    if (!journey) return false;
    if (lessonNumber <= journey.currentLessonNumber) return true;
    return journey.lessonsCompleted?.some(
      lesson => lesson.lessonNumber === lessonNumber - 1
    ) || false;
  };

  /**
   * Check whether a lesson page may be accessed and return redirect details when blocked.
   * @param {number} lessonNumber
   * @param {number} pageNum
   * @returns {{allowed: boolean, redirectPage?: number, lessonNumber?: number}}
   */
  const checkPageAccess = (lessonNumber, pageNum) => {
    if (!journey) {
      if (lessonNumber === 1 && pageNum === 1) {
        return { allowed: true };
      }
      return { allowed: false, redirectPage: 1, lessonNumber: 1 };
    }

    const lessonProgress = journey.lessonProgress?.[lessonNumber];
    const highestPage = lessonProgress?.highestPage ?? 0;
    const isCompleted = isLessonCompleted(lessonNumber);

    if (isCompleted) {
      return { allowed: true };
    }

    if (pageNum <= highestPage + 1) {
      return { allowed: true };
    }

    const currentPageNum = journey.currentPage || highestPage;
    const allowedPage = Math.max(1, Math.min(currentPageNum, highestPage + 1));
    return { allowed: false, redirectPage: allowedPage, lessonNumber };
  };

  /**
   * Check whether the quiz route may be accessed for a lesson.
   * @param {number} lessonNumber
   * @param {Object|null} manifest
   * @returns {{allowed: boolean, redirectPage?: number, lessonNumber?: number}}
   */
  const checkQuizAccess = (lessonNumber, manifest) => {
    const lessonInfo = manifest?.lessons?.find(l => l.number === lessonNumber);
    const totalPages = lessonInfo?.pages || 0;
    const lessonProgress = journey?.lessonProgress?.[lessonNumber];
    const highestPage = lessonProgress?.highestPage ?? 0;
    const lessonComplete = isLessonCompleted(lessonNumber);

    const canTake = lessonComplete || highestPage >= totalPages;
    if (canTake) {
      return { allowed: true };
    }

    const redirectPage = Math.max(1, highestPage + 1);
    return { allowed: false, redirectPage, lessonNumber };
  };

  /**
   * Check whether the answers route may be accessed.
   * @param {number} lessonNumber
   * @returns {{allowed: boolean, redirectPage?: number, lessonNumber?: number}}
   */
  const checkAnswersAccess = (lessonNumber) => {
    if (isLessonCompleted(lessonNumber)) {
      return { allowed: true };
    }
    return { allowed: false, redirectPage: null, lessonNumber };
  };

  /**
   * Central route access guard that evaluates page, quiz, answers, and lesson access.
   * @param {string} lessonId
   * @param {number} lessonNumber
   * @param {string} routeType - 'page' | 'intro' | 'quiz' | 'answers'
   * @param {number} pageNum
   * @returns {Promise<Object>}
   */
  const checkRouteAccess = async (lessonId, lessonNumber, routeType, pageNum) => {
    try {
      // Load manifest once
      const manifest = await loadLessonManifest(lessonId);

      // Check global/manifest unlockAll overrides
      const unlockAll = await isUnlockAllEnabled(manifest);
      if (unlockAll) {
        return { allowed: true, routeType };
      }

      // Check if can access lesson at all
      if (!canAccessLesson(lessonNumber)) {
        const currentLesson = journey?.currentLessonNumber || 1;
        const currentPage = journey?.currentPage || 1;
        return {
          allowed: false,
          routeType: 'lesson',
          redirectLesson: currentLesson,
          redirectPage: currentPage
        };
      }

      // Route-specific access checks
      switch (routeType) {
        case 'page':
          return { ...checkPageAccess(lessonNumber, pageNum), routeType };

        case 'intro':
          return { allowed: true, routeType };

        case 'quiz':
          return { ...checkQuizAccess(lessonNumber, manifest), routeType };

        case 'answers':
          return { ...checkAnswersAccess(lessonNumber), routeType };

        default:
          return { allowed: false, routeType };
      }
    } catch (err) {
      console.error('Route access check error:', err);
      return { allowed: true, routeType }; // Allow on error to prevent blocking
    }
  };

  /**
   * Handle route change events and enforce student info gating when required.
   * @param {Object} e
   */
  const handleRouteChange = async (e) => {
    const url = e && e.url ? e.url : '';
    setCurrentRoute(url);

    // Check student info requirement
    try {
      const cfg = config || {};
      if (cfg.features && cfg.features.studentInfo) {
        const si = getSaved('student_info');
        // Only redirect if: no studentinfo exists AND trying to access lessons AND not already on studentinfo or intro
        if (!si && url.match(/^\/lessons?(\/|$)/) && !url.startsWith('/studentinfo') && !url.startsWith('/intro')) {
          route('/studentinfo', true);
          return;
        }
      }
    } catch (e2) {
      console.warn('Student info guard check failed:', e2);
    }

    // Note: lesson page access is now checked in LessonPageRoute component
  };

  /**
   * Hide the linear progression modal.
   */
  const closeModal = () => {
    setLinearModalVisible(false);
  };

  /**
   * Show the linear progression modal for a lesson.
   * @param {string} lessonId
   * @param {number} lessonNumber
   * @param {number|null} allowedPage
   */
  const showLinearModal = (lessonId, lessonNumber, allowedPage) => {
    setModalLessonId(lessonId);
    setModalLessonNumber(lessonNumber);
    setModalAllowedPage(allowedPage);
    setLinearModalVisible(true);
  };

  const contextValue = {
    // State
    linearModalVisible,
    modalLessonId,
    modalLessonNumber,
    modalAllowedPage,
    currentRoute,
    
    // Actions
    handleRouteChange,
    closeModal,
    showLinearModal,
    checkRouteAccess,
    canAccessLesson,
    isLessonCompleted,
  };

  return (
    <RouteGuardContext.Provider value={contextValue}>
      {children}
    </RouteGuardContext.Provider>
  );
}
