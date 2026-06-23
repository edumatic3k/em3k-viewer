import { Statusmessage } from '../ui/Statusmessage';
import { Progressbar } from '../ui/Progressbar';
import { Onlinestatus } from '../ui/Onlinestatus';
// import course-specific stores later if needed

export default function CourseStatusbar({ course, progressPercent = 45 }) {
  return (
    <footer>
      <nav className="navbar fixed-bottom bg-body-secondary border-top border-1 border-dark m-0 p-0" style={{ height: '40px' }}>
        
        <Statusmessage>
          Ready to learn • Lesson 1 of 3
        </Statusmessage>

        <Progressbar percentage={`${progressPercent}%`} />

        <Onlinestatus />

      </nav>
    </footer>
  );
}