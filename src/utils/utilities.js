export function formatDateTime(date, options = {}) {
  if (!date) return '-';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '00/00/00, 00:00';
  
  // If dateStyle or timeStyle are provided, use them alone (can't mix with granular options)
  if (options.dateStyle || options.timeStyle) {
    return d.toLocaleString(undefined, options);
  }
  
  // Otherwise, use default granular options and merge with provided options
  const defaultOptions = { year: '2-digit', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleString(undefined, { ...defaultOptions, ...options });
}