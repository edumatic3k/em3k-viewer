

export function VideoBlock({ block }) {
  return (
    <div className="video-block mt-3">
      <video className="w-100" controls preload="metadata" aria-label={block.title}>
        <source src={block.src} />
        Your browser does not support embedded video.
      </video>
      {block.caption && <div className="small text-muted mt-2">{block.caption}</div>}
    </div>
  );
}
