import { useState } from 'preact/hooks';

export default function OffcanvasCourseMenu({ course }) {
  
  const [expandedLessons, setExpandedLessons] = useState({});

  if (!course?.sequence) {
    return null;
  }

  const toggleLesson = (id) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div 
      className="offcanvas offcanvas-start" 
      tabIndex="-1" 
      id="courseMenu" 
      aria-labelledby="courseMenuLabel"
      style={{ width: '320px' }}
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="courseMenuLabel">
          📚 Course Contents
        </h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
        />
      </div>

      <div className="offcanvas-body p-0">
        <div className="list-group list-group-flush">
          {course.sequence.map((block, index) => {
            const isCompleted = false; // TODO: connect to real progress
            const isActive = index === 0; // TODO: connect to current position

            if (block.type === 'lesson') {
              const children = block.children || {};
              const isExpanded = expandedLessons[block.id] || false;

              return (
                <div key={block.id} className="list-group-item border-0 p-0">
                  <button
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center fw-medium ${isActive ? 'active' : ''}`}
                    onClick={() => toggleLesson(block.id)}
                  >
                    <span>📖 {block.title}</span>
                    {isCompleted && <span className="text-success">✓</span>}
                  </button>

                  {isExpanded && (
                    <div className="ms-3 border-start border-2 border-primary ps-3 py-1">
                      {/* Lesson Intro */}
                      {children.intro?.enabled !== false && (
                        <a href="#" className="d-block py-1 small text-decoration-none">
                          → Introduction
                        </a>
                      )}

                      {/* Pages */}
                      {(children.pages || []).map((page, pIdx) => (
                        <a key={pIdx} href="#" className="d-block py-1 small text-decoration-none">
                          → Page {pIdx + 1}
                        </a>
                      ))}

                      {/* Quiz */}
                      {children.quiz?.enabled && (
                        <a href="#" className="d-block py-1 small text-decoration-none">
                          → Quiz
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Regular blocks (index, course-intro, course-summary, end, etc.)
            return (
              <a
                key={block.id}
                href="#"
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isActive ? 'active' : ''}`}
              >
                <span>
                  {block.type === 'index' && '🏠 '}
                  {block.type === 'course-intro' && '📖 '}
                  {block.type === 'course-summary' && '📋 '}
                  {block.type === 'end' && '🏁 '}
                  {block.type === 'certificate' && '🎖️ '}
                  {block.title || block.id}
                </span>
                {isCompleted && <span className="text-success">✓</span>}
              </a>
            );
          })}
        </div>
      </div>

      <div className="offcanvas-footer p-3 border-top small text-muted">
        {course.estimatedDuration && (
          <div>⏱ Estimated time: {course.estimatedDuration}</div>
        )}
      </div>
    </div>
  );
}