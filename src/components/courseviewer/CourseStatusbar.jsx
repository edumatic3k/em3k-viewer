import { Statusmessage } from '../ui/Statusmessage';
import { Progressbar } from '../ui/Progressbar';
import { Onlinestatus } from '../ui/Onlinestatus';

export default function CourseStatusbar({ course, currentStep, showCompletionScreen, progressPercent }) {
  const position = showCompletionScreen
    ? 'Course complete'
    : currentStep
    ? `${currentStep.lesson.title} · ${currentStep.kind === 'quiz' ? 'Quiz' : `Page ${currentStep.pageIndex + 1}`}`
    : 'Course introduction';

  return (
    <footer>
      <nav className="navbar fixed-bottom bg-body-secondary border-top border-1 border-dark m-0 p-0" style={{ height: '40px' }}>
        
        <Statusmessage>
          {course?.title ? `${course.title} · ${position}` : 'Ready to learn'}
        </Statusmessage>

        <Progressbar percentage={`${progressPercent}%`} />

        <Onlinestatus />

      </nav>
    </footer>
  );
}