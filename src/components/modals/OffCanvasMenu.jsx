// src/components/modals/OffCanvasMenu.jsx

/**
 * Simplified Offcanvas Lesson Menu - Bootstrap 5
 * Context logic will be re-added later
 */
export function OffCanvasMenu() {
  return (
    <div 
      className="offcanvas offcanvas-start" 
      tabIndex="-1" 
      id="offcanvasLessonMenu" 
      aria-labelledby="offcanvasLessonMenuLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasLessonMenuLabel">
          <i className="bi bi-list-ul me-2"></i>Lesson Menu
        </h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
        ></button>
      </div>
      
      <div className="offcanvas-body">
        <div className="mb-4">
          <a href="/lessons" className="btn btn-outline-secondary w-100 mb-2" data-bs-dismiss="offcanvas">
            ← Back to Lesson Index
          </a>
        </div>

        <h6 className="text-muted mb-2">em3k-tutorial (Demo)</h6>
        <div className="list-group">
          <a href="#" className="list-group-item list-group-item-action" data-bs-dismiss="offcanvas">Introduction</a>
          <a href="#" className="list-group-item list-group-item-action" data-bs-dismiss="offcanvas">Page 1</a>
          <a href="#" className="list-group-item list-group-item-action" data-bs-dismiss="offcanvas">Page 2</a>
          <a href="#" className="list-group-item list-group-item-action" data-bs-dismiss="offcanvas">Quiz</a>
        </div>

        <div className="mt-4 text-center text-muted small">
          Full dynamic menu coming soon
        </div>
      </div>
    </div>
  );
}