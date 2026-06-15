import { route } from 'preact-router';

export function NotFound() {
  const goHome = () => {
    route('/');
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-1 oswald-text">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={goHome}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
