import { Statusmessage } from '../ui/Statusmessage';
import { Progressbar } from '../ui/Progressbar';
import { Onlinestatus } from '../ui/Onlinestatus';

export default function CourseStatusbar({ course, currentStep, currentStepIndex, totalSteps, completed }) {
  const progressPercent = completed
    ? 100
    : totalSteps === 0 || currentStepIndex < 0
      ? 0
      : Math.max(0, Math.min(99, Math.round((currentStepIndex / totalSteps) * 100)));
  const position = completed
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