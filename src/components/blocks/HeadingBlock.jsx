
export function HeadingBlock({ block }) {
  const size = block.size || `h${block.level || 2}`;
  const normalizedSize = size.toLowerCase();
  const HeadingTag = ['h2','h3','h4','h5','h6'].includes(normalizedSize) ? normalizedSize : 'h2';
  const className = ['mt-3 mb-4', block.className || ''].join(' ').trim();
  const style = block.style || undefined;

  return (
    <div className={className} style={style}>
      {block.content && (
        <HeadingTag className="oswald-text fw-bold">{block.content}</HeadingTag>
      )}
    </div>
  );
}
