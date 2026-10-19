import { BlockRenderer } from '../../components/blocks/BlockRenderer';
import CourseIndex from './courseIndex';
import Quiz from './quiz';

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
  completed,
  onBack,
  onNext,
  onQuizResult,
  onSelectStep,
  resolveAsset,
}) {
  if (!step) {
    if (completed) {
      return (
        <div className="mx-auto text-center py-5" style={{ maxWidth: '720px' }}>
          <h1 className="display-5">Course complete</h1>
          <p className="lead">You have reached the end of {course.title}.</p>
          <button className="btn btn-primary" onClick={onBack}>Review the last activity</button>
        </div>
      );
    }
    return <CourseIndex data={course} onNext={onNext} resolveAsset={resolveAsset} />;
  }

  if (step.kind === 'quiz') {
    return (
      <Quiz
        key={`${step.lesson.id}-${stepIndex}`}
        quizData={step.quiz}
        lessonId={step.lesson.id}
        onQuizResult={onQuizResult}
        onBack={onBack}
        onNext={onNext}
        isLastStep={stepIndex === totalSteps - 1}
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