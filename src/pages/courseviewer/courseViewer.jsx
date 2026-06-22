import { useCourse } from '../../hooks/useCourse';
import CourseShell from '../../layouts/CourseShell';
import DynamicPage from './dynamicPage';

export default function CourseViewer({ courseSlug }) {
  const courseData = useCourse(courseSlug);
  
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