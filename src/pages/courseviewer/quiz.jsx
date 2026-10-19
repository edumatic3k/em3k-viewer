import { useState } from 'preact/hooks';

export default function Quiz({ quizData, lessonId, onQuizResult, onBack, onNext, isLastStep }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const questions = quizData?.questions || [];

  const submit = (event) => {
    event.preventDefault();
    const correct = questions.filter((question) =>
      String(answers[question.id]) === String(question.answer),
    ).length;
    const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const submittedResult = {
      correct,
      total: questions.length,
      percent,
      passed: percent >= (quizData.passPercent || 0),
    };
    setResult(submittedResult);
    onQuizResult?.(lessonId, submittedResult);
  };

  return (
    <article className="mx-auto" style={{ maxWidth: '800px' }}>
      <h1 className="display-5 mb-2">{quizData.title}</h1>
      <p className="text-secondary">Practice quiz · answers are checked on this device.</p>
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
                    disabled={Boolean(result)}
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

        {result && (
          <div className={`alert ${result.passed ? 'alert-success' : 'alert-warning'}`} role="status">
            Score: {result.correct} of {questions.length} ({result.percent}%).
            {result.passed ? ' Passing score reached.' : ` Passing score: ${quizData.passPercent}%.`}
          </div>
        )}

        <div className="d-flex justify-content-between gap-3 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onBack}>Back</button>
          {!result ? (
            <button type="submit" className="btn btn-primary" disabled={Object.keys(answers).length !== questions.length}>
              Check answers
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setAnswers({}); setResult(null); }}>
                Try again
              </button>
              <button type="button" className="btn btn-primary" onClick={onNext}>
                {isLastStep ? 'Finish course' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </form>
    </article>
  );
}