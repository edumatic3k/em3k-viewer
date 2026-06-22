import { sanitizeHtml } from '@utils/sanitize.js';

const variantMap = {
  tip: 'info',
  warning: 'warning',
  danger: 'danger',
  note: 'secondary',
  info: 'info',
  default: 'secondary'
};

export function CalloutBlock({ block }) {
  const variant = variantMap[(block.variant || block.type || 'default').toLowerCase()] || 'secondary';
  const className = ['alert', `alert-${variant}`, 'mt-4', block.className || ''].join(' ').trim();
  const style = block.style || undefined;

  return (
    <div className={className} style={style} role="alert">
      {block.title && <h5 className="alert-heading">{block.title}</h5>}
      {block.content && (
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }} />
      )}
    </div>
  );
}
