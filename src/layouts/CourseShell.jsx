import { useEffect } from 'preact/hooks';
import CourseTopbar from '../components/courseviewer/CourseTopbar.jsx';
import CourseStatusbar from '../components/courseviewer/CourseStatusbar.jsx';
import OffcanvasCourseMenu from '../components/modals/OffcanvasCourseMenu';

export default function CourseShell({ children, course }) {
  useEffect(() => {
    if (course?.title) {
      document.title = `${course.title} - Edumatic 3000`;
    }
  }, [course]);

  return (
    <div className="course-viewer-shell d-flex flex-column vh-100">
      
      <CourseTopbar course={course} />

      <OffcanvasCourseMenu course={course} />

      {/* Main Content Area */}
      <main className="flex-grow-1 overflow-auto pt-5 pb-5 container-fluid">
        <div className="p-3 p-md-4">
          {children}
        </div>
      </main>

      <CourseStatusbar course={course} />
    </div>
  );
}