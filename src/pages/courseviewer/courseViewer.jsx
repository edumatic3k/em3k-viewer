import { useCourse } from '../../hooks/useCourse';
import CourseShell from '../../layouts/CourseShell';
import DynamicPage from './dynamicPage';

export default function CourseViewer({ courseSlug }) {
  const courseData = useCourse(courseSlug);

  if (courseData.loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        Loading course...
      </div>
    );
  }

  if (courseData.error || !courseData.course) {
    return (
      <div className="p-5 text-center">
        <h2>Course not found</h2>
        <p>Could not load: {courseSlug}</p>
        <a href="/library" className="btn btn-primary">Back to Library</a>
      </div>
    );
  }

  return (
    <CourseShell
      course={courseData.course}
      lessons={courseData.lessons}
      steps={courseData.steps}
      currentStep={courseData.currentStep}
      currentStepIndex={courseData.stepIndex}
      showCompletionScreen={courseData.showCompletionScreen}
      hasCompletedCourse={courseData.hasCompletedCourse}
      progressPercent={courseData.progressPercent}
      onSelectStep={courseData.navigate.goToStep}
    >
      <DynamicPage 
        course={courseData.course}
        step={courseData.currentStep}
        stepIndex={courseData.stepIndex}
        totalSteps={courseData.totalSteps}
        showCompletionScreen={courseData.showCompletionScreen}
        hasCompletedCourse={courseData.hasCompletedCourse}
        onBack={courseData.navigate.back}
        onNext={courseData.navigate.next}
        onQuizResult={courseData.onQuizResult}
        quizAttempt={courseData.quizAttempt}
        quizAttempts={courseData.quizAttempts}
        bestPassingScore={courseData.bestPassingScore}
        isFreshQuiz={courseData.isFreshQuiz}
        onReviewAnswers={courseData.reviewQuizAnswers}
        onStartQuizAgain={courseData.startQuizAgain}
        onSelectStep={courseData.navigate.goToStep}
        resolveAsset={courseData.resolveAsset}
      />
    </CourseShell>
  );
}