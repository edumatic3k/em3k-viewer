import OffcanvasCourseMenu from '../components/modals/OffcanvasCourseMenu';

export default function CourseShell({ children, course }) {
  const closeCourse = () => {
    window.history.back(); // Go back to previous page (Library, etc.)
  };

  return (
    <div className="course-viewer-shell d-flex flex-column" style={{ height: '100vh' }}>
      {/* Top Navbar - Fixed */}
      <header>
        <nav className="navbar fixed-top navbar-expand bg-body-secondary border-bottom border-1 border-dark py-0" style={{ height: '50px' }}>
          <div className="container-fluid px-2">
            {/* Branding / Course Menu Trigger */}
            <a 
              title="Course Menu" 
              className="navbar-brand d-flex align-items-center" 
              href="#courseMenu" 
              data-bs-toggle="offcanvas" 
              role="button" 
              aria-controls="courseMenu"
            >
              <img 
                src="/assets/img/book.svg" 
                height="38" 
                alt="Course Logo" 
                className="me-2" 
              />
              <span className="fw-bold">{course?.title || 'Course Viewer'}</span>
            </a>

            {/* Search */}
            <form className="d-flex ms-auto me-3 me-md-4" role="search">
              <div className="input-group text-nowrap">
                <input 
                  type="search" 
                  className="form-control form-control-sm searchquery" 
                  placeholder="Search this course..." 
                  aria-label="Search" 
                />
                <button className="btn btn-outline-secondary btn-sm" type="submit">Go</button>
              </div>
            </form>

            {/* Close Button */}
            <button 
              type="button" 
              className="btn-close me-1" 
              aria-label="Close Course" 
              onClick={closeCourse}
            />
          </div>
        </nav>
      </header>

      {/* Offcanvas Course Menu */}
      <OffcanvasCourseMenu course={course} />

      {/* Main Content Area */}
      <main className="flex-grow-1 overflow-auto pt-5 pb-5 container-fluid">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer>
        <nav className="navbar fixed-bottom bg-body-secondary border-top border-1 border-dark m-0 p-0" style={{ height: '40px' }}>
          <span id="statusmsg" className="navbar-text m-0 p-0 ms-2 small font-monospace"></span>

          <div className="progress progbar ms-2 border border-1 border-dark" style={{ width: '200px', height: '20px' }}>
            <div 
              className="progress-bar progress-bar-striped bg-primary" 
              role="progressbar" 
              style={{ width: '46%' }}
            >
              46%
            </div>
          </div>

          <div className="ms-auto m-0 p-0 me-2 d-flex align-items-center">
            <button type="button" className="btn btn-sm" title="Status: Online">🟢</button>
          </div>
        </nav>
      </footer>
    </div>
  );
}