import { useCourse } from '../../hooks/useCourse';
import CourseShell from '../../layouts/CourseShell';
import DynamicPage from './dynamicPage';

export default function CourseViewer({ courseSlug }) {
  const courseData = useCourse(courseSlug);

  if (courseData.loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        Loading course...
      </div>
    );
  }

  if (courseData.error || !courseData.course) {
    return (
      <div className="p-5 text-center">
        <h2>Course not found</h2>
        <p>Could not load: {courseSlug}</p>
        <a href="/library" className="btn btn-primary">Back to Library</a>
      </div>
    );
  }

  return (
    <CourseShell course={courseData.course}>
      <DynamicPage 
        currentBlock={courseData.currentBlock}
        onNext={courseData.navigate.next}
        onBack={courseData.navigate.back}
        getContentPath={courseData.getContentPath}
      />
    </CourseShell>
  );
}