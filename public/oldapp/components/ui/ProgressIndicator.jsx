import { useLessonData } from '@contexts/LessonContext.jsx';

/**
 * ProgressIndicator component
 * Displays current lesson progress in the format: "Lesson [x]: Page [y] of [z]"
 */
export function ProgressIndicator({ currentPage }) {

  const { getLessonInfo } = useLessonData();
  const lessonInfo = getLessonInfo();

  if (!lessonInfo) {
    return null;
  }

  return (
    <div className="my-4 pb-4 border-bottom border-1 border-secondary">
      <span className="fw-bold fs-5S" style={{fontFamily: 'sans-serif'}}>
        Lesson {lessonInfo.number}:
      </span> 
      <span className="ms-3 font-monospace">
        Page {currentPage} of {lessonInfo.pages}
      </span>
    </div>
  );
}