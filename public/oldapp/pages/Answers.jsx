import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { getSaved } from '@utils/storage.js';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { useConfig } from '@contexts/ConfigContext.jsx';
import { loadJSON } from '@utils/storage.js';

/**
 * Answers Page - displays quiz results with correct answers vs user responses
 * Matches the styling and functionality of the old em3k app
 */
export function AnswersPage({ lessonId, lessonNumber }) {

  const { getLessonInfo, getLessons, manifest } = useLessonData();
  const { journey, areAllLessonsComplete, advanceToNextLesson, completeLesson, getLessonQuizData } = useJourney();
  const { config } = useConfig();
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  
  const currentLessonNum = lessonNumber || journey?.currentLessonNumber || 1;

  useEffect(() => {

    window.scrollTo(0, 0);
    
    // Try to load quiz data and answers from localStorage first
    let savedQuiz = getSaved('quiz_data');
    let savedAnswers = getSaved('quiz_answers');
    let savedScore = getSaved('quiz_score');
    
    // If not in localStorage, check journey for archived quiz data
    if (!savedQuiz || !savedAnswers || !savedScore) {
      const lessonInfo = getLessonInfo();
      const lessonQuizData = getLessonQuizData(currentLessonNum);
      
      if (lessonQuizData && lessonQuizData.quizData) {
        // Restore from journey
        savedAnswers = lessonQuizData.quizData.answers;
        savedScore = lessonQuizData.quizData.score;
        
        // Load the quiz JSON file to get the questions
        (async () => {
          const quizFile = lessonInfo?.quizFile || `lesson-${currentLessonNum}/quiz.json`;
          const path = `/lessons/${lessonId}/${quizFile}`;
          const loadedQuiz = await loadJSON(path);
          
          if (loadedQuiz) {
            setQuizData(loadedQuiz);
            setUserAnswers(savedAnswers);
            setScoreData(savedScore);
          } else {
            // Failed to load quiz file
            route(`/lessons/${lessonId}/${currentLessonNum}/quiz`);
          }
        })();
        return;
      }
    }
    
    if (!savedQuiz || !savedAnswers || !savedScore) {
      // No quiz data found anywhere, redirect back to quiz
      route(`/lessons/${lessonId}/${currentLessonNum}/quiz`);
      return;
    }
    
    setQuizData(savedQuiz);
    setUserAnswers(savedAnswers);
    setScoreData(savedScore);
  }, [lessonId]);

  if (!quizData || !userAnswers || !scoreData) {
    return <div className="container mt-4">Loading results...</div>;
  }

  const lessonInfo = getLessonInfo();
  const questions = quizData.questions || [];
  const displayLessonNumber = lessonInfo?.number || quizData.lesson || currentLessonNum;
  const passGrade = quizData.grading?.passGrade || lessonInfo?.passGrade || 80;

  // useEffect(() => {
  //   document.title = `Lesson ${lessonInfo.number}: Quiz Answers`;
  // }, []);

  // Helper function to generate number icon
  const generateNumberIcon = (num) => (
    <div className="number-icon rounded-circle d-flex justify-content-center align-items-center fs-4 fw-bold me-3">
      {num}
    </div>
  );

  // Helper to get option text
  const getOptionText = (question, answer) => {
    const letter = answer.toString().toLowerCase();
    return question.options?.[letter] || '';
  };

  // Check if answer is correct
  const isCorrect = (question, userAnswer) => {
    const correctAnswer = question.answer.toString().toLowerCase();
    const userAns = userAnswer.toString().toLowerCase();
    
    if (question.type === 'userinput') {
      const userArr = userAns.replace(/[^\w\s]/gi, '').trim().split(/\s+/);
      const ansArr = (Array.isArray(question.answer) ? question.answer : [question.answer]).map(x => x.toLowerCase());
      const found = userArr.filter(w => ansArr.includes(w));
      const minRequired = typeof question.minRequired === 'number' ? question.minRequired : ansArr.length;
      return found.length >= minRequired;
    }
    
    return userAns === correctAnswer;
  };

  // Handle navigation
  const handleAdvanceToNextLesson = () => {
    // First, mark current lesson as complete if not already
    const currentLessonNum = lessonNumber;
    const quizScore = scoreData?.scorePct || 0;
    const quizPassed = scoreData?.passed || false;
    
    // Prepare full quiz data for archiving
    const fullQuizData = {
      answers: userAnswers,
      score: scoreData,
      quizInfo: {
        title: quizData.title,
        grading: quizData.grading,
        lesson: quizData.lesson
      }
    };
    
    completeLesson(currentLessonNum, {
      score: quizScore,
      passed: quizPassed,
      fullQuizData: fullQuizData
    });
    
    // Clear quiz localStorage keys after archiving to journey
    localStorage.removeItem('quiz_answers');
    localStorage.removeItem('quiz_score');
    localStorage.removeItem('quiz_data');
    
    // Check if all lessons are complete
    const allComplete = areAllLessonsComplete(manifest);
    
    if (allComplete) {
      if (config?.features?.certificate) {
        route('/certificate');
      } else {
        route('/complete');
      }
      return;
    }
    
    // Advance to next lesson in journey
    advanceToNextLesson(manifest);
    
    // Get info about next lesson
    const nextLessonNum = currentLessonNum + 1;
    const nextLessonInfo = getLessonInfo(nextLessonNum);
    
    if (nextLessonInfo) {
      // Determine the starting point for next lesson
      if (nextLessonInfo.hasIntro) {
        route(`/lessons/${lessonId}/${nextLessonNum}/intro`);
      } else {
        route(`/lessons/${lessonId}/${nextLessonNum}/page/1`);
      }
    } else {
      // No more lessons, go to completion
      if (config?.features?.certificate) {
        route('/certificate');
      } else {
        route('/complete');
      }
    }
  };

  const handleReviewQuiz = () => {
    route(`/lessons/${lessonId}/${currentLessonNum}/quiz`);
  };

  return (
    <div className="container">
      <h1 className="text-center display-4 my-4">Lesson {displayLessonNumber}: Quiz Answers</h1>

      <ul className="list-group mt-5">
        {questions.map((question, idx) => {
          const questionId = question.id || question.num || (idx + 1);
          const questionNumber = question.num || question.id || (idx + 1);
          const userAnswer = userAnswers[`q${questionId}`] || '';
          const correct = isCorrect(question, userAnswer);
          
          return (
            <li key={questionId} className="list-group-item p-4">
              <div className="d-flex flex-row align-items-center">
                {generateNumberIcon(questionNumber)}
                <div>{question.text}</div>
              </div>
              
              <div className="d-flex flex-row w-100 p-3 align-items-center">
                <div className="ms-5">
                  <p>
                    <span className="fw-bold text-success fst-italic">Correct Answer: </span>
                    <strong>
                      {question.type === 'userinput' 
                        ? (Array.isArray(question.answer) ? question.answer.join(', ') : question.answer)
                        : question.answer.toString().toUpperCase()
                      }
                    </strong>
                    {question.type === 'multichoice' && (
                      <span className="ms-2">({getOptionText(question, question.answer)})</span>
                    )}
                  </p>
                  
                  <p>
                    <span className="fw-bold">Your Response: </span>
                    <span className="fw-bold text-primary">{userAnswer.toString().toUpperCase()}</span>
                    {question.type === 'multichoice' && userAnswer && (
                      <span className="ms-2">({getOptionText(question, userAnswer)})</span>
                    )}
                  </p>
                </div>
                
                <div className="ms-auto me-3">
                  {correct ? (
                    <i className="bi bi-check-circle-fill text-success fs-1"></i>
                  ) : (
                    <i className="bi bi-x-circle-fill text-danger fs-1"></i>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="my-5 p-4 border rounded-3" style={{ backgroundColor: scoreData.passed ? '#d4edda' : '#f8d7da' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className={scoreData.passed ? 'text-success' : 'text-danger'}>
              {scoreData.passed ? 'You Passed The Test!' : 'You Did Not Pass'}
            </h3>
            <p className="mb-0">Passing Score: {passGrade}%</p>
          </div>
          <div className="text-end">
            <h2 className={scoreData.passed ? 'text-success' : 'text-danger'}>
              Your Score: {scoreData.scorePct}%
            </h2>
          </div>
        </div>
      </div>

      <div className="my-5 text-center">
        
        <button 
          className="btn btn-primary btn-lg px-5 py-3 fw-bold border border-2 border-dark me-3"
          style={{ fontFamily: 'sans-serif' }}
          onClick={handleReviewQuiz}
        >
          <i className="bi bi-arrow-left-square fs-5 me-2"></i> Review The Quiz Again
        </button>
        
        {scoreData.passed ? (
          <button 
            className="btn btn-success btn-lg px-5 py-3 fw-bold border border-2 border-dark"
            style={{ fontFamily: 'sans-serif' }}
            onClick={handleAdvanceToNextLesson}
          >
            Advance To The Next Lesson <i className="bi bi-arrow-right-square fs-5 ms-2"></i>
          </button>
        ) : (
          <button 
            className="btn btn-warning btn-lg px-5 py-3 fw-bold border border-2 border-dark"
            style={{ fontFamily: 'sans-serif' }}
            onClick={handleAdvanceToNextLesson}
          >
            Continue to Next Lesson <i className="bi bi-arrow-right-square fs-5 ms-2"></i>
          </button>
        )}

      </div>
    </div>
  );
}
