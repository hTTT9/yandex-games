/** Quiet Cove fishing scene — atmospheric canvas (original art, classic browser-fishing feel) */

import { getFishImage } from '../fishPics.js';

export function createScene(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 420;
  let h = 720;
  let dpr = 1;

  const state = {
    bgId: 'dawn',
    rodSkin: false,
    tod: 'morning',
    phase: 'idle',
    power: 0,
    floatX: 0.55,
    floatY: 0.42,
    bob: 0,
    biteDip: 0,
    fishPullX: 0,
    fishPullY: 0,
    splash: 0,
    castBend: 0,
    time: 0,
    hotspots: [],
    selectedHotspot: -1,
    weatherId: 'cloudy',
    lucky: false,
    bobberColor: '#e85d4c',
    rodKind: 'float',
    fightColor: '#3d6b7a',
    fightFish: null,
    cameraShake: 0,
    spotId: 'pier',
  };

  const bgImages = {
    dawn: new Image(),
    day: new Image(),
    evening: new Image(),
  };
  bgImages.dawn.src = 'assets/pier-dawn.jpg';
  bgImages.day.src = 'assets/pier-day.jpg';
  bgImages.evening.src = 'assets/pier-evening.jpg';
  let bgReady = 0;
  Object.values(bgImages).forEach((img) => {
    img.onload = () => { bgReady += 1; };
  });

  function currentBgImage() {
    // Spot suggests a base landscape; cosmetic bgId still wins when set
    const spotPhoto = {
      pier: 'dawn',
      reeds: 'day',
      lilies: 'dawn',
      bridge: 'day',
      snags: 'evening',
      pond: 'dawn',
      channel: 'day',
      deep: 'evening',
      open: 'day',
    };
    if (state.bgId === 'sunset') return bgImages.evening;
    if (state.bgId === 'mist') return bgImages.day;
    if (state.tod === 'night') return bgImages.evening;
    if (state.tod === 'evening') return bgImages.evening;
    if (state.tod === 'day') return bgImages.day;
    const key = spotPhoto[state.spotId] || state.bgId || 'dawn';
    return bgImages[key] || bgImages.dawn;
  }

  function drawSpotGrade() {
    const id = state.spotId || 'pier';
    const grades = {
      pier: null,
      reeds: 'rgba(40, 90, 50, 0.16)',
      lilies: 'rgba(120, 180, 140, 0.14)',
      bridge: 'rgba(40, 50, 70, 0.18)',
      snags: 'rgba(60, 45, 25, 0.22)',
      pond: 'rgba(70, 120, 80, 0.18)',
      channel: 'rgba(30, 90, 130, 0.16)',
      deep: 'rgba(10, 25, 50, 0.28)',
      open: 'rgba(180, 210, 230, 0.1)',
    };
    const c = grades[id];
    if (c) {
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawSpotProps(t) {
    const id = state.spotId || 'pier';
    const wt = h * 0.42;
    if (id === 'reeds') {
      for (let i = 0; i < 22; i++) {
        const x = w * (0.02 + i * 0.035);
        const sway = Math.sin(t * 1.2 + i) * 5;
        ctx.strokeStyle = `rgba(30, 80, 40, ${0.35 + (i % 3) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.72);
        ctx.quadraticCurveTo(x + sway, wt + 20, x + sway * 0.4, wt - 10 - (i % 4) * 6);
        ctx.stroke();
      }
    }
    if (id === 'lilies') {
      for (let i = 0; i < 9; i++) {
        const x = w * (0.22 + (i % 5) * 0.12);
        const y = h * (0.48 + Math.floor(i / 5) * 0.08 + Math.sin(t + i) * 0.01);
        ctx.fillStyle = 'rgba(50, 120, 70, 0.45)';
        ctx.beginPath();
        ctx.ellipse(x, y, 16, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(220, 180, 80, 0.55)';
        ctx.beginPath();
        ctx.arc(x + 3, y - 1, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (id === 'bridge') {
      ctx.fillStyle = 'rgba(40, 30, 24, 0.55)';
      for (const x of [w * 0.28, w * 0.5, w * 0.72]) {
        ctx.fillRect(x - 6, wt - 30, 12, h * 0.4);
      }
      ctx.fillRect(w * 0.22, wt - 36, w * 0.56, 10);
    }
    if (id === 'snags') {
      ctx.strokeStyle = 'rgba(60, 40, 24, 0.55)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.62);
      ctx.quadraticCurveTo(w * 0.35, h * 0.5, w * 0.48, h * 0.58);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.55, h * 0.66);
      ctx.quadraticCurveTo(w * 0.7, h * 0.52, w * 0.85, h * 0.6);
      ctx.stroke();
    }
    if (id === 'pond') {
      ctx.fillStyle = 'rgba(200, 230, 200, 0.12)';
      ctx.fillRect(0, wt, w, h * 0.35);
    }
    if (id === 'channel') {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = 'rgba(220,240,255,0.8)';
      for (let i = 0; i < 5; i++) {
        const y = wt + 20 + i * 18;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const yy = y + Math.sin(t * 2 + x * 0.05 + i) * 3;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    if (id === 'deep') {
      const v = ctx.createRadialGradient(w * 0.5, h * 0.55, 20, w * 0.5, h * 0.55, w * 0.7);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0, 10, 30, 0.45)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    }
    if (id === 'open') {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, wt - 20, w, 40);
    }
  }

  function drawPhotoBg() {
    const img = currentBgImage();
    if (!img.complete || !img.naturalWidth) return false;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    // time-of-day grade
    if (state.tod === 'night') {
      ctx.fillStyle = 'rgba(8, 18, 40, 0.55)';
      ctx.fillRect(0, 0, w, h);
    } else if (state.tod === 'evening' && state.bgId !== 'sunset') {
      ctx.fillStyle = 'rgba(255, 120, 60, 0.08)';
      ctx.fillRect(0, 0, w, h);
    } else if (state.bgId === 'mist') {
      ctx.fillStyle = 'rgba(200, 220, 230, 0.18)';
      ctx.fillRect(0, 0, w, h);
    }
    return true;
  }

  function drawWaterSheen(t) {
    const top = h * 0.34;
    const bot = h * 0.72;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, w, bot - top);
    ctx.clip();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const y = top + 10 + i * ((bot - top) / 8);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const yy = y + Math.sin(t * 1.4 + x * 0.04 + i) * 2.2;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedHotspots() {
    // Sit on the lake surface of photo BGs (below horizon, above pier boards)
    state.hotspots = [
      { x: 0.30 + Math.random() * 0.08, y: 0.56 + Math.random() * 0.04, r: 0.055 },
      { x: 0.50 + Math.random() * 0.08, y: 0.52 + Math.random() * 0.04, r: 0.06 },
      { x: 0.68 + Math.random() * 0.07, y: 0.58 + Math.random() * 0.035, r: 0.05 },
    ];
    state.selectedHotspot = -1;
  }

  function skyStops() {
    if (state.tod === 'evening') {
      return state.bgId === 'mist'
        ? ['#d4a090', '#7a8aaa', '#2e4258']
        : ['#ffb078', '#d07090', '#3a4a78'];
    }
    if (state.tod === 'night') return ['#151c34', '#1e3450', '#163848'];
    if (state.tod === 'day') {
      return state.bgId === 'mist'
        ? ['#d8e0e8', '#96b4bc', '#3e7888']
        : ['#c4e0f6', '#78b8d0', '#2c8098'];
    }
    return state.bgId === 'mist'
      ? ['#d0dce6', '#92b0c0', '#3c7080']
      : ['#f7d0a0', '#88c0d0', '#2c7690'];
  }

  function waterTop() {
    return h * 0.36;
  }

  function pierY() {
    return h * 0.78;
  }

  function drawClouds(t) {
    if (state.tod === 'night') return;
    const cloudy = state.weatherId === 'cloudy' || state.weatherId === 'rain';
    const n = cloudy ? 5 : 2;
    for (let i = 0; i < n; i++) {
      const cx = ((i * 0.28 + t * 0.012) % 1.3) * w - w * 0.15;
      const cy = h * (0.08 + (i % 3) * 0.05);
      const s = cloudy ? 1.15 : 0.85;
      ctx.fillStyle = cloudy ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 22 * s, cy + 2, 28 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 18 * s, cy + 3, 22 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBackground(t) {
    const shake = state.cameraShake || 0;
    if (shake > 0) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * shake * 6, (Math.random() - 0.5) * shake * 4);
    }

    if (drawPhotoBg()) {
      drawSpotGrade();
      drawWaterSheen(t);
      drawSpotProps(t);
      if (state.lucky) {
        ctx.fillStyle = 'rgba(217, 164, 65, 0.08)';
        ctx.fillRect(0, 0, w, h);
      }
      drawAngler(t);
      if (shake > 0) ctx.restore();
      return;
    }

    const [c0, c1, c2] = skyStops();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, c0);
    g.addColorStop(0.38, c1);
    g.addColorStop(0.55, c2);
    g.addColorStop(1, '#164858');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    drawClouds(t);

    // sun / moon
    ctx.beginPath();
    if (state.tod === 'night') {
      ctx.fillStyle = 'rgba(230, 235, 255, 0.55)';
      ctx.arc(w * 0.78, h * 0.12, w * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(230, 235, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.12, w * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const sx = w * (state.tod === 'evening' ? 0.2 : 0.8);
      const sy = h * (state.tod === 'evening' ? 0.16 : 0.12);
      const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, w * 0.22);
      glow.addColorStop(0, state.tod === 'evening' ? 'rgba(255,200,140,0.7)' : 'rgba(255,240,190,0.75)');
      glow.addColorStop(1, 'rgba(255,220,160,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, w * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = state.tod === 'evening' ? '#ffc090' : '#ffe8b0';
      ctx.beginPath();
      ctx.arc(sx, sy, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }

    // far shore hills
    ctx.fillStyle = state.tod === 'night' ? 'rgba(20, 40, 48, 0.55)' : 'rgba(35, 70, 72, 0.28)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.38);
    ctx.quadraticCurveTo(w * 0.22, h * 0.30, w * 0.48, h * 0.37);
    ctx.quadraticCurveTo(w * 0.72, h * 0.44, w, h * 0.34);
    ctx.lineTo(w, waterTop() + 20);
    ctx.lineTo(0, waterTop() + 20);
    ctx.fill();

    // mid trees silhouette
    ctx.fillStyle = state.tod === 'night' ? 'rgba(18, 36, 40, 0.5)' : 'rgba(28, 58, 52, 0.35)';
    for (let i = 0; i < 7; i++) {
      const tx = w * (0.05 + i * 0.14);
      const th = 18 + (i % 3) * 10;
      ctx.beginPath();
      ctx.moveTo(tx, waterTop() + 8);
      ctx.lineTo(tx + 10, waterTop() + 8 - th);
      ctx.lineTo(tx + 20, waterTop() + 8);
      ctx.fill();
    }

    // water body with depth
    const wt = waterTop();
    const wg = ctx.createLinearGradient(0, wt, 0, pierY());
    wg.addColorStop(0, state.tod === 'night' ? 'rgba(30, 70, 90, 0.55)' : 'rgba(120, 190, 210, 0.35)');
    wg.addColorStop(0.45, state.tod === 'night' ? 'rgba(20, 55, 75, 0.75)' : 'rgba(40, 120, 140, 0.55)');
    wg.addColorStop(1, 'rgba(18, 70, 88, 0.92)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, wt, w, pierY() - wt + 20);

    // caustic bands
    ctx.save();
    ctx.globalAlpha = state.tod === 'night' ? 0.08 : 0.18;
    for (let i = 0; i < 9; i++) {
      const y = wt + 12 + i * ((pierY() - wt) / 9);
      ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.55)' : 'rgba(180,230,240,0.4)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const yy = y + Math.sin(t * 1.15 + x * 0.035 + i * 0.7) * (2.8 + i * 0.15);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();

    // reeds left bank
    for (let i = 0; i < 18; i++) {
      const x = w * (0.01 + i * 0.022);
      const sway = Math.sin(t * 1.1 + i * 0.55) * 6;
      const base = wt + 28 + (i % 4) * 4;
      ctx.strokeStyle = `rgba(${40 + i * 2}, ${90 + i}, 55, ${0.35 + (i % 3) * 0.1})`;
      ctx.lineWidth = 2 + (i % 3) * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, pierY() - 10);
      ctx.quadraticCurveTo(x + sway, base, x + sway * 0.5, wt - 8 - (i % 5) * 4);
      ctx.stroke();
    }

    // lily pads + flowers
    for (let i = 0; i < 6; i++) {
      const lx = w * (0.52 + i * 0.075);
      const ly = wt + 36 + (i % 2) * 14 + Math.sin(t * 0.8 + i) * 2.5;
      ctx.fillStyle = 'rgba(45, 110, 70, 0.55)';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 16, 8, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(60, 130, 80, 0.35)';
      ctx.beginPath();
      ctx.ellipse(lx + 3, ly - 1, 10, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 210, 220, 0.7)';
        ctx.beginPath();
        ctx.arc(lx + 2, ly - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // soft underwater fish silhouettes while waiting
    if (state.phase === 'wait' || state.phase === 'bite') {
      ctx.fillStyle = 'rgba(20, 50, 60, 0.18)';
      const fx = w * (0.4 + Math.sin(t * 0.6) * 0.12);
      const fy = wt + 70 + Math.sin(t * 1.2) * 8;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 22, 8, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    drawPier(t);
    drawAngler(t);

    if (state.lucky) {
      ctx.fillStyle = 'rgba(217, 164, 65, 0.1)';
      ctx.fillRect(0, 0, w, h);
    }
    if (shake > 0) ctx.restore();
  }

  function drawPier(t) {
    const py = pierY();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const y = py - 6 + Math.sin(t * 2 + x * 0.04) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // first-person dock boards
    const deck = ctx.createLinearGradient(0, py - 20, 0, h);
    deck.addColorStop(0, '#9a6a42');
    deck.addColorStop(0.35, '#6d462c');
    deck.addColorStop(1, '#3a2416');
    ctx.fillStyle = deck;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, py + 18);
    ctx.quadraticCurveTo(w * 0.35, py - 10, w, py + 4);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 8; i++) {
      const t0 = i / 8;
      const t1 = (i + 1) / 8;
      const x0 = t0 * w;
      const x1 = t1 * w;
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, py + 10 + t0 * 20);
      ctx.lineTo(x0 * 0.85 + w * 0.08, h);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,220,180,0.08)';
      ctx.beginPath();
      ctx.moveTo(x1 - 4, py + 8);
      ctx.lineTo(x1 * 0.9, h);
      ctx.stroke();
    }

    // near posts
    ctx.fillStyle = '#5a3a24';
    ctx.fillRect(w * 0.72, py - 8, 12, 36);
    ctx.fillRect(w * 0.88, py - 4, 14, 40);
    ctx.fillStyle = 'rgba(255,220,180,0.12)';
    ctx.fillRect(w * 0.72 + 2, py - 8, 3, 36);
  }

  function drawAngler(t) {
    // first-person rod from bottom-right (classic browser fishing framing)
    const handX = w * 0.88;
    const handY = h * 0.76;
    const bend = state.phase === 'power' ? state.power * 0.4 : state.castBend * 0.55;
    const fightLean = state.phase === 'fight' ? state.fishPullX * 18 : 0;

    let tipX;
    let tipY;
    if (state.phase === 'idle') {
      tipX = w * 0.55 + Math.sin(t * 1.2) * 6;
      tipY = waterTop() + 36;
    } else if (state.phase === 'power') {
      tipX = w * (0.38 + state.power * 0.42);
      tipY = h * (0.56 - state.power * 0.12);
    } else {
      tipX = state.floatX * w + fightLean;
      tipY = state.floatY * h + Math.sin(state.bob) * 3 - state.biteDip * 14;
    }

    const midX = handX + (tipX - handX) * 0.4 - bend * 50;
    const midY = handY + (tipY - handY) * 0.25 - 40 - bend * 70;

    // rod shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handX + 4, handY + 4);
    ctx.quadraticCurveTo(midX + 4, midY + 6, tipX + 2, tipY + 4);
    ctx.stroke();

    // rod blank
    const rodGrad = ctx.createLinearGradient(handX, handY, tipX, tipY);
    rodGrad.addColorStop(0, state.rodSkin ? '#9b6fd6' : '#c9a878');
    rodGrad.addColorStop(0.5, state.rodSkin ? '#b57bff' : '#e8d4a8');
    rodGrad.addColorStop(1, state.rodSkin ? '#7a4cb0' : '#8a7050');
    ctx.strokeStyle = rodGrad;
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();

    // reel
    ctx.fillStyle = '#4a5560';
    ctx.beginPath();
    ctx.ellipse(handX - 8, handY - 10, 10, 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d0d8e0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#c0c8d0';
    ctx.beginPath();
    ctx.arc(handX - 14, handY - 16, 3, 0, Math.PI * 2);
    ctx.fill();

    // grip
    ctx.fillStyle = '#3a2a1c';
    ctx.beginPath();
    ctx.roundRect?.(handX - 6, handY - 4, 28, 10, 4);
    if (!ctx.roundRect) {
      ctx.fillRect(handX - 6, handY - 4, 28, 10);
    } else {
      ctx.fill();
    }
  }

  function drawHotspots(t) {
    if (state.phase !== 'idle' && state.phase !== 'power') return;
    state.hotspots.forEach((hs, i) => {
      const x = hs.x * w;
      const y = hs.y * h;
      const pulse = 1 + Math.sin(t * 2.2 + i) * 0.08;
      const selected = i === state.selectedHotspot;
      const rx = hs.r * w * pulse;
      const ry = rx * 0.32; // flat on water plane
      for (let ring = 0; ring < 3; ring++) {
        const s = 0.65 + ring * 0.28;
        ctx.beginPath();
        ctx.ellipse(x, y, rx * s, ry * s, 0, 0, Math.PI * 2);
        ctx.strokeStyle = selected
          ? `rgba(255, 200, 90, ${0.7 - ring * 0.18})`
          : `rgba(230, 245, 255, ${0.4 - ring * 0.1})`;
        ctx.lineWidth = selected ? 2.4 : 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = selected ? 'rgba(255, 180, 70, 0.22)' : 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawFloat() {
    if (state.phase === 'idle' || state.phase === 'power') return;
    const x = state.floatX * w;
    const y = state.floatY * h + Math.sin(state.bob) * 3.5 - state.biteDip * 16;

    // line shimmer
    if (state.phase !== 'castfly') {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      const ax = w * 0.88;
      const ay = h * 0.76;
      ctx.moveTo(ax - 10, ay - 16);
      ctx.quadraticCurveTo((ax + x) / 2, Math.min(ay, y) - 30, x, y - 10);
      ctx.stroke();
    }

    if (state.splash > 0) {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const rr = 10 + (1 - state.splash) * 28;
        ctx.strokeStyle = `rgba(232,246,248,${state.splash * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + 6, rr * (0.6 + i * 0.12), a, a + 1.2);
        ctx.stroke();
      }
      // droplets
      ctx.fillStyle = `rgba(230,245,250,${state.splash})`;
      for (let i = 0; i < 6; i++) {
        const a = i * 1.1 + state.time;
        ctx.beginPath();
        ctx.arc(
          x + Math.cos(a) * (8 + (1 - state.splash) * 20),
          y + Math.sin(a) * (6 + (1 - state.splash) * 12),
          2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // reflection
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // bobber body
    const col = state.bobberColor || '#e85d4c';
    const g = ctx.createLinearGradient(x - 6, y - 10, x + 6, y + 10);
    g.addColorStop(0, '#fff6ee');
    g.addColorStop(0.45, col);
    g.addColorStop(1, '#7a2a20');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, 6.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7f1e8';
    ctx.fillRect(x - 1.6, y - 18, 3.2, 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x - 1.5, y - 2, 2, 3, -0.3, 0, Math.PI * 2);
    ctx.stroke();

    // bite rings
    if (state.phase === 'bite' || state.biteDip > 0.3) {
      ctx.strokeStyle = `rgba(224,122,79,${0.35 + state.biteDip * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + 8, 10 + state.biteDip * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawWeather(t) {
    if (state.weatherId === 'rain') {
      ctx.strokeStyle = 'rgba(220, 235, 245, 0.4)';
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 36; i++) {
        const x = ((i * 53 + t * 110) % (w + 40)) - 20;
        const y = ((i * 71 + t * 260) % (h * 0.72));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y + 12);
        ctx.stroke();
      }
    }
  }

  function drawFightFish() {
    if (state.phase !== 'fight') return;
    const x = state.floatX * w + state.fishPullX * 48;
    const y = state.floatY * h + 42 + state.fishPullY * 26;
    const thrash = Math.sin(state.time * 14) * 0.2;
    const fish = state.fightFish;
    const img = fish ? getFishImage(fish) : null;

    // splash trails
    ctx.fillStyle = 'rgba(200,230,240,0.28)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x - i * 11, y + 6 + Math.sin(state.time * 10 + i) * 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.25 + state.fishPullX * 0.4 + thrash);

    if (img && img.complete && img.naturalWidth) {
      const fw = 78;
      const fh = 42;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, fw * 0.52, fh * 0.48, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(img, -fw / 2, -fh / 2, fw, fh);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, fw * 0.52, fh * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const col = state.fightColor || '#3d6b7a';
      const body = ctx.createLinearGradient(-20, -8, 30, 8);
      body.addColorStop(0, col);
      body.addColorStop(1, '#1a3844');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(38, -10 + thrash * 10);
      ctx.lineTo(36, 10 - thrash * 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCastArc() {
    if (state.phase !== 'power') return;
    const power = state.power;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.setLineDash([6, 7]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const ax = w * 0.88;
    const ay = h * 0.76;
    const tx = w * (0.35 + power * 0.5);
    const ty = h * (0.58 - power * 0.14);
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(w * 0.55, h * 0.36, tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);
    // sweet marker
    if (power >= 0.58 && power <= 0.76) {
      ctx.fillStyle = 'rgba(63,154,120,0.55)';
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(dt) {
    state.time += dt;
    if (state.phase === 'wait' || state.phase === 'bite' || state.phase === 'fight') {
      state.bob += dt * (state.phase === 'bite' ? 5 : 2.6);
      if (state.phase !== 'bite') state.biteDip = Math.max(0, state.biteDip - dt * 1.6);
    }
    if (state.splash > 0) state.splash = Math.max(0, state.splash - dt * 1.35);
    if (state.cameraShake > 0) state.cameraShake = Math.max(0, state.cameraShake - dt * 2.5);
    if (state.castBend > 0 && state.phase !== 'power') {
      state.castBend = Math.max(0, state.castBend - dt * 1.8);
    }
    drawBackground(state.time);
    drawWeather(state.time);
    drawHotspots(state.time);
    drawCastArc();
    drawFightFish();
    drawFloat();
  }

  function pickHotspot(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    let best = -1;
    let bestD = 999;
    state.hotspots.forEach((hs, i) => {
      const dx = (x - hs.x) / (hs.r * 1.5);
      const dy = (y - hs.y) / (hs.r * 0.55);
      const d = Math.hypot(dx, dy);
      if (d < 1 && d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) state.selectedHotspot = best;
    return best;
  }

  return {
    state,
    resize,
    frame,
    seedHotspots,
    pickHotspot,
    setBg(id) { state.bgId = id; },
    setSpot(id) { state.spotId = id || 'pier'; },
    setRodSkin(v) { state.rodSkin = !!v; },
    setTod(tod) { state.tod = tod; },
    setLucky(v) { state.lucky = !!v; },
    setBobberColor(c) { state.bobberColor = c || '#e85d4c'; },
    setRodKind(k) { state.rodKind = k || 'float'; },
    setWeather(id) { state.weatherId = id || 'cloudy'; },
    setFightColor(c) { state.fightColor = c || '#3d6b7a'; },
    setFightFish(f) { state.fightFish = f || null; },
    shake(amount = 1) { state.cameraShake = Math.max(state.cameraShake, amount); },
  };
}

/** Mini vignette for spot list cards */
export function drawSpotThumb(canvas, spotId, t = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const palettes = {
    pier: ['#f0c090', '#6aa8bc', '#6d4a30'],
    reeds: ['#c8d890', '#4a8a70', '#3a6040'],
    lilies: ['#d8e8f0', '#5a9aaa', '#4a8a50'],
    bridge: ['#c0c8d0', '#5a7a90', '#5a4a40'],
    snags: ['#b0a890', '#3a6a70', '#4a3a28'],
    pond: ['#d0e0c8', '#4a9088', '#3a7050'],
    channel: ['#b8d0e0', '#3a7a98', '#2a5060'],
    deep: ['#8aa0b8', '#2a5070', '#1a3048'],
    open: ['#c8e0f0', '#4a90a8', '#3a7088'],
  };
  const p = palettes[spotId] || palettes.pier;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, p[0]);
  g.addColorStop(0.45, p[1]);
  g.addColorStop(1, p[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // distant shore
  ctx.fillStyle = 'rgba(20, 40, 40, 0.28)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.4);
  ctx.quadraticCurveTo(w * 0.4, h * 0.32, w, h * 0.42);
  ctx.lineTo(w, h * 0.55);
  ctx.lineTo(0, h * 0.55);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = h * (0.5 + i * 0.08);
    ctx.beginPath();
    for (let x = 0; x < w; x += 5) ctx.lineTo(x, y + Math.sin(t + x * 0.08 + i) * 1.4);
    ctx.stroke();
  }
  if (spotId === 'reeds' || spotId === 'lilies' || spotId === 'snags' || spotId === 'pond') {
    ctx.strokeStyle = 'rgba(30,70,40,0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(6 + i * 9, h * 0.88);
      ctx.quadraticCurveTo(8 + i * 9, h * 0.55, 4 + i * 9, h * 0.28);
      ctx.stroke();
    }
  }
  if (spotId === 'lilies') {
    ctx.fillStyle = 'rgba(40,110,60,0.45)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(18 + i * 18, h * 0.58, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (spotId === 'pier' || spotId === 'bridge') {
    ctx.fillStyle = p[2];
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    if (spotId === 'bridge') {
      ctx.fillRect(w * 0.3, h * 0.35, 5, h * 0.4);
      ctx.fillRect(w * 0.6, h * 0.35, 5, h * 0.4);
    }
  }
  if (spotId === 'deep') {
    const v = ctx.createRadialGradient(w * 0.5, h * 0.6, 4, w * 0.5, h * 0.6, w * 0.55);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,10,30,0.45)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
  if (spotId === 'channel' || spotId === 'open') {
    ctx.strokeStyle = 'rgba(220,240,255,0.35)';
    for (let i = 0; i < 3; i++) {
      const y = h * (0.52 + i * 0.08);
      ctx.beginPath();
      for (let x = 0; x < w; x += 4) ctx.lineTo(x, y + Math.sin(t * 2 + x * 0.1 + i) * 2);
      ctx.stroke();
    }
  }
}

export function drawMenuBackdrop(canvas, t) {
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const img = drawMenuBackdrop._img || (drawMenuBackdrop._img = Object.assign(new Image(), { src: 'assets/pier-dawn.jpg' }));
  if (img.complete && img.naturalWidth) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.fillStyle = 'rgba(8, 28, 40, 0.18)';
    ctx.fillRect(0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f7d4a4');
    g.addColorStop(0.45, '#3a8498');
    g.addColorStop(1, '#204e5e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // soft water shimmer
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    const y = h * (0.42 + i * 0.05);
    ctx.beginPath();
    for (let x = 0; x < w; x += 8) ctx.lineTo(x, y + Math.sin(t * 1.1 + x * 0.04 + i) * 2);
    ctx.stroke();
  }

  // first-person rod hint
  ctx.strokeStyle = '#e8d4a8';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w * 0.9, h * 0.95);
  ctx.quadraticCurveTo(w * 0.55, h * 0.45, w * 0.42, h * 0.5);
  ctx.stroke();
}
