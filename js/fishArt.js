import { drawFishPhoto, hasUniqueFishPhoto } from './fishPics.js';

/** Distinct fish drawings — HiDPI-aware, unified vector style for cards */

export function sizeFishCanvas(canvas, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const w = Math.max(1, Math.round(cssW));
  const h = Math.max(1, Math.round(cssH));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}

export function drawFishArt(canvas, fish, opts = {}) {
  const wantPhoto = !opts.forceVector && hasUniqueFishPhoto(fish);
  if (wantPhoto && drawFishPhoto(canvas, fish, opts)) return;

  const ctx = canvas.getContext('2d');
  const transform = ctx.getTransform?.();
  const cssMode = transform && transform.a !== 1;
  const w = cssMode ? canvas.width / transform.a : canvas.width;
  const h = cssMode ? canvas.height / transform.d : canvas.height;
  ctx.clearRect(0, 0, w, h);

  const color = fish?.color || '#4a8898';
  const accent = fish?.accent || '#d8e8f0';
  const shape = fish?.shape || 'slim';

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, 'rgba(210, 235, 245, 0.55)');
  bg.addColorStop(0.45, `${color}28`);
  bg.addColorStop(1, 'rgba(20, 50, 70, 0.35)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = h * (0.22 + i * 0.22);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const yy = y + Math.sin(x * 0.07 + i * 1.2) * 2.2;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  const cx = w * 0.48;
  const cy = h * 0.52;
  ctx.save();
  ctx.translate(cx, cy);
  if (opts.flip) ctx.scale(-1, 1);
  drawBody(ctx, shape, color, accent, w, h);

  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-w * 0.16, -h * 0.035, Math.max(2.8, w * 0.03), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a2830';
  ctx.beginPath();
  ctx.arc(-w * 0.155, -h * 0.035, Math.max(1.4, w * 0.014), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(-w * 0.168, -h * 0.045, Math.max(0.7, w * 0.006), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (fish?.rarity === 'legend' || fish?.rarity === 'epic') {
    ctx.strokeStyle = fish.rarity === 'legend' ? 'rgba(217,164,65,0.55)' : 'rgba(155,111,214,0.4)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(3, 3, w - 6, h - 6);
  }
}

/** Profile / browse / journal: prefer photoreal icons like bleak & perch */
export function drawFishCard(canvas, fish, cssW = 140, cssH = 72) {
  sizeFishCanvas(canvas, cssW, cssH);
  drawFishArt(canvas, fish, { forceVector: false });
}

function paintBody(ctx, color, accent, pathFn) {
  const g = ctx.createLinearGradient(-40, -20, 40, 24);
  g.addColorStop(0, accent);
  g.addColorStop(0.35, color);
  g.addColorStop(1, shade(color, -28));
  ctx.fillStyle = g;
  pathFn();
  ctx.fill();
}

function shade(hex, delta) {
  const n = hex.replace('#', '');
  if (n.length < 6) return hex;
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + delta));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + delta));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + delta));
  return `rgb(${r},${g},${b})`;
}

function addScales(ctx, bw, bh, accent) {
  ctx.strokeStyle = `${accent}55`;
  ctx.lineWidth = 0.8;
  for (let row = -2; row <= 2; row++) {
    for (let col = -3; col <= 2; col++) {
      const x = col * bw * 0.16 + (row % 2) * bw * 0.08;
      const y = row * bh * 0.22;
      if (x * x / (bw * bw) + y * y / (bh * bh) > 0.7) continue;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.2, bw * 0.045), 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
  }
}

function addTail(ctx, color, bw, bh, spread = 1) {
  const g = ctx.createLinearGradient(bw * 0.6, 0, bw * 1.3, 0);
  g.addColorStop(0, color);
  g.addColorStop(1, shade(color, -20));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(bw * 0.72, 0);
  ctx.lineTo(bw * 1.28, -bh * 0.95 * spread);
  ctx.quadraticCurveTo(bw * 1.1, 0, bw * 1.28, bh * 0.95 * spread);
  ctx.closePath();
  ctx.fill();
}

function addFins(ctx, color, accent, bw, bh) {
  ctx.fillStyle = `${accent}cc`;
  ctx.beginPath();
  ctx.moveTo(-bw * 0.05, -bh * 0.55);
  ctx.quadraticCurveTo(bw * 0.15, -bh * 1.15, bw * 0.35, -bh * 0.4);
  ctx.quadraticCurveTo(bw * 0.1, -bh * 0.7, -bw * 0.05, -bh * 0.55);
  ctx.fill();
  ctx.fillStyle = `${color}aa`;
  ctx.beginPath();
  ctx.moveTo(-bw * 0.05, bh * 0.2);
  ctx.quadraticCurveTo(bw * 0.05, bh * 0.85, bw * 0.25, bh * 0.35);
  ctx.quadraticCurveTo(bw * 0.05, bh * 0.45, -bw * 0.05, bh * 0.2);
  ctx.fill();
}

function drawBody(ctx, shape, color, accent, w, h) {
  const bw = w * 0.3;
  const bh = h * 0.22;

  if (shape === 'eel') {
    paintBody(ctx, color, accent, () => {
      ctx.beginPath();
      ctx.moveTo(-bw, 0);
      ctx.bezierCurveTo(-bw * 0.2, -bh * 0.85, bw * 0.4, bh * 0.55, bw * 1.15, 0);
      ctx.bezierCurveTo(bw * 0.4, -bh * 0.55, -bw * 0.2, bh * 0.75, -bw, 0);
    });
    ctx.strokeStyle = `${accent}66`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const x = -bw * 0.6 + i * bw * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, -bh * 0.25);
      ctx.lineTo(x + 4, bh * 0.3);
      ctx.stroke();
    }
    return;
  }

  if (shape === 'pike') {
    paintBody(ctx, color, accent, () => {
      ctx.beginPath();
      ctx.ellipse(0, 0, bw * 1.05, bh * 0.72, 0, 0, Math.PI * 2);
    });
    addScales(ctx, bw, bh * 0.7, accent);
    addTail(ctx, color, bw, bh, 1.05);
    ctx.fillStyle = `${accent}88`;
    ctx.fillRect(-bw * 1.0, -bh * 0.12, bw * 0.32, bh * 0.28);
    addFins(ctx, color, accent, bw, bh);
    return;
  }

  if (shape === 'carp' || shape === 'round' || shape === 'flat') {
    const ry = shape === 'flat' ? bh * 1.15 : bh * 1.05;
    paintBody(ctx, color, accent, () => {
      ctx.beginPath();
      ctx.ellipse(0, 0, bw, ry, -0.08, 0, Math.PI * 2);
    });
    addScales(ctx, bw * 0.95, ry, accent);
    addTail(ctx, color, bw, bh, shape === 'flat' ? 0.85 : 1);
    addFins(ctx, color, accent, bw, ry);
    return;
  }

  if (shape === 'spiny') {
    paintBody(ctx, color, accent, () => {
      ctx.beginPath();
      ctx.ellipse(0, 0, bw, bh * 0.9, 0, 0, Math.PI * 2);
    });
    addScales(ctx, bw, bh * 0.85, accent);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const x = -bw * 0.35 + i * (bw * 0.18);
      ctx.beginPath();
      ctx.moveTo(x, -bh * 0.55);
      ctx.lineTo(x + 3, -bh * 1.2);
      ctx.stroke();
    }
    // Vertical stripes (perch family)
    ctx.strokeStyle = `${shade(color, -40)}88`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x = -bw * 0.45 + i * bw * 0.28;
      ctx.beginPath();
      ctx.moveTo(x, -bh * 0.55);
      ctx.lineTo(x + 4, bh * 0.55);
      ctx.stroke();
    }
    addTail(ctx, color, bw, bh, 0.85);
    addFins(ctx, color, accent, bw, bh);
    return;
  }

  if (shape === 'cat') {
    paintBody(ctx, color, accent, () => {
      ctx.beginPath();
      ctx.ellipse(0, 0, bw * 1.05, bh * 0.85, 0, 0, Math.PI * 2);
    });
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.9, bh * 0.2);
    ctx.quadraticCurveTo(-bw * 1.35, bh, -bw * 0.45, bh * 0.95);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-bw * 0.9, -bh * 0.1);
    ctx.quadraticCurveTo(-bw * 1.4, -bh, -bw * 0.4, -bh * 0.85);
    ctx.stroke();
    addTail(ctx, color, bw, bh, 0.7);
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

  const ry = shape === 'thick' ? bh * 1.05 : bh * 0.8;
  paintBody(ctx, color, accent, () => {
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, ry, -0.12, 0, Math.PI * 2);
  });
  addScales(ctx, bw, ry, accent);
  addTail(ctx, color, bw, bh, shape === 'thick' ? 0.9 : 1);
  addFins(ctx, color, accent, bw, ry);
}
