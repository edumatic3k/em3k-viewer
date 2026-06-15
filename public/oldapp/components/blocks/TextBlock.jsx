
import { sanitizeHtml } from '@utils/sanitize.js';

export function TextBlock({ block }) {
  const className = ['mt-4', block.className || ''].join(' ').trim();
  const style = block.style || undefined;
  const safe = sanitizeHtml(block.content || '');

  return (
    <div className={className} style={style} dangerouslySetInnerHTML={{ __html: safe }} />
  );
}
