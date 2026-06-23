export default function CourseIntro({ onNext, data, basePath }) {
  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-5">
            {/* Floating Image (like in mockup) */}
            {data?.image && (
              <img 
                src={`${basePath}${data.image}`} 
                alt="Course Intro" 
                className="float-end ms-4 mb-3 rounded" 
                style={{ maxWidth: '280px' }}
              />
            )}

            <h2 className="display-6 fw-bold mb-4">{data?.title || 'Course Introduction'}</h2>
            
            <div className="lead text-muted" 
                 dangerouslySetInnerHTML={{ __html: data?.content || data?.description || '' }}>
            </div>

            <div className="d-grid mt-5">
              <button 
                onClick={onNext}
                className="btn btn-success btn-lg"
              >
                Begin Lesson 1 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}