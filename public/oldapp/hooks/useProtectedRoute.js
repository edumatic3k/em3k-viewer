import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useRouteGuard } from '@contexts/RouteGuardContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';

/**
 * Custom hook to handle protected route access checks.
 * Delegates all access logic to RouteGuardContext.checkRouteAccess().
 * 
 * @param {string} lessonId - The lesson set ID (e.g., 'tutorial')
 * @param {number} lessonNum - The lesson number
 * @param {Object} options - Configuration options
 * @param {string} options.routeType - Type of route: 'page', 'quiz', 'answers', 'intro'
 * @param {number} [options.pageNum] - Page number (for 'page' routes only)
 * @returns {Object} { checking, allowed }
 */
export function useProtectedRoute(lessonId, lessonNum, options = {}) {
  
  const { routeType, pageNum } = options;
  const { showLinearModal, checkRouteAccess } = useRouteGuard();
  const { isInitialized } = useJourney();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Wait for journey to initialize before checking access
      if (!isInitialized) {
        return; // Stay in checking state until journey is ready
      }
      
      // Single unified access check (manifest loaded once, all checks centralized)
      const result = await checkRouteAccess(lessonId, lessonNum, routeType, pageNum);

      if (!mounted) return;

      if (result.allowed) {
        setAllowed(true);
        setChecking(false);
      } else {
        // Handle redirect based on result
        if (result.routeType === 'lesson') {
          // Can't access lesson at all
          showLinearModal(lessonId, result.redirectLesson, result.redirectPage);
          route(`/lessons/${lessonId}/${result.redirectLesson}/page/${result.redirectPage}`, true);
        } else if (result.redirectPage) {
          // Can access lesson but not specific page/quiz/answers
          if (result.routeType === 'answers') {
            // Redirect to quiz if can't access answers
            showLinearModal(lessonId, lessonNum, null);
            route(`/lessons/${lessonId}/${lessonNum}/quiz`, true);
          } else {
            // Redirect to allowed page
            showLinearModal(lessonId, lessonNum, result.redirectPage);
            route(`/lessons/${lessonId}/${lessonNum}/page/${result.redirectPage}`, true);
          }
        }
        setChecking(false);
      }
    })();

    return () => { mounted = false };
  }, [lessonId, lessonNum, pageNum, routeType, isInitialized, showLinearModal, checkRouteAccess]);

  return { checking, allowed };
}
