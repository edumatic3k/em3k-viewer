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
  const className = ['alert', `alert-${variant}`, 'mt-4'].join(' ');

  return (
    <div className={className} role="alert">
      {block.title && <h5 className="alert-heading">{block.title}</h5>}
      {block.content && <div>{block.content}</div>}
    </div>
  );
}
