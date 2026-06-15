
export function SlideshowBlock({ block, id }) {
  const className = ['slideshow-block mx-auto sizeadjuster', block.className || ''].join(' ').trim();
  const style = block.style || undefined;
  const cid = `slideshow-${id}`;

  return (
    <div className={className} style={style}>
      <div id={cid} className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          {block.images && block.images.map((img, idx) => (
            <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
              <img
                src={img.src}
                className="d-block w-100"
                alt={img.alt || img.caption || ''}
              />
              {img.caption && (
                <div className="carousel-caption d-none d-md-block">
                  <h5 className="text-secondary opacity-50">{img.caption}</h5>
                </div>
              )}
              {(!img.alt && !img.caption) && (
                <div className="alert alert-warning mt-2 mb-0 small">
                  Slide image is missing required alt text.
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target={`#${cid}`} data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target={`#${cid}`} data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
}
