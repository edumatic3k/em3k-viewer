
import { route } from 'preact-router';

export function ErrorPage({ code, lessonId, allowedPage }) {
  let heading = 'Error';
  let message = 'An error occurred.';

  if (code === 'storage') {
    heading = 'Storage Disabled';
    message = 'This application requires access to your browser\'s local storage. Please enable cookies/local storage and try again.';
  } else if (code === 'javascript') {
    heading = 'Javascript Disabled';
    message = 'This application requires Javascript to function. Please enable Javascript in your browser.';
  } else if (code === 'linear') {
    heading = 'Linear Progression Blocked';
    message = 'You attempted to jump ahead. Please complete previous pages before continuing.';
  }

  return (
    <div className="container p-4">
      <h2 className="display-4">{heading}</h2>
      <p className="mt-3">{message}</p>
      <div className="mt-4">
        {code === 'storage' && (
          <button className="btn btn-primary" onClick={() => { route('/'); }}>Try Again</button>
        )}
        {code === 'linear' && lessonId && (
          <button className="btn btn-primary" onClick={() => { route(`/lessons/${lessonId}/page/${allowedPage || 1}`); }}>Return to lesson</button>
        )}
      </div>
    </div>
  );
}
