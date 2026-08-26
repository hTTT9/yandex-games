import { drawFishPhoto } from './fishPics.js';

/** Distinct fish drawings by shape id — prefers photoreal thumbnails */

export function drawFishArt(canvas, fish, opts = {}) {
  if (!opts.forceVector && drawFishPhoto(canvas, fish)) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // water plate
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, 'rgba(255,255,255,0.35)');
  bg.addColorStop(1, 'rgba(100,160,180,0.25)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.48;
  const cy = h * 0.52;
  const color = fish?.color || '#4a8';
  const accent = fish?.accent || '#fff';
  const shape = fish?.shape || 'slim';

  ctx.save();
  ctx.translate(cx, cy);
  if (opts.flip) ctx.scale(-1, 1);

  drawBody(ctx, shape, color, accent, w, h);
  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w * 0.16, -h * 0.04, Math.max(3, w * 0.025), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c2b33';
  ctx.beginPath();
  ctx.arc(-w * 0.155, -h * 0.04, Math.max(1.5, w * 0.012), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // rarity rim
  if (fish?.rarity === 'legend' || fish?.rarity === 'epic') {
    ctx.strokeStyle = fish.rarity === 'legend' ? 'rgba(217,164,65,0.55)' : 'rgba(155,111,214,0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);
  }
}

function drawBody(ctx, shape, color, accent, w, h) {
  ctx.fillStyle = color;
  const bw = w * 0.3;
  const bh = h * 0.22;

  if (shape === 'eel') {
    ctx.beginPath();
    ctx.moveTo(-bw, 0);
    ctx.bezierCurveTo(-bw * 0.2, -bh * 0.8, bw * 0.4, bh * 0.6, bw * 1.1, 0);
    ctx.bezierCurveTo(bw * 0.4, -bh * 0.5, -bw * 0.2, bh * 0.7, -bw, 0);
    ctx.fill();
    return;
  }

  if (shape === 'pike') {
    ctx.beginPath();
    ctx.ellipse(0, 0, bw * 1.05, bh * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bw * 0.7, 0);
    ctx.lineTo(bw * 1.35, -bh * 0.9);
    ctx.lineTo(bw * 1.35, bh * 0.9);
    ctx.closePath();
    ctx.fill();
    // jaw
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(-bw * 1.05, -bh * 0.15, bw * 0.35, bh * 0.35);
    ctx.globalAlpha = 1;
    return;
  }

  if (shape === 'carp' || shape === 'round' || shape === 'flat') {
    const ry = shape === 'flat' ? bh * 1.15 : bh * 1.05;
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, ry, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-bw * 0.15, -bh * 0.15, bw * 0.45, ry * 0.35, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(bw * 0.75, 0);
    ctx.lineTo(bw * 1.25, -bh);
    ctx.lineTo(bw * 1.25, bh);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (shape === 'spiny') {
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, bh * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = -bw * 0.4 + i * (bw * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, -bh * 0.7);
      ctx.lineTo(x + 4, -bh * 1.25);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(bw * 0.7, 0);
    ctx.lineTo(bw * 1.2, -bh * 0.7);
    ctx.lineTo(bw * 1.2, bh * 0.7);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (shape === 'cat') {
    ctx.beginPath();
    ctx.ellipse(0, 0, bw * 1.05, bh * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.9, bh * 0.2);
    ctx.quadraticCurveTo(-bw * 1.3, bh, -bw * 0.5, bh * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-bw * 0.9, -bh * 0.1);
    ctx.quadraticCurveTo(-bw * 1.35, -bh, -bw * 0.45, -bh * 0.8);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(bw * 0.75, 0);
    ctx.lineTo(bw * 1.2, -bh * 0.55);
    ctx.lineTo(bw * 1.2, bh * 0.55);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (shape === 'spirit') {
    const g = ctx.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, color);
    g.addColorStop(1, accent);
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(bw * 0.1, 0, bw * 0.7, bh * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  // slim / thick default
  const ry = shape === 'thick' ? bh * 1.05 : bh * 0.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, bw, ry, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(-bw * 0.1, -ry * 0.25, bw * 0.5, ry * 0.35, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(bw * 0.75, 0);
  ctx.lineTo(bw * 1.28, -ry * 0.95);
  ctx.lineTo(bw * 1.28, ry * 0.95);
  ctx.closePath();
  ctx.fill();
}
