
export function ImageBlock({ block }) {
  const className = ['mt-3 text-center', block.className || ''].join(' ').trim();
  const style = block.style || undefined;

  if (!block?.src) {
    return (
      <div className="alert alert-warning mt-3" style={style}>
        Image block is missing a <strong>src</strong> property.
      </div>
    );
  }

  if (!block?.alt) {
    return (
      <div className="alert alert-warning mt-3" style={style}>
        Image block is missing required <strong>alt</strong> text for accessibility.
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <img
        src={block.src}
        alt={block.alt}
        className={`img-fluid ${block.fluid ? '' : 'mx-auto'} sizeadjuster`}
      />
      {block.caption && <div className="small text-muted mt-2">{block.caption}</div>}
    </div>
  );
}
