import { LessonProvider } from '@contexts/LessonContext.jsx';
import { QuizPage } from '@pages/QuizPage.jsx';
import { LessonTemplate } from '@layouts/LessonTemplate.jsx';
import { useProtectedRoute } from '@hooks/useProtectedRoute.js';

export function QuizPageRoute({ id, lessonNumber }) {
  const lessonId = id;
  const lessonNum = parseInt(lessonNumber, 10);
  
  // All access control logic handled by the hook
  const { checking, allowed } = useProtectedRoute(lessonId, lessonNum, {
    routeType: 'quiz'
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
        <QuizPage lessonId={lessonId} lessonNumber={lessonNum} />
      </LessonTemplate>
    </LessonProvider>
  );
}
