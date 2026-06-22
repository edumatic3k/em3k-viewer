import CourseIndex from './courseIndex';
import CourseIntro from './courseIntro';
import LessonIntro from './lessonIntro';
import LessonPages from './lessonPages';
import LessonSummary from './lessonSummary';
import Quiz from './quiz';
import CourseSummary from './courseSummary';
import CourseEnd from './courseEnd';
// ... import others

export default function DynamicPage({ currentBlock, onNext, onBack }) {
  if (!currentBlock) return <div>Loading...</div>;

  switch (currentBlock.type) {
    case 'index':
      return <CourseIndex onNext={onNext} />;
    case 'course-intro':
      return <CourseIntro onNext={onNext} />;
    case 'lesson-intro':
      return <LessonIntro data={currentBlock} onNext={onNext} />;
    case 'lesson-page':
    case 'lesson-pages':
      return <LessonPages pages={currentBlock.pages} onNext={onNext} onBack={onBack} />;
    case 'quiz':
      return <Quiz quizData={currentBlock} />;
    // Add cases for summary, end, certificate...
    default:
      return <div>Unknown page type: {currentBlock.type}</div>;
  }
}