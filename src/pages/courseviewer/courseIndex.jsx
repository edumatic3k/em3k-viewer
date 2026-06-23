export default function CourseIndex({ onNext, data, basePath }) {
  return (
    <div className="text-center py-5">
      <div className="mx-auto" style={{ maxWidth: '700px' }}>
        {/* Hero / Welcome Image */}
        {data?.thumbnail && (
          <img 
            src={`${basePath}${data.thumbnail}`} 
            alt={data.title} 
            className="img-fluid rounded mb-4 shadow-sm" 
            style={{ maxHeight: '320px', objectFit: 'cover' }}
          />
        )}

        <h1 className="display-5 fw-bold mb-3">{data?.title || 'Welcome to the Course'}</h1>
        
        <p className="lead text-muted mb-5">
          {data?.description || 'A self-paced learning experience.'}
        </p>

        <button 
          onClick={onNext}
          className="btn btn-primary btn-lg px-5 py-3"
        >
          Start the Course →
        </button>

        <div className="mt-5 text-muted small">
          Press <kbd>→</kbd> or click the button to begin
        </div>
      </div>
    </div>
  );
}