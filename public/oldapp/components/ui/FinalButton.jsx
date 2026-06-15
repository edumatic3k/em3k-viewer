import { route } from 'preact-router';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { useConfig } from '@contexts/ConfigContext.jsx';

/**
 * FinalButton - Smart button that appears on the last page of a lesson
 * Determines whether to show:
 * - "Take Quiz" (if lesson has a quiz)
 * - "Next Lesson" (if more lessons exist and no quiz)
 * - "Finish" (if this is the last lesson)
 */
export function FinalButton({ lessonId, currentPage }) {

  const { getLessonInfo, getLessons, manifest } = useLessonData();
  const { journey, completeLesson: completeLessonInJourney } = useJourney();
  const { config } = useConfig();
  const lessonInfo = getLessonInfo();
  
  if (!lessonInfo) return null;
  
  // Only show on the last page of the lesson
  if (currentPage < lessonInfo.pages) return null;
  
  // Determine button type and action
  const getButtonConfig = () => {

    const currentLessonNum = journey?.currentLessonNumber || 1;
    const allLessons = getLessons();
    const isLastLesson = currentLessonNum >= allLessons.length;
    
    // Case 1: Lesson has a quiz
    if (lessonInfo.hasQuiz) {
      return {
        label: 'Take Quiz',
        className: 'btn-success',
        action: () => {
          try {
            const currentUrl = journey?.currentUrl || '';
            if (currentUrl) sessionStorage.setItem('prior_route', currentUrl);
          } catch (e) { 
            console.warn('Could not save prior route', e); 
          }
          route(`/lessons/${lessonId}/${currentLessonNum}/quiz`);
        }
      };
    }
    
    // Case 2: No quiz, but more lessons exist
    if (!isLastLesson) {
      return {
        label: 'Next Lesson',
        className: 'btn-primary',
        action: () => {
          // Mark current lesson as complete
          completeLessonInJourney(currentLessonNum);
          
          // Navigate to next lesson
          const nextLessonNum = currentLessonNum + 1;
          const nextLessonInfo = getLessonInfo(nextLessonNum);
          
          if (nextLessonInfo) {
            if (nextLessonInfo.hasIntro) {
              route(`/lessons/${lessonId}/${nextLessonNum}/intro`);
            } else {
              route(`/lessons/${lessonId}/${nextLessonNum}/page/1`);
            }
          } else {
            console.warn('Next lesson not found');
            route('/');
          }
        }
      };
    }
    
    // Case 3: Last lesson, no quiz - go to completion
    return {
      label: 'Finish',
      className: 'btn-success',
      action: () => {
        // Mark current lesson as complete
        completeLessonInJourney(currentLessonNum);
        
        // Check if certificate is enabled
        if (config?.features?.certificate) {
          route('/certificate');
        } else {
          // Go to completion/end page
          route('/complete');
        }
      }
    };
  };
  
  const buttonConfig = getButtonConfig();
  
  return (
    <button 
      className={`btn ${buttonConfig.className} btn-lg px-5 py-3 fw-bold border border-2 border-dark`} 
      onClick={buttonConfig.action}
      style={{fontFamily: 'sans-serif'}}
    >
      {buttonConfig.label} <i class="bi bi-check-circle fs-5 ms-2"></i>
    </button>
  );
}
