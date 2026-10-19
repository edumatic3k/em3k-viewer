import { useRef, useState } from 'preact/hooks';

function createAttemptId() {
  return globalThis.crypto?.randomUUID?.()
    || `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Quiz({
  quizData,
  lessonId,
  attempt,
  isFreshQuiz = false,
  allowRetakes = false,
  bestPassingScore = 0,
  onQuizResult,
  onBack,
  onReviewAnswers,
}) {
  const [answers, setAnswers] = useState(() => (isFreshQuiz ? {} : attempt?.answers || {}));
  const [result, setResult] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const savingRef = useRef(false);
  const questions = quizData?.questions || [];
  const readOnly = Boolean(attempt) && !isFreshQuiz;

  const resetForm = () => {
    if (window.confirm("This will erase the form and you'll lose all your answers. Are you sure you want to do this?")) {
      setAnswers({});
      setSaveError('');
    }
  };

  const saveResult = async (submittedResult) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError('');
    try {
      if (typeof onQuizResult !== 'function') throw new Error('Quiz result persistence is unavailable.');
      await onQuizResult(lessonId, submittedResult);
      setResult(submittedResult);
      setPendingResult(null);
    } catch {
      setSaveError('Your result could not be saved. Your answers are kept; please try saving again.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    if (pendingResult) {
      await saveResult(pendingResult);
      return;
    }
    try {
      const correct = questions.filter((question) =>
        String(answers[question.id]) === String(question.answer),
      ).length;
      const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
      const submittedResult = {
        attemptId: createAttemptId(),
        answers: Object.fromEntries(questions.map((question) => [
          question.id,
          question.type === 'true-false' ? answers[question.id] === 'true' : answers[question.id],
        ])),
        correct,
        total: questions.length,
        percent,
        passed: percent >= (quizData.passPercent || 0),
      };
      setPendingResult(submittedResult);
      await saveResult(submittedResult);
    } catch {
      setSaveError('We could not check your answers. Please try again.');
    }
  };

  return (
    <article className="mx-auto" style={{ maxWidth: '800px' }}>
      <h1 className="display-5 mb-2">{quizData.title}</h1>
      <p className="text-secondary">Practice quiz · answers are checked on this device.</p>
      {readOnly && (
        <div className={`alert ${attempt.passed ? 'alert-success' : 'alert-warning'}`} role="status">
          {attempt.passed ? 'Passed' : 'Not passed'} · Score: {attempt.correct ?? attempt.score ?? 'Not recorded'} of {attempt.total ?? questions.length} ({attempt.percent ?? '—'}%).
        </div>
      )}
      {readOnly && !attempt.answers && (
        <p className="alert alert-info">Submitted responses are not available for this historical attempt.</p>
      )}
      {allowRetakes && bestPassingScore !== null && bestPassingScore !== undefined && (
        <p className="text-secondary">Best passing score: {bestPassingScore}%</p>
      )}
      <form onSubmit={submit}>
        {questions.map((question, questionIndex) => {
          const options = question.type === 'true-false'
            ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }]
            : question.options;
          return (
            <fieldset key={question.id} className="border rounded p-3 mb-4">
              <legend className="float-none w-auto px-2 fs-5">
                {questionIndex + 1}. {question.prompt}
              </legend>
              {options.map((option) => (
                <label key={option.id} className="d-flex align-items-center gap-2 py-2">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={String(answers[question.id]) === option.id}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    disabled={readOnly || Boolean(pendingResult || result || isSaving)}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
              {result && (
                <p className={`mb-0 mt-2 ${String(answers[question.id]) === String(question.answer) ? 'text-success' : 'text-danger'}`}>
                  {String(answers[question.id]) === String(question.answer) ? 'Correct' : 'Review this answer'}
                </p>
              )}
            </fieldset>
          );
        })}

        {saveError && (
          <div className="alert alert-danger" role="alert">{saveError}</div>
        )}

        {result && (
          <div className={`alert ${result.passed ? 'alert-success' : 'alert-warning'}`} role="status">
            Score: {result.correct} of {questions.length} ({result.percent}%).
            {result.passed ? ' Passing score reached.' : ` Passing score: ${quizData.passPercent}%.`}
          </div>
        )}

        <div className="d-flex justify-content-between gap-3 mt-4">
          <button type="button" className="btn btn-outline-secondary" disabled={isSaving || Boolean(pendingResult)} onClick={onBack}>Back</button>
          {readOnly ? (
            <button type="button" className="btn btn-primary" onClick={onReviewAnswers}>Review Answers</button>
          ) : !result ? (
            pendingResult ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSaving}
                onClick={() => saveResult(pendingResult)}
              >
                {isSaving ? 'Saving result...' : 'Retry saving result'}
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary" disabled={isSaving} onClick={resetForm}>Reset Form</button>
                <button type="submit" className="btn btn-primary" disabled={Object.keys(answers).length !== questions.length || isSaving}>
                  {isSaving ? 'Saving result...' : 'Submit Quiz Answers'}
                </button>
              </div>
            )
          ) : <button type="button" className="btn btn-primary" onClick={onReviewAnswers}>Review Answers</button>}
        </div>
      </form>
    </article>
  );
}