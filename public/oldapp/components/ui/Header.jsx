import { h } from 'preact';
import { MenuButton } from './MenuButton.jsx';
import { SimpleBreadcrumb } from './SimpleBreadcrumb.jsx';

export default function Header({ title, currentRoute = null }) {
  const isLessonRoute = currentRoute?.startsWith('/lessons/');
  const breadcrumbCurrent = currentRoute?.startsWith('/intro')
    ? 'intro'
    : currentRoute?.startsWith('/studentinfo')
      ? 'studentinfo'
      : 'home';

  return (
    <header className="site-header bg-light py-3 border-bottom">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {isLessonRoute && (
              <div className="me-3">
                <MenuButton />
              </div>
            )}
            <div>
              <h1 className="h4 mb-0">{title || 'Edumatic 3000'}</h1>
            </div>
          </div>
        </div>

        {!isLessonRoute && (
          <div className="mt-3">
            <SimpleBreadcrumb current={breadcrumbCurrent} />
          </div>
        )}
      </div>
    </header>
  );
}
