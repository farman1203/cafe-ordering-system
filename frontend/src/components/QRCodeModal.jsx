import { useRef } from 'react';
import { Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from './Modal';
import { downloadQrPng } from '../utils/qr';

// Shows one QR code big, with a download button.
export default function QRCodeModal({ url, label, onClose }) {
  const wrapRef = useRef(null);
  return (
    <Modal title={label} onClose={onClose} size="sm">
      <div className="qr-modal" ref={wrapRef}>
        <div className="qr-box"><QRCodeCanvas value={url} size={240} marginSize={2} level="M" /></div>
        <p className="muted qr-url">{url}</p>
        <p className="muted">Point your phone camera here to open the menu.</p>
        <button className="btn btn--primary" onClick={() => downloadQrPng(wrapRef.current.querySelector('canvas'), label)}>
          <Download size={16} /> Download PNG
        </button>
      </div>
    </Modal>
  );
}
