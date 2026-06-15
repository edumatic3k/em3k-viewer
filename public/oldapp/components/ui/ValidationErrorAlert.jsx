// src/components/ui/ValidationErrorAlert.jsx
import { useConfig } from '../../contexts/ConfigContext';

export default function ValidationErrorAlert() {
  const { validationErrors, reloadConfig } = useConfig();

  if (!validationErrors || validationErrors.length === 0) {
    return null;
  }

  return (
    <div className="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Configuration Issue Detected</strong>
      <p className="mb-2">
        There were problems loading <code>config.json</code>. Using safe defaults instead.
      </p>
      
      <details className="mb-2">
        <summary>Details ({validationErrors.length} errors)</summary>
        <ul className="mb-0">
          {validationErrors.map((err, index) => (
            <li key={index} className="small">
              {typeof err === 'string' ? err : JSON.stringify(err)}
            </li>
          ))}
        </ul>
      </details>

      <button 
        type="button" 
        className="btn btn-sm btn-outline-dark me-2"
        onClick={reloadConfig}
      >
        Reload Config
      </button>

      <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
    </div>
  );
}