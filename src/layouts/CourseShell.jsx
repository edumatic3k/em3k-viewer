import { useEffect } from 'preact/hooks';
import CourseTopbar from '../components/courseviewer/CourseTopbar';
import CourseStatusbar from '../components/courseviewer/CourseStatusbar';
import OffcanvasCourseMenu from '../components/modals/OffcanvasCourseMenu';

export default function CourseShell({ children, course }) {
  useEffect(() => {
    if (course?.title) {
      document.title = `${course.title} - Edumatic 3000`;
    }

    // Dynamic Favicon for Course Viewer
    const link = document.querySelector("link[rel~='icon']") || 
                 document.createElement('link');
    
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/assets/img/book.svg';
    
    document.getElementsByTagName('head')[0].appendChild(link);

    // Cleanup: Restore original favicon when leaving course
    return () => {
      const originalFavicon = '/assets/img/em3k.svg'; // your default
      const iconLink = document.querySelector("link[rel~='icon']");
      if (iconLink) {
        iconLink.href = originalFavicon;
      }
    };
  }, [course]);

  return (
    <div className="course-viewer-shell d-flex flex-column vh-100">
      <CourseTopbar course={course} />
      <OffcanvasCourseMenu course={course} />

      <main className="flex-grow-1 overflow-auto pt-5 pb-5 container-fluid">
        <div className="p-3 p-md-4">
          {children}
        </div>
      </main>

      <CourseStatusbar course={course} />
    </div>
  );
}