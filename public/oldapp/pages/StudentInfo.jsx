import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { saveData, getSaved } from '@utils/storage.js';
import { useConfig } from '@contexts/ConfigContext.jsx';
import { useJourney } from '@contexts/JourneyContext.jsx';
import { getNextRoute, navigateBackFromStudentInfo } from '@utils/routing.js';

export function StudentInfoPage({ onComplete }) {

  const saved = getSaved('student_info') || {};
  const [name, setName] = useState(saved.name || '');
  const [email, setEmail] = useState(saved.email || '');
  const { journey } = useJourney();
  const { config } = useConfig();

  const submit = async (e) => {
    e.preventDefault();
    // Get the token from the journey's jid (via JourneyContext)
    const token = journey?.jid || 'UNKNOWN';
    const obj = { name: name.trim(), email: email.trim(), token };
    saveData('student_info', obj);
    if (typeof onComplete === 'function') onComplete(obj);
    // Navigate to next route (lesson intro or first page)
    try {
      const next = await getNextRoute('intro', config);
      route(next);
    } catch (err) {
      console.warn('Failed to determine next route, falling back to /lessons/tutorial/intro', err);
      route('/lessons/tutorial/intro');
    }
  };

  useEffect(() => {
    document.title = 'Student Information';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container">
      <h2 className="oswald-text">Student Information</h2>
      <p className="my-4">The teacher who created this lesson plan has requested student information to be able to track grades and progress. Make sure that you type accurate information in the form otherwise, you won't get credit for your quiz scores or the completion of lessons. Please type your name and email then click the Save button to continue.</p>
      <form onSubmit={submit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Full Name (First and Last)</label>
          <input className="form-control" value={name} onInput={(e)=>setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-control" value={email} onInput={(e)=>setEmail(e.target.value)} required />
        </div>
        <button type="button" className="btn btn-lg btn-danger me-3" onClick={() => navigateBackFromStudentInfo(config)}>
          Back
        </button>
        <button type="submit" className="btn btn-lg btn-primary">Save</button>
      </form>
    </div>
  );
}
