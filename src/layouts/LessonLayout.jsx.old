// src/layouts/LessonLayout.jsx
import { Menubar } from '../components/ui/Menubar.jsx';
import { Statusbar } from '../components/ui/Statusbar.jsx';
import { OffCanvasMenu } from '../components/modals/OffCanvasMenu.jsx';

/**
 * Dedicated layout for Lesson Viewer pages
 * Bootstrap 5 full-height flex layout
 * 
 * @param {Object} props
 * @param {import('preact').ComponentChildren} props.children
 * @param {string} [props.title]
 */
export function LessonLayout({ children, title = "EM3K Lesson Viewer" }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navigation */}
      <Menubar title={title} isLessonMode={true} />

      {/* Main Content Area */}
      <div className="d-flex flex-grow-1 pt-5"> {/* Offset for fixed navbar */}
        <main className="flex-grow-1 overflow-auto bg-light">
          <div className="container-fluid px-4 py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Statusbar */}
      <Statusbar />

      {/* Offcanvas Menu */}
      <OffCanvasMenu />
    </div>
  );
}