// src/layouts/LessonLayout.jsx
import { Menubar } from '../components/ui/Menubar.jsx';
import { Statusbar } from '../components/ui/Statusbar.jsx';
import { OffCanvasMenu } from '../components/modals/OffCanvasMenu.jsx';

/**
 * Layout specifically for Lesson Viewer pages
 * @param {Object} props
 * @param {import('preact').ComponentChildren} props.children - The lesson content (intro, page, quiz, etc.)
 * @param {string} [props.title] - Optional page title
 */
export function LessonLayout({ children, title = "Lesson" }) {
  return (
    <div className="d-flex flex-column min-vh-100">
  
      <Menubar title={title} />

      <div className="d-flex flex-grow-1" style="padding-top: 50px;"> {/* Offset for fixed navbar */}
        {/* Main Content Area */}
        <main className="flex-grow-1 p-3 overflow-auto">
          <div className="container-fluid">
            {children}
          </div>
        </main>

      </div>

      <Statusbar />

      <OffCanvasMenu />
    </div>
  );
}