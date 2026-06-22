import { sanitizeHtml } from '@utils/sanitize.js';

export function TableBlock({ block }) {
  const className = ['table-responsive mt-4', block.className || ''].join(' ').trim();
  const style = block.style || undefined;
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];

  if (!headers.length && !rows.length) return null;

  const tableClassNames = ['table'];
  if (block.striped) tableClassNames.push('table-striped');
  if (block.bordered) tableClassNames.push('table-bordered');
  if (block.hover) tableClassNames.push('table-hover');
  if (block.small) tableClassNames.push('table-sm');

  return (
    <div className={className} style={style}>
      <table className={tableClassNames.join(' ')}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} scope="col" dangerouslySetInnerHTML={{ __html: sanitizeHtml(header) }} />
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Array.isArray(row)
                ? row.map((cell, cellIndex) => (
                    <td key={cellIndex} dangerouslySetInnerHTML={{ __html: sanitizeHtml(cell) }} />
                  ))
                : Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} dangerouslySetInnerHTML={{ __html: sanitizeHtml(cell) }} />
                  ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
