export const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// "+91 98765-43210" -> "9876543210"  (mirrors the backend)
export const normalizePhone = (value) => {
  let d = String(value || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
};
export const isValidPhone = (value) => /^[6-9]\d{9}$/.test(normalizePhone(value));

// Which QR base URL to use: env value, or the current site if env is missing
export const getQrBaseUrl = () =>
  import.meta.env.VITE_QR_MENU_URL || window.location.origin;

export const buildTableUrl = (table) => {
  const url = new URL(getQrBaseUrl(), window.location.origin);
  url.searchParams.set('source', 'qr');
  if (table) url.searchParams.set('table', table);
  return url.toString();
};


