import DefaultLayout from '../layouts/DefaultLayout.jsx';

/**
 * @typedef {Object} ErrorPageProps
 * @property {Error | null | undefined} error
 * @property {() => void} [resetErrorBoundary]
 */

/**
 * @param {ErrorPageProps} props
 */
export default function ErrorPage({ error, resetErrorBoundary }) {
  return (
    <DefaultLayout title="Something Went Wrong">
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="alert alert-danger text-center p-5">
              <h2 className="mb-4">⚠️ Something Went Wrong</h2>
              
              <p className="lead mb-4">
                We encountered an unexpected error while loading this page.
              </p>

              {error && (
                <details className="mb-4 text-start">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className="bg-light p-3 mt-2 text-start small overflow-auto">
                    {error.message || error.toString()}
                  </pre>
                </details>
              )}

              <div className="d-grid gap-3 d-md-flex justify-content-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn btn-primary px-4"
                >
                  Reload Page
                </button>
                
                {resetErrorBoundary && (
                  <button 
                    onClick={resetErrorBoundary} 
                    className="btn btn-outline-secondary px-4"
                  >
                    Try Again
                  </button>
                )}

                <a href="/" className="btn btn-outline-primary px-4">
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}