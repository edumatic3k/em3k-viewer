import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { Quiz } from '@pages/Quiz.jsx';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { getSaved } from '@utils/storage.js';

export function QuizPage({ lessonId, lessonNumber }) {
  
  const { getQuizPage, getLessonInfo } = useLessonData();
  const { journey, completeLesson } = useJourney();
  const currentLessonNum = lessonNumber || journey?.currentLessonNumber || 1;
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if quiz was already submitted
    const savedAnswers = getSaved('quiz_answers');
    const savedScore = getSaved('quiz_score');
    
    if (savedAnswers && savedScore) {
      setIsSubmitted(true);
    }
  }, []);
  
  const lessonInfo = getLessonInfo();
  const quizData = getQuizPage();
  
  if (!lessonInfo?.hasQuiz) return <div className="container mt-4">This lesson has no quiz</div>;
  if (!quizData) return <div className="container mt-4">Quiz not found</div>;

  useEffect(() => {
    document.title = `Lesson ${lessonInfo.number}: Quiz`;
  }, []);

  const handleSubmitResults = (results) => {
    setIsSubmitted(true);
    
    // Save quiz results to journey
    const scorePct = results.score.scorePct;
    const passed = results.score.passed;
    
    // Prepare full quiz data for archiving in journey
    const fullQuizData = {
      answers: results.answers,
      score: results.score,
      quizInfo: {
        title: results.quiz.title,
        grading: results.quiz.grading,
        lesson: results.quiz.lesson
      }
    };
    
    completeLesson(currentLessonNum, {
      score: scorePct,
      passed: passed,
      fullQuizData: fullQuizData
    });
    
    // Navigate to answers page
    route(`/lessons/${lessonId}/${currentLessonNum}/answers`);
  };

  return (
    <div>
      <Quiz 
        lessonId={lessonId}
        lessonNumber={currentLessonNum}
        quizData={quizData} 
        onSubmitResults={handleSubmitResults}
        isSubmitted={isSubmitted}
      />
    </div>
  );
}
