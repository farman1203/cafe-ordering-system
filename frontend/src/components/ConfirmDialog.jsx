import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

// "Are you sure?" popup for destructive actions (delete, cancel order)
export default function ConfirmDialog({ title, message, confirmText = 'Confirm', danger = true, loading, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} size="sm">
      <div className="confirm">
        <div className={`confirm__icon ${danger ? 'confirm__icon--danger' : ''}`}><AlertTriangle size={28} /></div>
        <h3>{title}</h3>
        <p className="muted">{message}</p>
        <div className="confirm__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>Keep it</button>
          <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
