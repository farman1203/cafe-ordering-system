import { useEffect } from 'react';
import { X } from 'lucide-react';

// Generic popup: closes with Esc or clicking the dark background, and stops the page scrolling behind it
export default function Modal({ title, onClose, children, size = 'md', closable = true }) {
  useEffect(() => {
    const onKey = (e) => closable && e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, closable]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closable && onClose?.()}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        {closable && (
          <button className="modal__close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        )}
        {title && <h2 className="modal__title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
