import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function LinearFlowModal({ show, lessonId, lessonNumber, allowedPage, onClose }) {
  useEffect(() => {
    // initialize bootstrap modal instances when shown
    if (!show) return;
    const modalEl = document.getElementById('em3k-linear-modal');
    if (!modalEl) return;
    // Initialize Bootstrap Modal instance
    const bs = window.bootstrap && new window.bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    if (bs) bs.show();
    return () => {
      if (bs) bs.hide();
    };
  }, [show]);

  const handleContinue = () => {
    // Navigate to the allowed page
    if (lessonId && lessonNumber && allowedPage) {
      route(`/lessons/${lessonId}/${lessonNumber}/page/${allowedPage}`);
    }
    if (onClose) onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade" id="em3k-linear-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Linear Progression</h5>
          </div>
          <div className="modal-body">
            <p>You tried to jump ahead. Complete the previous pages before continuing.</p>
            <p>Click below to continue from where you left off.</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary btn-lg" onClick={handleContinue}>Continue Learning</button>
          </div>
        </div>
      </div>
    </div>
  );
}
