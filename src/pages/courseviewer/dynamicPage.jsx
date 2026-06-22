import CourseIndex from './courseIndex';
import CourseIntro from './courseIntro';
import LessonIntro from './lessonIntro';
import LessonPages from './lessonPages';
import LessonSummary from './lessonSummary';
import Quiz from './quiz';
import CourseSummary from './courseSummary';
import CourseEnd from './courseEnd';
import Certificate from './certificate';

export default function DynamicPage({ currentBlock, onNext, onBack, getContentPath }) {
  if (!currentBlock) {
    return <div class="p-8 text-center">Loading course content...</div>;
  }

  const basePath = getContentPath ? getContentPath(currentBlock) : '';

  switch (currentBlock.type) {
    case 'index':
      return <CourseIndex onNext={onNext} />;
    
    case 'course-intro':
      return <CourseIntro data={currentBlock} basePath={basePath} onNext={onNext} />;
    
    case 'lesson':
      // For now, render the first enabled child (intro or first page)
      const lessonChildren = currentBlock.children || {};
      if (lessonChildren.intro?.enabled) {
        return <LessonIntro data={lessonChildren.intro} onNext={onNext} />;
      }
      return <LessonPages 
        lesson={currentBlock} 
        pages={lessonChildren.pages || []} 
        basePath={basePath} 
        onNext={onNext} 
        onBack={onBack} 
      />;
    
    case 'lesson-intro':
      return <LessonIntro data={currentBlock} onNext={onNext} />;
    
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
      return <CourseEnd data={currentBlock} />;
    
    case 'certificate':
      return <Certificate data={currentBlock} />;
    
    default:
      return (
        <div class="p-8 text-center">
          <h2>Unknown block type: {currentBlock.type}</h2>
          <pre class="text-left mt-4 text-sm">{JSON.stringify(currentBlock, null, 2)}</pre>
        </div>
      );
  }
}