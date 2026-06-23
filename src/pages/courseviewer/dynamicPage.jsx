import CourseIndex from './courseIndex';
import CourseIntro from './courseIntro';
import LessonIntro from './lessonIntro';
import LessonPages from './lessonPages';
import LessonSummary from './lessonSummary';
import Quiz from './quiz';
import CourseSummary from './courseSummary';
import CourseEnd from './courseEnd';
import Certificate from './certificate';

export default function DynamicPage({ 
  currentBlock, 
  onNext, 
  onBack, 
  getContentPath 
}) {
  if (!currentBlock) {
    return (
      <div className="text-center py-10">
        <h3>Loading content...</h3>
      </div>
    );
  }

  const basePath = getContentPath ? getContentPath() : '';

  console.log('Rendering block:', currentBlock.type, currentBlock);

  switch (currentBlock.type) {
    case 'index':
      return <CourseIndex onNext={onNext} data={currentBlock} basePath={basePath} />;

    case 'course-intro':
      return <CourseIntro onNext={onNext} data={currentBlock} basePath={basePath} />;

    case 'lesson':
      // Smart fallback: show intro if available, otherwise first page
      const children = currentBlock.children || {};
      if (children.intro?.enabled !== false) {
        return <LessonIntro 
          data={children.intro} 
          onNext={onNext} 
          basePath={basePath + (currentBlock.folder ? currentBlock.folder + '/' : '')} 
        />;
      }
      return <LessonPages 
        lesson={currentBlock}
        pages={children.pages || []} 
        basePath={basePath} 
        onNext={onNext} 
        onBack={onBack} 
      />;

    case 'lesson-intro':
      return <LessonIntro data={currentBlock} onNext={onNext} basePath={basePath} />;

    case 'lesson-pages':
    case 'lesson-page':
      return <LessonPages 
        pages={currentBlock.pages || []} 
        basePath={basePath} 
        onNext={onNext} 
        onBack={onBack} 
      />;

    case 'lesson-summary':
      return <LessonSummary data={currentBlock} onNext={onNext} />;

    case 'quiz':
      return <Quiz 
        quizData={currentBlock} 
        basePath={basePath} 
        onNext={onNext} 
      />;

    case 'course-summary':
      return <CourseSummary data={currentBlock} onNext={onNext} />;

    case 'end':
      return <CourseEnd data={currentBlock} onNext={onNext} />;

    case 'certificate':
      return <Certificate data={currentBlock} />;

    default:
      return (
        <div className="alert alert-info">
          <h4>Block Type: <code>{currentBlock.type}</code></h4>
          <p>This page type is not implemented yet.</p>
          <pre className="small mt-3 bg-light p-3">{JSON.stringify(currentBlock, null, 2)}</pre>
        </div>
      );
  }
}