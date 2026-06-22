import { useContext } from 'preact/hooks';
import CourseShell from '../../layouts/CourseShell';
import DynamicPage from './dynamicPage';
import { CourseContext } from '../../contexts/CourseContext';

export default function CourseViewer({ courseSlug }) {
  const { course, currentBlock, navigate } = useContext(CourseContext);

  return (
    <CourseShell course={course}>
      <DynamicPage 
        currentBlock={currentBlock} 
        onNext={navigate.next}
        onBack={navigate.back}
      />
    </CourseShell>
  );
}
