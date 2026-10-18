
export function ListBlock({ block, type }) {
  const className = ['mt-3', block.className || ''].join(' ').trim();
  const style = block.style || undefined;
  const items = Array.isArray(block.items) ? block.items : [];
  if (!items.length) return null;

  const listContent = items.map((item, idx) => <li key={idx}>{item}</li>);

  if (type === 'ol') {
    return (
      <div className={className} style={style}>
        <ol>{listContent}</ol>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ul>{listContent}</ul>
    </div>
  );
}
