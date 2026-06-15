import { getSaved, saveData } from '@utils/storage.js';
import { generateNewCode } from '@utils/token.js';

/**
 * @deprecated Use JourneyContext instead
 * Legacy function - kept for backward compatibility
 */
export function getNumberOfPages(lessonNum) {
  const cfg = getSaved('config');
  if (!cfg || !cfg.lessons || !Array.isArray(cfg.lessons)) return null;
  const lesson = cfg.lessons.find(l => l.number === Number(lessonNum));
  return lesson ? lesson.pages : null;
}

/**
 * @deprecated Use JourneyContext instead
 * Legacy function - kept for backward compatibility
 */
export function updatePageTotal() {
  const jdo = getSaved('journey');
  if (!jdo) return;
  const total = getNumberOfPages(jdo.currentLessonNumber || jdo.lesson);
  if (jdo.total !== undefined) {
    jdo.total = total;
    saveData('journey', jdo);
  }
}

/**
 * @deprecated Use JourneyContext instead
 * Legacy function - kept for backward compatibility
 */
export function updateElapsedTime(lnum) {
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
}

/**
 * @deprecated Use JourneyContext instead
 * Legacy function - kept for backward compatibility during migration
 * This function is called by some components but JourneyProvider handles initialization
 */
export function checkJourneyDataObject() {
  const jdo = getSaved('journey');
  if (jdo) return jdo;
  
  const cfg = getSaved('config');
  if (!cfg) return null;
  
  // In the new architecture, use the defaultLesson from config
  const defaultLessonId = cfg.defaultLesson || 'tutorial';
  
  // Generate a unique token for this journey/student session
  const uniqueToken = generateNewCode();
  
  const newJ = {
    jid: uniqueToken,
    starttime: new Date().toISOString(),
    lastchange: new Date().toISOString(),
    currentLessonId: defaultLessonId,
    currentLessonNumber: 1,
    currentPage: 1,
    currentUrl: `/lessons/${defaultLessonId}/page/1`,
    lessonsCompleted: [],
    lessonProgress: {}
  };
  saveData('journey', newJ);
  return newJ;
}

/**
 * @deprecated Use JourneyContext.completeLesson() instead
 * Mark a lesson as complete and advance to the next lesson
 * @param {number} lessonNumber - The lesson number that was just completed
 * @param {Object} quizData - Optional quiz data { score, passed }
 * @returns {Object} Updated journey object
 */
export function completeLesson(lessonNumber, quizData = null) {
  const jdo = getSaved('journey');
  if (!jdo) {
    console.warn('completeLesson: No journey object found');
    return null;
  }
  
  // Handle both old and new journey structures
  const lessonsCompleted = jdo.lessonsCompleted || jdo.completedLessons || [];
  
  // Check if already completed
  const existingIndex = lessonsCompleted.findIndex(
    lesson => (typeof lesson === 'object' ? lesson.lessonNumber : lesson) === lessonNumber
  );
  
  if (existingIndex >= 0) {
    // Update existing completion
    if (typeof lessonsCompleted[existingIndex] === 'object') {
      lessonsCompleted[existingIndex] = {
        ...lessonsCompleted[existingIndex],
        quizScore: quizData?.score ?? lessonsCompleted[existingIndex].quizScore,
        quizPassed: quizData?.passed ?? lessonsCompleted[existingIndex].quizPassed,
        completedAt: new Date().toISOString()
      };
    } else {
      // Upgrade old format to new format
      lessonsCompleted[existingIndex] = {
        lessonNumber,
        completedAt: new Date().toISOString(),
        quizScore: quizData?.score ?? null,
        quizPassed: quizData?.passed ?? false,
        timeSpent: 0
      };
    }
  } else {
    // Add new completion
    lessonsCompleted.push({
      lessonNumber,
      completedAt: new Date().toISOString(),
      quizScore: quizData?.score ?? null,
      quizPassed: quizData?.passed ?? false,
      timeSpent: 0
    });
  }
  
  jdo.lessonsCompleted = lessonsCompleted;
  jdo.currentLessonNumber = lessonNumber + 1;
  jdo.lastchange = new Date().toISOString();
  
  // Reset page tracking for new lesson
  if (jdo.currentPage !== undefined) jdo.currentPage = 1;
  if (jdo.page !== undefined) jdo.page = 1;
  
  saveData('journey', jdo);
  
  return jdo;
}

/**
 * @deprecated Use JourneyContext.areAllLessonsComplete() instead
 * Check if all lessons in a manifest are complete
 * @param {Object} manifest - The lesson manifest
 * @returns {boolean} True if all lessons are complete
 */
export function areAllLessonsComplete(manifest) {
  const jdo = getSaved('journey');
  if (!jdo || !manifest || !manifest.lessons) return false;
  
  const totalLessons = manifest.lessons.length;
  const lessonsCompleted = jdo.lessonsCompleted || jdo.completedLessons || [];
  
  return lessonsCompleted.length >= totalLessons;
}
