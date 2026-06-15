// import { useLessonData } from '@contexts/LessonContext.jsx';
// import { useJourney } from '@contexts/JourneyContext.jsx';
// import { useConfig } from '@contexts/ConfigContext.jsx';
// import { route } from 'preact-router';

export function OffCanvasMenu() {

/*     const { manifest, lessonId } = useLessonData();
    const { journey, areAllLessonsComplete, canAccessLesson } = useJourney();
    const { config } = useConfig();

    if (!manifest || !journey) {
        return (
            <div className="offcanvas offcanvas-start" tabIndex={-1} id="offcanvasMenu" aria-labelledby="offcanvasMenuLabel">
                <div className="offcanvas-header">
                    <h3 className="offcanvas-title fw-bold" id="offcanvasMenuLabel">Lesson Menu</h3>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <p className="text-muted">Loading lesson data...</p>
                </div>
            </div>
        );
    }

    const currentLessonNumber = journey.currentLessonNumber || 1;
    const isLinear = manifest.settings?.linear === true;
    const allComplete = areAllLessonsComplete(manifest);
    
    // If all lessons complete, treat as non-linear (allow free navigation)
    const enforceLinear = isLinear && !allComplete;

    const handleNavigation = (url, isAccessible) => {
        if (!isAccessible) {
            // Disabled link - do nothing
            return;
        }
        // Close offcanvas and navigate
        route(url);
        // Bootstrap will handle closing via data-bs-dismiss on the backdrop
    }; */

    return (
        <div className="offcanvas offcanvas-start" tabIndex={-1} id="offcanvasMenu" aria-labelledby="offcanvasMenuLabel">
            <div className="offcanvas-header">
                <h3 className="offcanvas-title fw-bold" id="offcanvasMenuLabel">Lesson Menu</h3>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">

                {/* Home Link */}
                <div className="mb-3">
                    <a href="/" className="btn btn-outline-primary btn-sm w-100" data-bs-dismiss="offcanvas">
                        <i className="bi bi-house-door me-2"></i>
                        Home
                    </a>
                </div>

                {/* Current Class Title */}
                <div className="mb-3">
                    <div className="fw-bold text-secondary small">Current Class:</div>
                    {/* <div className="fs-5">{manifest.title}</div> */}
                </div>

                {/* Lesson Accordions */}
                <div className="accordion accordion-flush" id="lessonAccordion">

                        {manifest.lessons.map((lesson) => {
                        const lessonNumber = lesson.number;
                        const isCurrentLesson = lessonNumber === currentLessonNumber;
                        const accordionId = `lesson-${lessonNumber}`;
                        
                        // Check if user can access this lesson at all
                        const canAccessThisLesson = !enforceLinear || canAccessLesson(lessonNumber);
                        
                        // Determine highest page reached for this lesson
                        const lessonProgress = journey.lessonProgress?.[lessonNumber];
                        const highestPage = lessonProgress?.highestPage || 0;
                        
                        // Check if this lesson is completed
                        const isLessonComplete = journey.lessonsCompleted.some(
                            c => c.lessonNumber === lessonNumber
                        );

                        return (
                            <div className="accordion-item" key={lessonNumber}>
                                <h2 className="accordion-header" id={`heading-${accordionId}`}>
                                    <button 
                                        className={`accordion-button ${isCurrentLesson ? '' : 'collapsed'}`} 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target={`#collapse-${accordionId}`} 
                                        aria-expanded={isCurrentLesson}
                                        aria-controls={`collapse-${accordionId}`}
                                    >
                                        <span className="fw-bold">
                                            Lesson {lessonNumber}
                                            {isLessonComplete && <i className="bi bi-check-circle-fill text-success ms-2"></i>}
                                        </span>
                                        <small className="ms-2 text-muted">{lesson.title}</small>
                                    </button>
                                </h2>
                                <div 
                                    id={`collapse-${accordionId}`} 
                                    className={`accordion-collapse collapse ${isCurrentLesson ? 'show' : ''}`}
                                    aria-labelledby={`heading-${accordionId}`}
                                    data-bs-parent="#lessonAccordion"
                                >
                                    <div className="accordion-body p-2">
                                        <ul className="list-unstyled mb-0">
                                            {/* Lesson Intro */}
                                            {lesson.hasIntro && (
                                                <li className="mb-1">
                                                    <LessonLink
                                                        label="Lesson Intro"
                                                        url={`/lessons/${lessonId}/${lessonNumber}/intro`}
                                                        isAccessible={canAccessThisLesson}
                                                        isCurrent={isCurrentLesson && window.location.pathname.includes('/intro')}
                                                        onClick={handleNavigation}
                                                    />
                                                </li>
                                            )}

                                            {/* Pages */}
                                            {Array.from({ length: lesson.pages || 0 }, (_, i) => {
                                                const pageNum = i + 1;
                                                // Can access page if: lesson is accessible AND (lesson complete OR page is unlocked)
                                                const isPageAccessible = canAccessThisLesson && 
                                                    (isLessonComplete || pageNum <= highestPage + 1);
                                                const isPageCurrent = isCurrentLesson && 
                                                    journey.currentPage === pageNum &&
                                                    window.location.pathname.includes('/page/');

                                                return (
                                                    <li key={pageNum} className="mb-1">
                                                        <LessonLink
                                                            label={`Page ${pageNum}`}
                                                            url={`/lessons/${lessonId}/${lessonNumber}/page/${pageNum}`}
                                                            isAccessible={isPageAccessible}
                                                            isCurrent={isPageCurrent}
                                                            onClick={handleNavigation}
                                                        />
                                                    </li>
                                                );
                                            })}

                                            {/* Quiz */}
                                            {lesson.hasQuiz && (
                                                <li className="mb-1">
                                                    <LessonLink
                                                        label="Quiz"
                                                        url={`/lessons/${lessonId}/${lessonNumber}/quiz`}
                                                        isAccessible={canAccessThisLesson && (isLessonComplete || highestPage >= lesson.pages)}
                                                        isCurrent={isCurrentLesson && window.location.pathname.includes('/quiz')}
                                                        onClick={handleNavigation}
                                                    />
                                                </li>
                                            )}

                                            {/* Answers (only if quiz completed) */}
                                            {lesson.hasQuiz && isLessonComplete && (
                                                <li className="mb-1">
                                                    <LessonLink
                                                        label="Answers"
                                                        url={`/lessons/${lessonId}/${lessonNumber}/answers`}
                                                        isAccessible={true}
                                                        isCurrent={isCurrentLesson && window.location.pathname.includes('/answers')}
                                                        onClick={handleNavigation}
                                                    />
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })} 
                </div>

                {/* Certificate & Completion (if all lessons complete) */}
                {allComplete && (
                    <div className="mt-4 pt-3 border-top">
                        <ul className="list-unstyled">
                            {config?.features?.certificate && (
                                <li className="mb-2">
                                    <a href="/certificate" className="btn btn-success btn-sm w-100" data-bs-dismiss="offcanvas">
                                        <i className="bi bi-award me-2"></i>
                                        View Certificate
                                    </a>
                                </li>
                            )}
                            <li>
                                <a href="/complete" className="btn btn-primary btn-sm w-100" data-bs-dismiss="offcanvas">
                                    <i className="bi bi-trophy me-2"></i>
                                    Completion Summary
                                </a>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Debug info (optional - remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-2 bg-light rounded small text-muted">
                        <div>Current: Lesson {currentLessonNumber}</div>
                        <div>Linear: {isLinear ? 'Yes' : 'No'}</div>
                        <div>All Complete: {allComplete ? 'Yes' : 'No'}</div>
                    </div>
                )}
            </div>
        </div>        
    );
}

// Helper component for menu links with access control
function LessonLink({ label, url, isAccessible, isCurrent, onClick }) {
    if (!isAccessible) {
        // Disabled link
        return (
            <span className="d-block px-2 py-1 text-muted" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                <i className="bi bi-lock me-2"></i>
                {label}
            </span>
        );
    }

    if (isCurrent) {
        // Current page (highlighted but not a link)
        return (
            <span className="d-block px-2 py-1 bg-primary bg-opacity-10 text-primary fw-bold rounded">
                <i className="bi bi-arrow-right me-2"></i>
                {label}
            </span>
        );
    }

    // Accessible link
    return (
        <a 
            href={url}
            className="d-block px-2 py-1 text-decoration-none hover-bg-light rounded"
            data-bs-dismiss="offcanvas"
            onClick={(e) => {
                e.preventDefault();
                onClick(url, isAccessible);
            }}
            style={{ cursor: 'pointer' }}
        >
            {label}
        </a>
    );
}