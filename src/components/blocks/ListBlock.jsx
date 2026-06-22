
import { sanitizeHtml } from '@utils/sanitize.js';

export function ListBlock({ block, type }) {
  const className = ['mt-3', block.className || ''].join(' ').trim();
  const style = block.style || undefined;
  const items = Array.isArray(block.listItems) ? block.listItems : [];
  if (!items.length) return null;

  const listContent = items.map((item, idx) => (
    <li key={idx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
  ));

  if (type === 'ol') {
    return (
      <div className={className} style={style}>
        <ol>{listContent}</ol>
      </div>
    );
  }

  if (type === 'group') {
    return (
      <div className={className} style={style}>
        <ul className="list-group">{items.map((item, idx) => (
          <li key={idx} className="list-group-item" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
        ))}</ul>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ul>{listContent}</ul>
    </div>
  );
}
