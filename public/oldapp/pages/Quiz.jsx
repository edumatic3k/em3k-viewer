import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { loadJSON, getSaved, saveData } from '@utils/storage.js';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { useLessonData } from '@contexts/LessonContext.jsx';
import { sanitizeHtml } from '@utils/sanitize.js';
// import { postLog } from '@utils/logger.js'; // Kept for future logging feature

export function Quiz({ lessonId, lessonNumber, quizData, onSubmitResults }) {

  const [quiz, setQuiz] = useState(quizData || null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { journey, getLessonQuizData } = useJourney();
  const { getLessonInfo } = useLessonData();
  const currentLessonNum = lessonNumber || journey?.currentLessonNumber || 1;

  useEffect(() => {
    // Check if quiz was already submitted (check localStorage first, then journey)
    let savedAnswers = getSaved('quiz_answers');
    
    // If not in localStorage, check journey for archived quiz data
    if (!savedAnswers) {
      const lessonQuizData = getLessonQuizData(currentLessonNum);
      
      if (lessonQuizData && lessonQuizData.quizData) {
        savedAnswers = lessonQuizData.quizData.answers;
        // Also restore the score to localStorage for the session
        if (lessonQuizData.quizData.score) {
          saveData('quiz_score', lessonQuizData.quizData.score);
        }
      }
    }
    
    if (savedAnswers) {
      setIsSubmitted(true);
    }
    
    // If quizData was passed as prop, use it
    if (quizData) {
      setQuiz(quizData);
      saveData('quiz_data', quizData);
      // Restore saved answers to form if they exist
      if (savedAnswers) {
        setTimeout(() => restoreAnswers(savedAnswers), 100);
      }
      return;
    }
    // Otherwise, load from file
    if (!lessonId) return;
    (async () => {
      const lessonInfo = getLessonInfo();
      const quizFile = lessonInfo?.quizFile || `lesson-${currentLessonNum}/quiz.json`;
      const path = `/lessons/${lessonId}/${quizFile}`;
      const q = await loadJSON(path);
      if (q) {
        setQuiz(q);
        saveData('quiz_data', q);
        if (savedAnswers) {
          setTimeout(() => restoreAnswers(savedAnswers), 100);
        }
      }
    })();
  }, [lessonId, quizData]);

  if (!quiz) return <div>Loading quiz...</div>;

  const questions = quiz.questions || [];
  const allowRetake = quiz.grading?.allowRetake !== false; // Default to true if not specified
  const isReadOnly = isSubmitted && !allowRetake;

  // Function to restore saved answers to form fields
  const restoreAnswers = (answers) => {
    if (!answers) return;
    Object.entries(answers).forEach(([key, value]) => {
      const inputs = document.querySelectorAll(`[name="${key}"]`);
      inputs.forEach(input => {
        if (input.type === 'radio') {
          input.checked = input.value === value;
        } else if (input.type === 'text') {
          input.value = value;
        }
      });
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form?\n\nAll answers that you've provided will be erased!\n\n")) {
      // Clear saved answers
      saveData('quiz_answers', null);
      localStorage.removeItem('quiz_answers');
      window.scrollTo(0, 0);
      return true;
    }
    return false;
  };

  const handleViewResults = () => {
    route(`/lessons/${lessonId}/${currentLessonNum}/answers`);
  };

  const handleAllowRetake = () => {
    if (confirm("Are you sure you want to retake the quiz?\n\nYour previous answers will be cleared.\n\n")) {
      localStorage.removeItem('quiz_answers');
      localStorage.removeItem('quiz_score');
      setIsSubmitted(false);
      window.location.reload();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const answers = {};
    for (const entry of data.entries()) { answers[entry[0]] = entry[1]; }
    saveData('quiz_answers', answers);

    let totalPoints = 0;
    let earnedPoints = 0;
    for (const q of questions) {
      const questionId = q.id || q.num;
      const key = `q${questionId}`;
      const user = (answers[key] || '').toString();
      const points = typeof q.points === 'number' ? q.points : 1;
      totalPoints += points;
      let got = 0;
      if (q.type === 'multichoice' || q.type === 'truefalse') {
        if (user.toLowerCase() === q.answer.toString().toLowerCase()) got = points;
      } else if (q.type === 'userinput') {
        const userArr = user.replace(/[^\w\s]/gi, '').trim().toLowerCase().split(/\s+/);
        const ansArr = (Array.isArray(q.answer) ? q.answer : [q.answer]).map((x)=>x.toLowerCase());
        const found = userArr.filter((w)=>ansArr.includes(w));
        // Check if question specifies minimum required correct answers
        // Default to requiring all answers if minRequired not specified
        const minRequired = typeof q.minRequired === 'number' ? q.minRequired : ansArr.length;
        if (found.length >= minRequired) got = points;
      }
      earnedPoints += got;
    }

    // grading
    const grading = quiz.grading || { type: 'percentage', passGrade: 100 };
    let scorePct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    let passed = false;
    if (grading.type === 'percentage') {
      passed = scorePct >= (grading.passGrade || 100);
    } else {
      // default to requiring all correct
      passed = earnedPoints >= totalPoints;
    }

    saveData('quiz_answers', answers);
    saveData('quiz_score', { earnedPoints, totalPoints, scorePct, passed });

    // TODO: Logging temporarily disabled for development (no backend yet)
    // Uncomment when PHP logging endpoint is ready
    /*
    // logging: if configured, post results
    try {
      const cfg = getSaved('config') || {};
      if (cfg.features && cfg.features.logging && cfg.loggingUrl) {
        const student = getSaved('student_info') || {};
        const token = journey?.jid || null;
        const payload = {
          lesson: lessonId || quiz.lesson,
          quizTitle: quiz.title,
          score: scorePct,
          passed: passed,
          studentName: student.name || null,
          studentEmail: student.email || null,
          token: token,
          timestamp: new Date().toISOString()
        };
        await postLog(cfg.loggingUrl, payload);
      }
    } catch (e) {
      console.warn('Logging failed', e);
    }
    */

    // Set submitted flag
    setIsSubmitted(true);

    // If callback provided, emit results; otherwise show alert
    if (onSubmitResults) {
      onSubmitResults({
        quiz,
        answers,
        score: { earnedPoints, totalPoints, scorePct, passed },
        questions
      });
    } else {
      alert(`Score: ${earnedPoints}/${totalPoints} (${scorePct}%) - ${passed ? 'PASS' : 'FAIL'}`);
    }
  };

  return (
    <div className="container">
      <h2 className="lessontitle">{quiz.title}</h2>
      {quiz.desc ? (
        <div className="mt-3" dangerouslySetInnerHTML={{ __html: sanitizeHtml(quiz.desc) }} />
      ) : null}
      
      {isSubmitted && !allowRetake && (
        <div className="alert alert-success mt-4" role="alert">
          You have already taken this quiz. Click the "View Your Quiz Results" button below to see the answers.
        </div>
      )}
      
      <form className="mt-4" onSubmit={submit}>
        <ul className="list-group">
          {questions.map((q, idx) => {
            const questionId = q.id || q.num || idx + 1;
            const questionNumber = q.num || q.id || idx + 1;
            const optionEntries = q.options ? Object.entries(q.options) : [];
            return (
            <li key={questionId} className="list-group-item p-4">
              <div className="d-flex flex-row align-items-center">
                <div className="number-icon rounded-circle d-flex justify-content-center align-items-center fs-4 fw-bold me-3">{questionNumber}</div>
                <div className="fw-bold">{q.text}</div>
              </div>
              <div className="ps-5 pt-2">
                {q.type === 'multichoice' && (
                  <div className="d-flex flex-column">
                    {optionEntries.map(([key, label]) => (
                      <div key={key}>
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          id={`q${questionId}_${key}`}
                          name={`q${questionId}`}
                          value={key}
                          required
                          disabled={isReadOnly}
                        />
                        <label htmlFor={`q${questionId}_${key}`}>{label}</label>
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'truefalse' && (
                  <div className="d-flex flex-column">
                    <div>
                      <input className="form-check-input me-1" type="radio" id={`q${questionId}_true`} name={`q${questionId}`} value="true" required disabled={isReadOnly}/>
                      <label htmlFor={`q${questionId}_true`}>True</label>
                    </div>
                    <div>
                      <input className="form-check-input me-1" type="radio" id={`q${questionId}_false`} name={`q${questionId}`} value="false" required disabled={isReadOnly}/>
                      <label htmlFor={`q${questionId}_false`}>False</label>
                    </div>
                  </div>
                )}
                {q.type === 'userinput' && (
                  <div className="py-3">
                    <input name={`q${questionId}`} type="text" placeholder="Type your answer here" className="form-control w-75" required readOnly={isReadOnly} />
                  </div>
                )}
              </div>
            </li>
            );
          })}
        </ul>
        {!isSubmitted ? (
          <div className="my-5 text-center">
            <button 
              className="btn btn-danger me-3 px-3 py-2 btntext shadow border border-2 border-dark" 
              type="reset" 
              onClick={handleReset}
            >
              Reset Form <i className="bi bi-arrow-clockwise ms-2"></i>
            </button>
            <button 
              className="btn btn-success px-3 py-2 btntext shadow border border-2 border-dark" 
              type="submit"
            >
              Submit Answers <i className="bi bi-shield-check ms-2"></i>
            </button>
          </div>
        ) : (
          <div className="d-grid gap-2 my-5 mx-auto w-50">
            <button 
              className="btn btn-warning me-3 px-3 py-2 btntext shadow border border-2 border-dark" 
              type="button"
              onClick={handleViewResults}
            >
              View Your Quiz Results <i className="bi bi-shield-check ms-2"></i>
            </button>
            {allowRetake && (
              <button 
                className="btn btn-secondary px-3 py-2 btntext shadow border border-2 border-dark" 
                type="button"
                onClick={handleAllowRetake}
              >
                Retake Quiz <i className="bi bi-arrow-clockwise ms-2"></i>
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
