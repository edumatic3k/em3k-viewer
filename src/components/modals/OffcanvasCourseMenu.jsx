export default function OffcanvasCourseMenu({
  course,
  steps = [],
  currentStepIndex,
  onSelectStep,
}) {
  if (!course) return null;

  const lessonGroups = course.lessons.map((lesson) => ({
    lesson,
    steps: steps
      .map((step, index) => ({ ...step, index }))
      .filter((step) => step.lesson.id === lesson.id),
  }));

  return (
    <div
      className="offcanvas offcanvas-start"
      tabIndex="-1"
      id="courseMenu"
      aria-labelledby="courseMenuLabel"
      style={{ width: '320px' }}
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="courseMenuLabel">Course Contents</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
      </div>
      <div className="offcanvas-body p-0">
        <div className="list-group list-group-flush">
          <button
            className={`list-group-item list-group-item-action ${currentStepIndex < 0 ? 'active' : ''}`}
            onClick={() => onSelectStep(-1)}
          >
            Course introduction
          </button>
          {lessonGroups.map(({ lesson, steps: lessonSteps }) => (
            <section key={lesson.id} className="border-top">
              <h6 className="px-3 pt-3 mb-1">{lesson.title}</h6>
              {lessonSteps.map((step) => {
                const label = step.kind === 'page' ? step.page.heading : step.lesson.title;
                return (
                  <button
                    key={`${step.lesson.id}-${step.index}`}
                    className={`list-group-item list-group-item-action border-0 ps-4 ${currentStepIndex === step.index ? 'active' : ''}`}
                    onClick={() => onSelectStep(step.index)}
                  >
                    {step.kind === 'page' ? label : `${step.kind === 'quiz-results' ? 'Answers: ' : 'Quiz: '}${label}`}
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      </div>
      {course.description && (
        <div className="p-3 border-top small text-muted">{course.description}</div>
      )}
    </div>
  );
}