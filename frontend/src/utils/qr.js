// Saves a QR <canvas> as a printable PNG with a label underneath (e.g. "Table T05")
export function downloadQrPng(sourceCanvas, label) {
  if (!sourceCanvas) return;
  const pad = 30;
  const labelH = 70;
  const out = document.createElement('canvas');
  out.width = sourceCanvas.width + pad * 2;
  out.height = sourceCanvas.height + pad * 2 + labelH;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(sourceCanvas, pad, pad);
  ctx.fillStyle = '#2b1b12';
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText(label, out.width / 2, sourceCanvas.height + pad + 42);
  ctx.font = '16px Arial, sans-serif';
  ctx.fillStyle = '#7a6556';
  ctx.fillText('Scan to order · Brew & Bites', out.width / 2, sourceCanvas.height + pad + 66);

  const link = document.createElement('a');
  link.download = `${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-qr.png`;
  link.href = out.toDataURL('image/png');
  link.click();
}
