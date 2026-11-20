import { useMemo, useRef, useState } from 'react';
import { Copy, Download, Maximize2, Plus } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';
import QRCodeModal from '../components/QRCodeModal';
import { downloadQrPng } from '../utils/qr';
import { buildTableUrl } from '../utils/helpers';

const pad = (n) => `T${String(n).padStart(2, '0')}`;

function QrCard({ label, url, onEnlarge }) {
  const ref = useRef(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    catch { toast.error('Could not copy - select the link manually'); }
  };
  return (
    <div className="qr-card" ref={ref}>
      <h4>{label}</h4>
      <div className="qr-box"><QRCodeCanvas value={url} size={256} marginSize={2} level="M" style={{ width: '100%', height: 'auto' }} /></div>
      <small className="muted qr-url" title={url}>{url}</small>
      <div className="qr-card__actions">
        <button className="btn btn--primary btn--sm" onClick={() => downloadQrPng(ref.current.querySelector('canvas'), label)}><Download size={14} /> Download</button>
        <button className="icon-btn" onClick={copy} aria-label={`Copy link for ${label}`}><Copy size={16} /></button>
        <button className="icon-btn" onClick={onEnlarge} aria-label={`Enlarge QR for ${label}`}><Maximize2 size={16} /></button>
      </div>
    </div>
  );
}

export default function ManageQR() {
  const [count, setCount] = useState(10);
  const [custom, setCustom] = useState('');
  const [extra, setExtra] = useState([]);
  const [enlarged, setEnlarged] = useState(null);

  const tables = useMemo(() => [...Array.from({ length: count }, (_, i) => pad(i + 1)), ...extra], [count, extra]);

  const addCustom = (e) => {
    e.preventDefault();
    const name = custom.trim().toUpperCase();
    if (!/^[A-Z0-9-]{1,10}$/.test(name)) return toast.error('Use letters, numbers or - (max 10 characters)');
    if (tables.includes(name)) return toast.info(`${name} already exists`);
    setExtra((x) => [...x, name]); setCustom('');
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Table QR codes</h1><p className="muted">Print one per table. Scanning opens the menu with that table pre-selected.</p></div>
      </div>

      <div className="card qr-controls">
        <label className="field"><span>Number of tables (1–50)</span>
          <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 50))} />
        </label>
        <form className="field" onSubmit={addCustom}><span>Add a custom table (e.g. PATIO-1)</span>
          <div className="input-with-btn">
            <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={10} placeholder="PATIO-1" />
            <button className="btn btn--outline btn--sm" type="submit"><Plus size={15} /> Add</button>
          </div>
        </form>
      </div>

      <h3 className="qr-section-title">General menu QR</h3>
      <div className="qr-grid">
        <QrCard label="Brew & Bites Menu" url={buildTableUrl('')} onEnlarge={() => setEnlarged({ label: 'Brew & Bites Menu', url: buildTableUrl('') })} />
      </div>

      <h3 className="qr-section-title">Tables</h3>
      <div className="qr-grid">
        {tables.map((t) => (
          <QrCard key={t} label={`Table ${t}`} url={buildTableUrl(t)} onEnlarge={() => setEnlarged({ label: `Table ${t}`, url: buildTableUrl(t) })} />
        ))}
      </div>

      {enlarged && <QRCodeModal url={enlarged.url} label={enlarged.label} onClose={() => setEnlarged(null)} />}
    </>
  );
}
