import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { LessonProvider } from '@contexts/LessonContext.jsx';
import { CertificatePage } from '@pages/Certificate.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { loadLessonManifest } from '@utils/lessonLoader.js';

export function CertificatePageRoute(props) {
  // Get the current lessonId from the journey context
  const { journey, areAllLessonsComplete } = useJourney();
  const lessonId = journey?.currentLessonId || 'tutorial';
  const [manifest, setManifest] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Load manifest and check access
    (async () => {
      if (!journey) {
        setIsChecking(true);
        return;
      }
      
      try {
        const m = await loadLessonManifest(lessonId);
        setManifest(m);
        
        // Check if all lessons complete
        if (!areAllLessonsComplete(m)) {
          console.warn('Access denied: Not all lessons complete');
          route('/', true);
        } else {
          setIsChecking(false);
        }
      } catch (e) {
        console.error('Failed to load manifest:', e);
        route('/', true);
      }
    })();
  }, [journey, lessonId, areAllLessonsComplete]);

  // Don't render until we verify access
  if (!journey || isChecking || !manifest) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Checking access...</span>
        </div>
      </div>
    );
  }
  
  return (
    <LessonProvider lessonId={lessonId}>
      <CertificatePage {...props} />
    </LessonProvider>
  );
}