import { LessonProvider } from '@contexts/LessonContext.jsx';
import { LessonIntroPage } from '@pages/LessonIntroPage.jsx';
import { LessonTemplate } from '@layouts/LessonTemplate.jsx';
import { useProtectedRoute } from '@hooks/useProtectedRoute.js';

/**
 * Route wrapper for lesson intro pages (/lessons/:id/:lessonNumber/intro)
 * Wraps the intro page in LessonProvider to load lesson data
 */
export function LessonIntroRoute({ id, lessonNumber }) {
  const lessonId = id;
  const lessonNum = parseInt(lessonNumber, 10);
  
  // All access control logic handled by the hook
  const { checking, allowed } = useProtectedRoute(lessonId, lessonNum, {
    routeType: 'intro'
  });

  if (checking) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (!allowed) {
    return null;
  }

  return (
    <LessonProvider lessonId={lessonId}>
      <LessonTemplate>
        <LessonIntroPage lessonId={lessonId} lessonNumber={lessonNum} />
      </LessonTemplate>
    </LessonProvider>
  );
}
