import { useContext } from 'preact/hooks';
// import { CourseContext } from '../../contexts/CourseContext'; // we'll add later

export default function CourseTopbar({ course }) {
  const closeCourse = () => {
    window.history.back();
  };

  return (
    <header>
      <nav className="navbar fixed-top navbar-expand bg-body-secondary border-bottom border-1 border-dark py-0" style={{ height: '50px' }}>
        <div className="container-fluid px-3">
          {/* Book Icon + Title - Opens Offcanvas */}
          <a 
            className="navbar-brand d-flex align-items-center text-decoration-none" 
            href="#courseMenu" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#courseMenu"
            role="button"
            aria-controls="courseMenu"
          >
            <img 
              src="/assets/img/book.svg" 
              height="38" 
              alt="Course Menu" 
              className="me-2" 
            />
            <span className="fw-bold fs-5">{course?.title || 'Course Viewer'}</span>
          </a>

          {/* Search */}
          <form className="d-flex ms-auto me-3" role="search">
            <div className="input-group input-group-sm">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search this course..." 
                aria-label="Search this course" 
              />
              <button className="btn btn-outline-secondary" type="button">Go</button>
            </div>
          </form>

          {/* Close Button */}
          <button 
            type="button" 
            className="btn-close" 
            aria-label="Close Course" 
            onClick={closeCourse}
          />
        </div>
      </nav>
    </header>
  );
}