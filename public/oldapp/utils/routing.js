import { getSaved } from '@utils/storage.js';
import { loadLessonManifest } from '@utils/lessonLoader.js';
import { route } from 'preact-router';

/**
 * Get the next destination route based on current location and settings
 * Handles the flow: Index → [Intro?] → [StudentInfo?] → [Lesson Intro?] → Lesson Page 1
 */
export async function getNextRoute(from = 'home', config) {
  
  try {
    const cfg = config;
    if (!cfg) {
      console.warn('Config not available for route determination');
      return '/intro'; // Fallback
    }

    const defaultLessonId = cfg.defaultLesson || 'tutorial';
    
    // Get journey to determine current lesson number (default to 1)
    const journey = getSaved('journey');
    const currentLessonNumber = journey?.currentLessonNumber || 1;

    // From home page
    if (from === 'home') {
      // Check if site intro is enabled
      if (cfg.features && cfg.features.siteIntro) {
        return '/intro';
      }
      
      // No site intro, check for student info requirement
      if (cfg.features && cfg.features.studentInfo) {
        const studentInfo = getSaved('student_info');
        if (!studentInfo) {
          return '/studentinfo';
        }
      }
      
      // Check for lesson intro
      const manifest = await loadLessonManifest(defaultLessonId);
      const firstLesson = manifest?.lessons?.[0];
      
      if (firstLesson && firstLesson.hasIntro) {
        return `/lessons/${defaultLessonId}/${currentLessonNumber}/intro`;
      }
      
      // No intros, go straight to first page
      return `/lessons/${defaultLessonId}/${currentLessonNumber}/page/1`;
    }

    // From intro page (site intro)
    if (from === 'intro') {
      // Check for student info requirement
      if (cfg.features && cfg.features.studentInfo) {
        const studentInfo = getSaved('student_info');
        if (!studentInfo) {
          return '/studentinfo';
        }
      }
      
      // Check for lesson intro
      const manifest = await loadLessonManifest(defaultLessonId);
      const firstLesson = manifest?.lessons?.[0];
      
      if (firstLesson && firstLesson.hasIntro) {
        return `/lessons/${defaultLessonId}/${currentLessonNumber}/intro`;
      }
      
      // No lesson intro, go to first page
      return `/lessons/${defaultLessonId}/${currentLessonNumber}/page/1`;
    }

    // From lesson intro
    if (from === 'lesson-intro') {
      return `/lessons/${defaultLessonId}/${currentLessonNumber}/page/1`;
    }

    // Default fallback
    return `/lessons/${defaultLessonId}/${currentLessonNumber}/page/1`;

  } catch (error) {
    console.error('Error determining next route:', error);
    return '/intro'; // Safe fallback
  }
}

/**
 * Get the label for the next action button
 */
export function getNextActionLabel(from = 'home', config) {
  if (from === 'home') {
    if (config?.features?.siteIntro) {
      return 'Begin';
    }
    return 'Start Lesson';
  }

  if (from === 'intro') {
    return 'Begin Your Journey';
  }

  if (from === 'lesson-intro') {
    return 'Start Lesson';
  }

  return 'Continue';
}

/**
 * Check if site intro should be shown
 */
export function shouldShowSiteIntro(config) {
  return config?.features?.siteIntro === true;
}

/**
 * Check if a lesson has an intro
 */
export async function lessonHasIntro(lessonId) {
  try {
    const manifest = await loadLessonManifest(lessonId);
    const firstLesson = manifest?.lessons?.[0];
    return firstLesson?.hasIntro === true;
  } catch (error) {
    console.error('Error checking lesson intro:', error);
    return false;
  }
}

/**
 * Route to a lesson's intro or first page.
 * If lessonId is provided, validate the manifest and navigate to either
 * `/lessons/${lessonId}/${lessonNumber}/intro` (if hasIntro) or `/lessons/${lessonId}/${lessonNumber}/page/1`.
 * If lessonId is omitted, use getNextRoute(from) to determine destination.
 * @param {string} lessonId - Optional lesson id to navigate to
 * @param {string} from - Context for getNextRoute ('home', 'intro', etc.) - defaults to 'intro'
 */
export async function routeToLessonIntro(lessonId, from = 'intro', config) {
  try {
    if (!lessonId) {
      const next = await getNextRoute(from, config);
      if (next) route(next);
      return next;
    }

    // Get journey to determine current lesson number
    const journey = getSaved('journey');
    const currentLessonNumber = journey?.currentLessonNumber || 1;

    const manifest = await loadLessonManifest(lessonId);
    const firstLesson = manifest?.lessons?.[0];
    if (firstLesson && firstLesson.hasIntro) {
      const p = `/lessons/${lessonId}/${currentLessonNumber}/intro`;
      route(p);
      return p;
    }

    const p = `/lessons/${lessonId}/${currentLessonNumber}/page/1`;
    route(p);
    return p;
  } catch (err) {
    console.error('routeToLessonIntro failed:', err);
    // fallback to getNextRoute
    try {
      const next = await getNextRoute(from);
      if (next) route(next);
      return next;
    } catch (e) {
      console.error('fallback getNextRoute failed:', e);
      return null;
    }
  }
}

/**
 * Convenience wrapper that calls routeToLessonIntro and returns the navigated path.
 * Kept for clearer intent at call sites.
 * @param {string} lessonId - Optional lesson id to navigate to
 * @param {string} from - Context for getNextRoute ('home', 'intro', etc.) - defaults to 'intro'
 */
export async function navigateToLessonIntro(lessonId, from = 'intro', config) {
  return await routeToLessonIntro(lessonId, from, config);
}

/**
 * Return the appropriate "back" route from the /studentinfo page.
 * If site intro is enabled in config, return '/intro', otherwise '/'.
 */
export function getStudentInfoBackRoute(config) {
  try {
    const cfg = config || {};
    return (cfg.features && cfg.features.siteIntro) ? '/intro' : '/';
  } catch (err) {
    console.warn('getStudentInfoBackRoute failed, defaulting to /', err);
    return '/';
  }
}

/**
 * Navigate back from the /studentinfo page to the appropriate route.
 */
export function navigateBackFromStudentInfo(config) {
  const p = getStudentInfoBackRoute(config);
  try {
    route(p);
  } catch (err) {
    console.error('navigateBackFromStudentInfo failed, routing to /', err);
    route('/');
  }
}
