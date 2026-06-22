

export function VideoBlock({ block }) {
  const className = ['video-block mt-3 ratio ratio-16x9', block.className || ''].join(' ').trim();
  const style = block.style || undefined;

  return (
    <div className={className} style={style}>
      <iframe src={block.url} title={block.caption || 'video'} frameBorder="0" allowFullScreen></iframe>
      {block.caption && <div className="small text-muted mt-2">{block.caption}</div>}
    </div>
  );
}
