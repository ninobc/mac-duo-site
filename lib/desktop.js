// A stand-in desktop for the demo: the wallpaper with a lock-screen clock,
// on a margin of its own stretched edges (what the app's GPU pad pass does).
export const PADDING = 176;

export function buildDesktop(image, W, H, scale) {
  const desk = document.createElement('canvas');
  desk.width = Math.round(W * scale); desk.height = Math.round(H * scale);
  const c = desk.getContext('2d');
  c.scale(scale, scale);
  const s = Math.max(W / image.width, H / image.height);
  const w = image.width * s, h = image.height * s;
  c.drawImage(image, (W - w) / 2, (H - h) / 2, w, h);
  // Menu bar.
  c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(0, 0, W, 24);
  c.fillStyle = 'rgba(255,255,255,0.92)';
  c.font = '600 12px -apple-system, system-ui, Inter, sans-serif';
  c.textBaseline = 'middle';
  const now = new Date();
  c.textAlign = 'right';
  c.fillText(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + '  9:41', W - 14, 12);
  // Clock.
  c.textAlign = 'center';
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 24;
  c.fillStyle = 'rgba(255,255,255,0.96)';
  c.font = `500 ${Math.round(H * 0.05)}px -apple-system, system-ui, Inter, sans-serif`;
  c.fillText(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }), W / 2, H * 0.19);
  c.font = `700 ${Math.round(H * 0.2)}px -apple-system, system-ui, Inter, sans-serif`;
  c.fillText('9:41', W / 2, H * 0.33);
  // Dock.
  c.shadowBlur = 30; c.shadowColor = 'rgba(0,0,0,0.25)';
  const dockW = W * 0.34, dockH = H * 0.075, dx = (W - dockW) / 2, dy = H - dockH - 12;
  c.fillStyle = 'rgba(255,255,255,0.35)';
  roundRect(c, dx, dy, dockW, dockH, dockH * 0.32); c.fill();
  c.shadowBlur = 0;
  const n = 8, pad = dockH * 0.18, size = dockH - 2 * pad, gap = (dockW - n * size - 2 * pad) / (n - 1);
  const tints = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#64748B'];
  for (let i = 0; i < n; i++) {
    c.fillStyle = tints[i];
    roundRect(c, dx + pad + i * (size + gap), dy + pad, size, size, size * 0.24); c.fill();
  }

  // Padded canvas on a black margin, so the blur lets the edges dissolve.
  const padded = document.createElement('canvas');
  const pw = Math.round((W + 2 * PADDING) * scale), ph = Math.round((H + 2 * PADDING) * scale);
  padded.width = pw; padded.height = ph;
  const p = padded.getContext('2d');
  p.fillStyle = '#000'; p.fillRect(0, 0, pw, ph);
  const ip = Math.round(PADDING * scale);
  p.drawImage(desk, ip, ip);
  return padded;
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
