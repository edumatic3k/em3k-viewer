import { useEffect } from 'preact/hooks';
import { LessonProvider } from '@contexts/LessonContext.jsx';
import { LessonViewer } from '@pages/LessonViewer.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { LessonTemplate } from '@layouts/LessonTemplate.jsx';
import { useProtectedRoute } from '@hooks/useProtectedRoute.js';

export function LessonPageRoute({ id, lessonNumber, page }) {
  const lessonId = id;
  const lessonNum = parseInt(lessonNumber, 10);
  const pageNum = Number(page || 1);
  const { updateLessonProgress, updateCurrentPosition, journey } = useJourney();
  
  // All access control logic handled by the hook
  const { checking, allowed } = useProtectedRoute(lessonId, lessonNum, {
    routeType: 'page',
    pageNum: pageNum
  });

  // Separate effect for progress updates (only runs if access is allowed)
  useEffect(() => {
    if (!allowed || !journey) return;

    // Update journey to current position
    if (journey.currentLessonNumber !== lessonNum) {
      updateCurrentPosition(lessonId, lessonNum, pageNum, `/lessons/${lessonId}/${lessonNum}/page/${pageNum}`);
    }

    // Update lesson progress to mark this page as reached
    const lessonProgress = journey.lessonProgress?.[lessonNum]?.highestPage ?? 0;
    if (pageNum > lessonProgress) {
      updateLessonProgress(lessonNum, pageNum);
    }
  }, [allowed, lessonId, lessonNum, pageNum, journey, updateCurrentPosition, updateLessonProgress]);

  if (checking) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (!allowed) {
    return null;
  }

  return (
    <LessonProvider lessonId={lessonId}>
      <LessonTemplate>
        <LessonViewer lessonId={lessonId} pageNum={pageNum} />
      </LessonTemplate>
    </LessonProvider>
  );
}
