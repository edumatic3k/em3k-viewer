import { BlockRenderer } from '../../components/blocks/BlockRenderer';
import CourseIndex from './courseIndex';
import Quiz from './quiz';

function answerLabel(question, answer) {
  if (question.type === 'true-false') return answer === true || answer === 'true' ? 'True' : 'False';
  return question.options.find((option) => option.id === answer)?.text || 'Not recorded';
}

function QuizAnswers({ step, attempt, attempts, bestPassingScore, onBack, onNext, onStartQuizAgain }) {
  const hasAnswers = attempt?.answers && typeof attempt.answers === 'object';
  const correctCount = attempt?.correct ?? attempt?.score;
  const hasPassed = attempts.some((item) => item.passed);
  const canRetake = !hasPassed || step.quiz.allowRetakes === true;

  return (
    <article className="mx-auto" style={{ maxWidth: '800px' }}>
      <h1 className="display-5 mb-2">{step.quiz.title}: Answers</h1>
      {attempt ? (
        <p className={`alert ${attempt.passed ? 'alert-success' : 'alert-warning'}`} role="status">
          {attempt.passed ? 'Passed' : 'Not passed'} · Score: {correctCount ?? 'Not recorded'} of {attempt.total ?? step.quiz.questions.length} ({attempt.percent ?? '—'}%).
        </p>
      ) : <p className="alert alert-secondary" role="status">No submitted attempt yet.</p>}
      {bestPassingScore !== null && bestPassingScore !== undefined && <p>Best passing score: {bestPassingScore}%</p>}
      {!hasAnswers && <p className="text-secondary">Submitted responses are not available for this historical attempt.</p>}
      {attempt && (
        <ol className="list-group list-group-numbered">
          {step.quiz.questions.map((question) => {
            const hasSubmittedAnswer = hasAnswers && Object.prototype.hasOwnProperty.call(attempt.answers, question.id);
            return (
              <li key={question.id} className="list-group-item">
                <h2 className="h5">{question.prompt}</h2>
                <p className="mb-1">Your answer: {hasSubmittedAnswer ? answerLabel(question, attempt.answers[question.id]) : 'Not recorded'}</p>
                <p className="mb-0">Correct answer: {answerLabel(question, question.answer)}</p>
              </li>
            );
          })}
        </ol>
      )}
      {attempt?.submittedAt && <p className="small text-secondary mt-3">Submitted {new Date(attempt.submittedAt).toLocaleString()}</p>}
      <div className="d-flex justify-content-between gap-3 mt-4">
        <button className="btn btn-outline-secondary" onClick={onBack}>Back to Quiz</button>
        <div className="d-flex gap-2">
          {!attempt ? (
            <button className="btn btn-primary" onClick={() => onStartQuizAgain(step.lesson.id)}>Start Quiz</button>
          ) : canRetake && (
            <button className="btn btn-outline-secondary" onClick={() => onStartQuizAgain(step.lesson.id)}>
              {hasPassed ? 'Retake Quiz' : 'Try Again'}
            </button>
          )}
          <button className="btn btn-primary" onClick={onNext}>Continue</button>
        </div>
      </div>
    </article>
  );
}

function StepNavigation({ onBack, onNext, label = 'Continue' }) {
  return (
    <div className="d-flex justify-content-between gap-3 mt-5">
      <button className="btn btn-outline-secondary" onClick={onBack}>Back</button>
      <button className="btn btn-primary" onClick={onNext}>{label}</button>
    </div>
  );
}

export default function DynamicPage({
  course,
  step,
  stepIndex,
  totalSteps,
  showCompletionScreen,
  hasCompletedCourse,
  onBack,
  onNext,
  onQuizResult,
  quizAttempt,
  quizAttempts = [],
  bestPassingScore,
  isFreshQuiz,
  onReviewAnswers,
  onStartQuizAgain,
  onSelectStep,
  resolveAsset,
}) {
  if (!step) {
    if (showCompletionScreen) {
      return (
        <div className="mx-auto text-center py-5" style={{ maxWidth: '720px' }}>
          <h1 className="display-5">{hasCompletedCourse ? 'Course complete' : 'Course end'}</h1>
          <p className="lead">
            {hasCompletedCourse
              ? `You have reached the end of ${course.title}.`
              : `You have reached the end of ${course.title}, but some lessons are not yet complete.`}
          </p>
          <button className="btn btn-primary" onClick={onBack}>Review the last activity</button>
        </div>
      );
    }
    return <CourseIndex data={course} onNext={onNext} resolveAsset={resolveAsset} />;
  }

  if (step.kind === 'quiz') {
    return (
      <Quiz
        key={`${step.lesson.id}-${stepIndex}-${isFreshQuiz ? 'fresh' : 'saved'}-${quizAttempt?.attemptId || 'none'}`}
        quizData={step.quiz}
        lessonId={step.lesson.id}
        attempt={quizAttempt}
        isFreshQuiz={isFreshQuiz}
        allowRetakes={step.quiz.allowRetakes === true}
        bestPassingScore={bestPassingScore}
        onQuizResult={onQuizResult}
        onBack={onBack}
        onReviewAnswers={() => onReviewAnswers(step.lesson.id)}
      />
    );
  }

  if (step.kind === 'quiz-results') {
    return (
      <QuizAnswers
        key={`${step.lesson.id}-${quizAttempt?.attemptId || 'empty'}`}
        step={step}
        attempt={quizAttempt}
        attempts={quizAttempts}
        bestPassingScore={bestPassingScore}
        onBack={onBack}
        onNext={onNext}
        onStartQuizAgain={onStartQuizAgain}
      />
    );
  }

  const { lesson, page, pageIndex, pageCount } = step;
  return (
    <article className="mx-auto" style={{ maxWidth: '900px' }}>
      <p className="text-secondary mb-2">
        {lesson.title} · Page {pageIndex + 1} of {pageCount}
      </p>
      <h1 className="display-5 mb-2">{page.heading}</h1>
      {page.subhead && <p className="lead text-secondary">{page.subhead}</p>}
      <BlockRenderer blocks={page.blocks} resolveAsset={resolveAsset} />
      <StepNavigation
        onBack={onBack}
        onNext={onNext}
        label={stepIndex === totalSteps - 1 ? 'Finish course' : 'Next'}
      />
    </article>
  );
}