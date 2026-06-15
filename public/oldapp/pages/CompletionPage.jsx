import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useConfig } from '@contexts/ConfigContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { formatDateTime } from '@utils/utilities.js';

/**
 * CompletionPage - Shown when all lessons are complete but certificate is not enabled
 * Displays congratulations message and journey summary
 */
export function CompletionPage() {

  const { config } = useConfig();
  const { journey, setEndTime, resetToFirstLesson } = useJourney();
  const { manifest } = useLessonData();
  const studentInfo = JSON.parse(localStorage.getItem('student_info') || 'null');
  
  useEffect(() => {
    
    document.title = 'Congratulations!';

    // Update journey end time using JourneyContext helper
    if (journey && !journey.endtime && typeof setEndTime === 'function') {
      setEndTime();
    }
  }, [journey, setEndTime]);
  
  // Handle return to home - reset current lesson to 1
  const handleReturnHome = () => {
    // Reset journey position to lesson 1 so user can restart from beginning
    if (typeof resetToFirstLesson === 'function') {
      resetToFirstLesson();
    }
    // Navigate to home
    route('/');
  };
  
  const calculateDuration = () => {
    if (!journey?.starttime || !journey?.endtime) return null;
    try {
      const start = new Date(journey.starttime);
      const end = new Date(journey.endtime);
      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;   
      if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins !== 1 ? 's' : ''}`;
      }
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    } catch (e) {
      return null;
    }
  };
  
  const duration = calculateDuration();
  const courseTitle = manifest?.title || config?.title || 'this course';
  
  return (
    <div className="container my-5 p-3">
      <div className="text-center">

        <h1 className="display-3 oswald-text mb-4">🎉 Congratulations!</h1>
        <h2 className="mb-4">You've Completed All Lessons</h2>
        
        {studentInfo?.name && (
          <p className="lead mb-4">
            Great job, <strong>{studentInfo.name}</strong>!
          </p>
        )}
        
        <div className="card shadow-sm mx-auto" style="max-width: 600px;">
          <div className="card-body">
            <h4 className="card-title mb-3">Journey Summary</h4>
            
            <p className="mb-2">
              <strong>Course:</strong> {courseTitle}
            </p>
            
            {journey?.lessonsCompleted && (
              <p className="mb-2">
                <strong>Lessons Completed:</strong> {journey.lessonsCompleted.length}
              </p>
            )}
            
            {duration && (
              <p className="mb-2">
                <strong>Total Time:</strong> {duration}
              </p>
            )}
            
            {journey?.starttime && (
              <p className="mb-2 text-muted small">
                Started: {formatDateTime(journey.starttime, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
            
            {journey?.endtime && (
              <p className="mb-0 text-muted small">
                Completed: {formatDateTime(journey.endtime, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-5">

          <div className="d-flex gap-3 justify-content-center">
            <button onClick={handleReturnHome} className="btn btn-primary btn-lg">
              Return to Home
            </button>
            {config?.features?.certificate && (
              <a href="/certificate" className="btn btn-success btn-lg">
                View Certificate
              </a>
            )}
          </div>
        </div>
        
        {config?.branding?.poweredBy && (
          <footer className="mt-5 pt-4 border-top">
            <p className="poweredby text-muted">
              Powered by {config.branding.poweredBy}
            </p>
          </footer>
        )}

      </div>
    </div>
  );
}
