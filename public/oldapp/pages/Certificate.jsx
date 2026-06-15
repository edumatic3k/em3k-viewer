import { useEffect, useState } from 'preact/hooks';
import { useConfig } from '@contexts/ConfigContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { formatDateTime } from '@utils/utilities.js';
import { useLessonData } from '@/contexts/LessonContext.jsx';
import { saveData } from '@utils/storage.js';

export function CertificatePage() {

  const { config } = useConfig();
  const { journey } = useJourney();
  const { manifest } = useLessonData();
  
  const [studentName, setStudentName] = useState('');
  const [isReady, setIsReady] = useState(false);
  
  // Load certificate CSS on mount, unload on unmount
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/certificate.css';
    link.id = 'certificate-styles';
    document.head.appendChild(link);
    
    return () => {
      const styleLink = document.getElementById('certificate-styles');
      if (styleLink) {
        styleLink.remove();
      }
    };
  }, []);
  
  // Get or prompt for student name
  useEffect(() => {
    const getStudentName = () => {
      try {
        const lsdata = JSON.parse(localStorage.getItem('student_info'));
        if (lsdata?.name) {
          setStudentName(lsdata.name);
          setIsReady(true);
          return;
        }
      } catch (e) {
        console.warn('No student info in localStorage');
      }
      
      // If studentInfo feature is disabled and no name exists, prompt for it
      if (!config?.features?.studentInfo) {
        const name = prompt('Please enter your full name for the certificate:', 'Your Name');
        if (name && name.trim()) {
          const studentData = { name: name.trim() };
          saveData('student_info', studentData);
          setStudentName(name.trim());
        } else {
          // User clicked cancel or left it empty, use default
          setStudentName('Your Name');
        }
      } else {
        // StudentInfo feature is enabled but no data yet
        setStudentName('Your Name');
      }
      setIsReady(true);
    };
    
    getStudentName();
  }, [config]);

  useEffect(() => {
    document.title = 'Certificate of Completion';
  }, []);
  
  const courseTitle = manifest?.title || config?.title || 'This Course';
  const teacherSignature = config?.certificate?.teacher?.signature || 'Instructor';
  const teacherTitle = config?.certificate?.teacher?.title || 'Course Instructor';
  const orgName = config?.certificate?.organization?.name || 'Organization Name';
  const orgUrl = config?.certificate?.organization?.url || 'https://www.example.com';
  const completionDate = journey?.endtime || journey?.lastchange;

  // Show blank white page while prompting for name
  if (!isReady) {
    return (
      <div style={{ backgroundColor: 'white', minHeight: '100vh', width: '100%' }}>
        {/* Blank screen while prompt is showing */}
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="certificate">

        <h1 className="titletext">Certificate of Completion</h1>

        <p className="certtext">This is to certify that:</p>
        
        {/* Student name */}
        <p className="studentname">{studentName || 'Student Name'}</p>

        <p className="certtext">has completed the course:</p>
        
        {/* Course name */}
        <p className="coursename">{courseTitle}</p>
        
        {/* Date */}
        <p className="certtext">
          on this date: <strong>{completionDate ? formatDateTime(completionDate, { dateStyle: 'medium' }) : new Date().toLocaleDateString()}</strong>
        </p>
        
        {/* Teacher Signature Block */}
        <div className="d-flex flex-column signatureblock">
          <div className="teachersig">{teacherSignature}</div>
          <div className="sigline">
            <img src="/assets/img/signature_line.png" width="100%" height="1" alt="_______________________" />
          </div>
          <div className="teachertitle">{teacherTitle}</div>
        </div>

        <p className="orgname">
          {orgName}<br/>
          <a href={orgUrl} target="_blank" rel="noopener noreferrer">{orgUrl}</a>
        </p>

        {/* Seal */}
        <div className="seal">
          <img src="/assets/img/cert_seal.png" className="img-fluid seal" alt="Certificate Seal" />
        </div>

      </div>
    </div>
  );
}
