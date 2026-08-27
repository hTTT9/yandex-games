/** Quiet Cove fishing scene — atmospheric canvas (original art, classic browser-fishing feel) */

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
    extraFloats: [],
    occupiedHotspots: [],
    weatherId: 'cloudy',
    lucky: false,
    bobberColor: '#e85d4c',
    rodKind: 'float',
    rodId: 'reed',
    fightColor: '#3d6b7a',
    fightFish: null,
    fightMystery: null,
    cameraShake: 0,
    spotId: 'pier',
    rodLines: [],
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
    // The photograph must agree with the HUD time. Spot identity is added by
    // grading/props instead of locking a sunset image under a "Night" label.
    if (state.tod === 'evening') return bgImages.evening;
    if (state.tod === 'day' || state.tod === 'night') return bgImages.day;
    return bgImages.dawn;
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

  function drawReedBlade(x, yBase, tall, sway, thick, tint, alpha, opts = {}) {
    const tipX = x + sway;
    const tipY = yBase - tall;
    const midX = x + sway * 0.45;
    const midY = yBase - tall * 0.52;
    // soft reflection in water (short, fading)
    if (opts.reflect !== false) {
      ctx.strokeStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${alpha * 0.18})`;
      ctx.lineWidth = Math.max(0.8, thick * 0.7);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, yBase + 1);
      ctx.quadraticCurveTo(x - sway * 0.2, yBase + tall * 0.18, x - sway * 0.35, yBase + tall * 0.32);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${alpha})`;
    ctx.lineWidth = thick;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, yBase);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
    // leaf flare
    ctx.lineWidth = Math.max(0.9, thick * 0.65);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY + tall * 0.08);
    ctx.quadraticCurveTo(tipX + sway * 0.4 + 4, tipY + tall * 0.18, tipX - 2, tipY + tall * 0.28);
    ctx.stroke();
    // cattail head on taller blades
    if (opts.head) {
      ctx.fillStyle = `rgba(${90 + (opts.headSeed % 20)}, ${70 + (opts.headSeed % 15)}, ${40}, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.ellipse(tipX, tipY + 5, 2.2, 5.5, sway * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawReedClump(cx, yBase, count, t, seed, scale = 1) {
    // triangular density: more stalks near clump center
    for (let i = 0; i < count; i++) {
      const n = seed * 12.9898 + i * 78.233;
      const r = Math.abs(Math.sin(n) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(n * 1.7) * 23758.5453) % 1;
      const r3 = Math.abs(Math.sin(n * 2.3) * 13758.5453) % 1;
      const spread = (r - 0.5) * (r2 * 0.55 + 0.45) * 34 * scale;
      const x = cx + spread + Math.sin(t * 0.85 + i + seed) * 1.1;
      const tall = (22 + r2 * 36 + (i % 4) * 5) * scale;
      const sway = Math.sin(t * 1.05 + i * 0.65 + seed) * (2.5 + r * 4.5) * scale;
      const thick = (1.05 + r * 1.6) * scale;
      const tint = r > 0.58
        ? [32 + (i % 4) * 5, 74 + (i % 5) * 7, 38 + (i % 3) * 3]
        : [44 + (i % 3) * 6, 88 + (i % 4) * 6, 46 + (i % 2) * 4];
      const alpha = 0.34 + r * 0.4;
      drawReedBlade(x, yBase + r2 * 5, tall, sway, thick, tint, alpha, {
        head: r3 > 0.62 && tall > 28 * scale,
        headSeed: Math.floor(r3 * 40),
        reflect: true,
      });
    }
  }

  /** Bank vegetation only: left/right shores near pier — never open-water center */
  function drawBankVegetation(t, mode) {
    const shoreY = Math.min(h * 0.74, pierY() - 8);
    // Clip to side margins so stalks never sit in lake center
    const leftBeds = mode === 'always'
      ? [
          { x: 0.035, n: 6, s: 0.78, seed: 1.1 },
          { x: 0.095, n: 5, s: 0.7, seed: 2.4 },
        ]
      : [
          { x: 0.03, n: 12, s: 1.05, seed: 8.1 },
          { x: 0.09, n: 10, s: 0.95, seed: 9.2 },
          { x: 0.15, n: 8, s: 0.82, seed: 10.3 },
          { x: 0.20, n: 5, s: 0.68, seed: 10.9 },
        ];
    const rightBeds = mode === 'always'
      ? [
          { x: 0.965, n: 6, s: 0.78, seed: 3.2 },
          { x: 0.905, n: 5, s: 0.7, seed: 4.1 },
        ]
      : [
          { x: 0.80, n: 6, s: 0.72, seed: 11.0 },
          { x: 0.86, n: 9, s: 0.9, seed: 11.4 },
          { x: 0.915, n: 11, s: 1.0, seed: 12.5 },
          { x: 0.97, n: 9, s: 0.95, seed: 13.6 },
        ];

    const drawBeds = (beds, side) => {
      beds.forEach((b, bi) => {
        const y = shoreY + (bi % 2) * 5 + (side === 'L' ? 0 : 2);
        drawReedClump(w * b.x, y, b.n, t, b.seed, b.s);
      });
    };

    // Far bank silhouette tips (very short, only at extreme edges near waterline)
    if (mode === 'reeds') {
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < 5; i++) {
        const lx = w * (0.02 + i * 0.028);
        const rx = w * (0.98 - i * 0.028);
        const y = h * 0.40 + (i % 2) * 3;
        drawReedBlade(lx, y, 10 + i * 2, Math.sin(t + i) * 2, 1.1, [28, 60, 36], 0.35, { reflect: false, head: false });
        drawReedBlade(rx, y, 10 + i * 2, Math.sin(t + i + 2) * 2, 1.1, [28, 60, 36], 0.35, { reflect: false, head: false });
      }
      ctx.restore();
    }

    drawBeds(leftBeds, 'L');
    drawBeds(rightBeds, 'R');
  }

  function drawSpotProps(t) {
    const id = state.spotId || 'pier';
    const wt = h * 0.42;
    if (id === 'reeds') {
      drawBankVegetation(t, 'reeds');
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
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const night = ctx.createLinearGradient(0, 0, 0, h);
      night.addColorStop(0, 'rgba(12, 20, 54, 0.92)');
      night.addColorStop(0.48, 'rgba(8, 22, 48, 0.86)');
      night.addColorStop(1, 'rgba(4, 14, 28, 0.78)');
      ctx.fillStyle = night;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // A clear night read at a glance: restrained stars and moon in the sky.
      ctx.save();
      ctx.fillStyle = 'rgba(235, 242, 255, 0.72)';
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 73) % 97) / 97 * w;
        const sy = (0.035 + (((i * 37) % 29) / 29) * 0.24) * h;
        const sr = i % 5 === 0 ? 1.2 : 0.7;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      const moonX = w * 0.78;
      const moonY = h * 0.12;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, w * 0.1);
      moonGlow.addColorStop(0, 'rgba(244, 246, 220, 0.82)');
      moonGlow.addColorStop(0.24, 'rgba(214, 226, 242, 0.3)');
      moonGlow.addColorStop(1, 'rgba(180, 210, 240, 0)');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - w * 0.11, moonY - w * 0.11, w * 0.22, w * 0.22);
      ctx.fillStyle = 'rgba(240, 242, 220, 0.88)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, Math.max(8, w * 0.025), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
    // Five cast points on the lake surface (below horizon, above pier boards)
    const jitter = () => (Math.random() - 0.5) * 0.03;
    state.hotspots = [
      { x: 0.26 + jitter(), y: 0.57 + jitter() * 0.5, r: 0.048 },
      { x: 0.40 + jitter(), y: 0.52 + jitter() * 0.5, r: 0.052 },
      { x: 0.54 + jitter(), y: 0.56 + jitter() * 0.5, r: 0.055 },
      { x: 0.66 + jitter(), y: 0.51 + jitter() * 0.5, r: 0.05 },
      { x: 0.76 + jitter(), y: 0.58 + jitter() * 0.4, r: 0.046 },
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
      drawBankVegetation(t, 'always');
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

    // Near-shore grass only (never a mid-lake fence)
    drawBankVegetation(t, 'always');
    drawSpotProps(t);

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

  function rodLookFor(id) {
    const looks = {
      reed: { a: '#a07848', b: '#d8bc8a', c: '#6a5030', w: 3.6, reel: '#5a5048', grip: '#3a2a1c', seg: [0.35, 0.65] },
      pine: { a: '#8a6238', b: '#c4a070', c: '#5a4028', w: 4.0, reel: '#4a5560', grip: '#2e2218', seg: [0.4] },
      cedar: { a: '#7a4a28', b: '#c09060', c: '#4a3018', w: 4.1, reel: '#3a4850', grip: '#241810' },
      match: { a: '#5a6a78', b: '#b0c0d0', c: '#3a4858', w: 3.5, reel: '#2a3848', grip: '#1a2030', rings: true },
      carbon: { a: '#2a3040', b: '#7a8aa0', c: '#1a2030', w: 3.3, reel: '#1a2838', grip: '#101820', rings: true },
      bamboo: { a: '#b09050', b: '#e0c888', c: '#7a6030', w: 3.5, reel: '#5a5048', grip: '#3a2a1c', seg: [0.22, 0.45, 0.68] },
      telescopic: { a: '#687888', b: '#b8c8d8', c: '#405060', w: 3.4, reel: '#2a3848', grip: '#1a2030', rings: true, seg: [0.2, 0.4, 0.6, 0.8] },
      spin_light: { a: '#3a6a88', b: '#8ec8e0', c: '#2a4860', w: 3.1, reel: '#c0d0d8', grip: '#203040', spin: true },
      spin_mid: { a: '#2a5880', b: '#70b0d0', c: '#1a3858', w: 3.5, reel: '#d0d8e0', grip: '#182838', spin: true },
      spin_heavy: { a: '#1a4060', b: '#5898b8', c: '#102838', w: 4.2, reel: '#e0e8f0', grip: '#101820', spin: true },
      spin_ultra: { a: '#4a7898', b: '#a0d0e8', c: '#2a5068', w: 2.9, reel: '#d0e0e8', grip: '#203040', spin: true },
      feeder_light: { a: '#6a5840', b: '#c0a888', c: '#403828', w: 4.6, reel: '#4a4038', grip: '#2a2018', thick: true, wrap: '#9a8060' },
      feeder_carp: { a: '#5a4830', b: '#b89870', c: '#302818', w: 5.1, reel: '#3a3430', grip: '#1e1810', thick: true, wrap: '#8a6840' },
      feeder_method: { a: '#504830', b: '#b09068', c: '#2c2818', w: 4.9, reel: '#3a3430', grip: '#1e1810', thick: true, wrap: '#a07848' },
      fly_light: { a: '#889868', b: '#d0e0a8', c: '#506038', w: 2.8, reel: '#c8d8b0', grip: '#303820', rings: true },
      boat_troll: { a: '#204860', b: '#68a0c0', c: '#102838', w: 4.4, reel: '#e8f0f8', grip: '#101820', spin: true },
    };
    if (state.rodSkin) {
      return { a: '#6a3a98', b: '#c89bff', c: '#4a2870', w: 3.8, reel: '#e0d0ff', grip: '#2a1840', rings: true };
    }
    return looks[id] || looks.reed;
  }

  function rodLook() {
    return rodLookFor(state.rodId || 'reed');
  }

  function drawOneRod(handX, handY, tipX, tipY, look, bend, opts = {}) {
    const soft = opts.soft || 1;
    const midX = handX + (tipX - handX) * 0.4 - bend * 50;
    const midY = handY + (tipY - handY) * 0.25 - 40 - bend * 70;
    ctx.globalAlpha = soft;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = (look.w || 4) + 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handX + 4, handY + 4);
    ctx.quadraticCurveTo(midX + 4, midY + 6, tipX + 2, tipY + 4);
    ctx.stroke();
    const rodGrad = ctx.createLinearGradient(handX, handY, tipX, tipY);
    rodGrad.addColorStop(0, look.a);
    rodGrad.addColorStop(0.55, look.b);
    rodGrad.addColorStop(1, look.c);
    ctx.strokeStyle = rodGrad;
    ctx.lineWidth = look.w || 4;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
    // Segment marks for telescopic / bamboo feel
    if (look.seg) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      for (const u of look.seg) {
        const x = handX + (tipX - handX) * u;
        const y = handY + (tipY - handY) * u - bend * 20 * (1 - u);
        ctx.beginPath();
        ctx.moveTo(x - 3, y);
        ctx.lineTo(x + 3, y);
        ctx.stroke();
      }
    }
    if (look.rings || look.spin) {
      ctx.strokeStyle = look.spin ? 'rgba(200,220,240,0.85)' : 'rgba(220,230,240,0.7)';
      ctx.lineWidth = look.spin ? 1.5 : 1.2;
      const rings = look.spin ? [0.2, 0.4, 0.6, 0.8] : [0.25, 0.5, 0.75];
      for (const u of rings) {
        const x = handX + (tipX - handX) * u;
        const y = handY + (tipY - handY) * u - bend * 20 * (1 - u);
        ctx.beginPath();
        ctx.arc(x, y, look.spin ? 3.6 : 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const rw = look.spin ? 13 : look.thick ? 12 : 10;
    ctx.fillStyle = look.reel || '#4a5560';
    ctx.beginPath();
    ctx.ellipse(handX - 8, handY - 10, rw, rw * 0.7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = look.spin ? '#f0f6ff' : '#d0d8e0';
    ctx.lineWidth = look.spin ? 2 : 1.5;
    ctx.stroke();
    if (look.spin) {
      // Bail / open-face cue
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(handX - 8, handY - 10, rw + 2, -0.8, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(handX - 8, handY - 20);
      ctx.lineTo(handX - 8, handY - 28);
      ctx.stroke();
    }
    if (look.thick) {
      // Feeder blank: thicker butt wrap
      ctx.fillStyle = look.wrap || '#8a7050';
      ctx.fillRect(handX - 4, handY - 8, 18, 14);
      ctx.strokeStyle = 'rgba(255,220,160,0.35)';
      ctx.strokeRect(handX - 4, handY - 8, 18, 14);
    }
    ctx.fillStyle = look.grip || '#3a2a1c';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(handX - 6, handY - 4, look.thick ? 34 : look.spin ? 26 : 28, look.thick ? 12 : 10, 4);
      ctx.fill();
    } else {
      ctx.fillRect(handX - 6, handY - 4, 28, 10);
    }
    ctx.globalAlpha = 1;
  }

  function drawAngler(t) {
    const bend = state.phase === 'power' ? state.power * 0.4 : state.castBend * 0.55;
    const fightLean = state.phase === 'fight' ? state.fishPullX * 18 : 0;
    const lines = state.rodLines || [];
    if (lines.length >= 1) {
      lines.slice(0, 3).forEach((rl, i) => {
        const handX = w * (0.72 + i * 0.1);
        const handY = h * (0.78 - i * 0.01);
        const look = rodLookFor(rl.rodId);
        let tipX = rl.x * w + (state.phase === 'fight' && i === lines.length - 1 ? fightLean : 0);
        let tipY = rl.y * h + Math.sin(state.bob + i) * 3 - (rl.biteDip || 0) * 14;
        if (rl.phase === 'power') {
          tipX = w * (0.38 + state.power * 0.42 - i * 0.06);
          tipY = h * (0.56 - state.power * 0.12);
        }
        drawOneRod(handX, handY, tipX, tipY, look, bend * (rl.phase === 'power' || rl.phase === 'fight' ? 1 : 0.25), { soft: 0.9 + i * 0.05 });
      });
      return;
    }
    const handX = w * 0.88;
    const handY = h * 0.76;
    const look = rodLook();
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
    drawOneRod(handX, handY, tipX, tipY, look, bend);
  }

  function drawHotspots(t) {
    // Visible while idle/power/wait so a second rod can pick a free spot
    if (state.phase !== 'idle' && state.phase !== 'power' && state.phase !== 'wait') return;
    const occupied = new Set(state.occupiedHotspots || []);
    state.hotspots.forEach((hs, i) => {
      const x = hs.x * w;
      const y = hs.y * h;
      const pulse = 1 + Math.sin(t * 2.2 + i) * 0.08;
      const selected = i === state.selectedHotspot;
      const busy = occupied.has(i);
      const rx = hs.r * w * pulse;
      const ry = rx * 0.32; // flat on water plane
      for (let ring = 0; ring < 3; ring++) {
        const s = 0.65 + ring * 0.28;
        ctx.beginPath();
        ctx.ellipse(x, y, rx * s, ry * s, 0, 0, Math.PI * 2);
        ctx.strokeStyle = busy
          ? `rgba(120, 140, 160, ${0.25 - ring * 0.06})`
          : selected
            ? `rgba(255, 200, 90, ${0.7 - ring * 0.18})`
            : `rgba(230, 245, 255, ${0.4 - ring * 0.1})`;
        ctx.lineWidth = selected && !busy ? 2.4 : 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = busy
        ? 'rgba(80, 100, 120, 0.18)'
        : selected ? 'rgba(255, 180, 70, 0.22)' : 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawTerminal(x, y, kind, color) {
    if (kind === 'bottom') {
      // Feeder cage / method sinker
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6a5a48';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - 7, y - 4, 14, 10, 2);
      else ctx.fillRect(x - 7, y - 4, 14, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220, 200, 160, 0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 7, y - 4, 14, 10);
      ctx.fillStyle = '#c8b090';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(x - 5 + i * 4, y - 2, 2, 6);
      }
      ctx.strokeStyle = 'rgba(180,180,190,0.5)';
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x, y - 14);
      ctx.stroke();
      return;
    }
    if (kind === 'spin') {
      // Spoon / spinner lure
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath();
      ctx.ellipse(x, y + 8, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createLinearGradient(x - 8, y - 4, x + 8, y + 4);
      g.addColorStop(0, '#e8f0f8');
      g.addColorStop(0.5, color || '#d0a040');
      g.addColorStop(1, '#6080a0');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 3.5, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x - 1, y - 1, 4, 1.5, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#c0c8d0';
      ctx.beginPath();
      ctx.arc(x + 7, y + 2, 2.2, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    // Classic float bobber
    const col = color || state.bobberColor || '#e85d4c';
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
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
  }

  function drawOneFloat(fx, fy, biteDip, color, withLine, kind = 'float') {
    const x = fx * w;
    const y = fy * h + Math.sin(state.bob) * 3.5 - (biteDip || 0) * 16;
    if (withLine && state.phase !== 'castfly') {
      ctx.strokeStyle = kind === 'bottom' ? 'rgba(200,190,160,0.4)' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = kind === 'bottom' ? 1.4 : 1;
      ctx.beginPath();
      const ax = w * 0.88;
      const ay = h * 0.76;
      ctx.moveTo(ax - 10, ay - 16);
      ctx.quadraticCurveTo((ax + x) / 2, Math.min(ay, y) - 30, x, y - 10);
      ctx.stroke();
    }
    drawTerminal(x, y, kind, color);
  }

  function drawFloat() {
    const extras = state.extraFloats || [];
    for (const f of extras) {
      drawOneFloat(f.x, f.y, f.biteDip, f.color, true, f.rodKind || 'float');
    }
    if (state.phase === 'idle' || state.phase === 'power') return;
    const x = state.floatX * w;
    const y = state.floatY * h + Math.sin(state.bob) * 3.5 - state.biteDip * 16;
    const kind = state.rodKind || 'float';

    if (state.phase !== 'castfly') {
      ctx.strokeStyle = kind === 'bottom' ? 'rgba(200,190,160,0.45)' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = kind === 'bottom' ? 1.5 : 1.1;
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

    drawTerminal(x, y, kind, state.bobberColor);

    if ((state.phase === 'bite' || state.biteDip > 0.3) && kind === 'float') {
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
    // Mystery silhouette only — no species spoiler during fight (RF4-style)
    const sizeMul = state.fightMystery?.sizeMul || 1;

    ctx.fillStyle = 'rgba(200,230,240,0.28)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x - i * 11, y + 6 + Math.sin(state.time * 10 + i) * 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.25 + state.fishPullX * 0.4 + thrash);
    const bw = 26 * sizeMul;
    const bh = 11 * sizeMul;
    const body = ctx.createLinearGradient(-bw, -bh, bw, bh);
    body.addColorStop(0, 'rgba(18, 36, 44, 0.92)');
    body.addColorStop(0.5, 'rgba(28, 52, 62, 0.88)');
    body.addColorStop(1, 'rgba(12, 28, 36, 0.95)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bw * 0.75, 0);
    ctx.lineTo(bw * 1.45, -bh * 0.9 + thrash * 8);
    ctx.lineTo(bw * 1.35, bh * 0.9 - thrash * 8);
    ctx.closePath();
    ctx.fill();
    // Soft highlight — still anonymous
    ctx.strokeStyle = 'rgba(180, 210, 220, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(-bw * 0.1, -bh * 0.15, bw * 0.55, bh * 0.35, -0.2, 0, Math.PI * 2);
    ctx.stroke();
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

  function drawRodStatusTags() {
    const lines = state.rodLines || [];
    const en = (document.documentElement.lang || 'ru').startsWith('en');
    lines.forEach((line, index) => {
      if (line.phase !== 'wait' && line.phase !== 'bite') return;
      const n = (line.loadoutIndex ?? index) + 1;
      const status = line.phase === 'bite'
        ? (en ? 'BITE!' : 'КЛЁВ!')
        : `${Math.floor(line.waitTimer || 0)}s`;
      const text = `№${n} · ${status}`;
      ctx.save();
      ctx.font = '800 10px system-ui, sans-serif';
      const tw = Math.ceil(ctx.measureText(text).width);
      const bw = tw + 16;
      const bh = 22;
      const x = Math.max(6, Math.min(w - bw - 6, line.x * w - bw / 2));
      const y = Math.max(70, line.y * h - 42 - index * 3);
      ctx.fillStyle = line.phase === 'bite'
        ? 'rgba(86, 44, 112, 0.92)'
        : index % 2 === 0 ? 'rgba(37, 112, 92, 0.9)' : 'rgba(63, 71, 120, 0.9)';
      ctx.strokeStyle = line.phase === 'bite'
        ? 'rgba(225, 170, 255, 0.8)'
        : 'rgba(210, 242, 232, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, 6);
      else ctx.rect(x, y, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f6fbff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + bw / 2, y + bh / 2 + 0.5);
      ctx.restore();
    });
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
    drawRodStatusTags();
  }

  function pickHotspot(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const occupied = new Set(state.occupiedHotspots || []);
    let best = -1;
    let bestD = 999;
    state.hotspots.forEach((hs, i) => {
      if (occupied.has(i)) return;
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
    setRodId(id) { state.rodId = id || 'reed'; },
    setWeather(id) { state.weatherId = id || 'cloudy'; },
    setFightColor(c) { state.fightColor = c || '#3d6b7a'; },
    setFightFish(f) { state.fightFish = f || null; },
    setFightMystery(m) { state.fightMystery = m || null; },
    shake(amount = 1) { state.cameraShake = Math.max(state.cameraShake, amount); },
  };
}

/** Mini vignette for spot list cards — distinctive per location */
export function drawSpotThumb(canvas, spotId, t = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const palettes = {
    pier: ['#f0c090', '#6aa8bc', '#6d4a30'],
    reeds: ['#c8d890', '#4a8a70', '#2a4830'],
    willow: ['#d8e0b0', '#6a9888', '#4a6038'],
    lilies: ['#d8e8f0', '#5a9aaa', '#3a7050'],
    bridge: ['#c0c8d0', '#5a7a90', '#4a4038'],
    mill: ['#d0c8b0', '#6a8890', '#5a4838'],
    snags: ['#b0a890', '#3a6a70', '#3a2a18'],
    pond: ['#d0e0c8', '#4a9088', '#2a5840'],
    spit: ['#e8d8b0', '#6aa8b8', '#c0a878'],
    channel: ['#b8d0e0', '#3a7a98', '#2a5060'],
    deep: ['#8aa0b8', '#2a5070', '#101828'],
    dam: ['#a8b8c8', '#3a6080', '#3a4048'],
    open: ['#c8e0f0', '#4a90a8', '#3a7088'],
    nightjetty: ['#405868', '#1a3048', '#101820'],
    hotcove: ['#f0c878', '#3a8898', '#2a5060'],
  };
  const p = palettes[spotId] || palettes.pier;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, p[0]);
  g.addColorStop(0.42, p[1]);
  g.addColorStop(1, p[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(12, 28, 28, 0.32)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.38);
  ctx.quadraticCurveTo(w * 0.35, h * 0.28, w * 0.55, h * 0.36);
  ctx.quadraticCurveTo(w * 0.78, h * 0.42, w, h * 0.34);
  ctx.lineTo(w, h * 0.52);
  ctx.lineTo(0, h * 0.52);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = h * (0.52 + i * 0.07);
    ctx.beginPath();
    for (let x = 0; x < w; x += 4) ctx.lineTo(x, y + Math.sin(t + x * 0.09 + i) * 1.2);
    ctx.stroke();
  }

  const bank = (side, dense = 4) => {
    ctx.strokeStyle = 'rgba(28, 70, 40, 0.55)';
    ctx.lineCap = 'round';
    for (let i = 0; i < dense; i++) {
      const x = side === 'L' ? 3 + i * 4.2 : w - 4 - i * 4.2;
      const sway = Math.sin(t * 1.2 + i + (side === 'L' ? 0 : 2)) * 1.6;
      ctx.lineWidth = 1 + (i % 2) * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.92);
      ctx.quadraticCurveTo(x + sway, h * 0.72, x + sway * 1.2, h * 0.52);
      ctx.stroke();
    }
  };

  if (spotId === 'reeds') { bank('L', 6); bank('R', 6); }
  if (spotId === 'willow') {
    ctx.strokeStyle = 'rgba(40, 70, 40, 0.5)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const x = w * 0.15 + i * 4;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.2);
      ctx.quadraticCurveTo(x + 6, h * 0.4, x - 2, h * 0.55);
      ctx.stroke();
    }
    bank('R', 3);
  }
  if (spotId === 'lilies') {
    ctx.fillStyle = 'rgba(40,110,60,0.5)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(14 + i * 14, h * 0.62 + (i % 2) * 4, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(240,200,90,0.55)';
    ctx.beginPath();
    ctx.arc(w * 0.45, h * 0.6, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (spotId === 'pier' || spotId === 'nightjetty' || spotId === 'hotcove') {
    ctx.fillStyle = spotId === 'nightjetty' ? '#2a3038' : p[2];
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (w / 4), h * 0.72);
      ctx.lineTo(i * (w / 4) * 0.9, h);
      ctx.stroke();
    }
  }
  if (spotId === 'bridge' || spotId === 'dam') {
    ctx.fillStyle = '#4a4a48';
    ctx.fillRect(w * 0.28, h * 0.32, 5, h * 0.45);
    ctx.fillRect(w * 0.62, h * 0.32, 5, h * 0.45);
    ctx.fillRect(w * 0.22, h * 0.32, w * 0.56, 5);
  }
  if (spotId === 'mill') {
    ctx.fillStyle = '#5a4838';
    ctx.fillRect(w * 0.55, h * 0.28, 10, h * 0.4);
    ctx.strokeStyle = 'rgba(80,60,40,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.6, h * 0.42, 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (spotId === 'snags') {
    ctx.strokeStyle = 'rgba(60,40,20,0.7)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.85);
    ctx.quadraticCurveTo(w * 0.35, h * 0.5, w * 0.55, h * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.9);
    ctx.quadraticCurveTo(w * 0.6, h * 0.45, w * 0.75, h * 0.65);
    ctx.stroke();
  }
  if (spotId === 'pond') {
    bank('L', 3); bank('R', 3);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.58, w * 0.28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (spotId === 'spit') {
    ctx.fillStyle = 'rgba(200,170,110,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.78);
    ctx.quadraticCurveTo(w * 0.45, h * 0.55, w, h * 0.7);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  }
  if (spotId === 'channel' || spotId === 'open') {
    ctx.strokeStyle = 'rgba(220,240,255,0.4)';
    for (let i = 0; i < 3; i++) {
      const y = h * (0.55 + i * 0.08);
      ctx.beginPath();
      for (let x = 0; x < w; x += 3) ctx.lineTo(x, y + Math.sin(t * 2 + x * 0.12 + i) * 2);
      ctx.stroke();
    }
  }
  if (spotId === 'deep') {
    const v = ctx.createRadialGradient(w * 0.5, h * 0.62, 3, w * 0.5, h * 0.62, w * 0.5);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,8,24,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
  if (spotId === 'nightjetty') {
    ctx.fillStyle = 'rgba(8, 14, 28, 0.35)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(240, 220, 120, 0.45)';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.18, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (spotId === 'hotcove') {
    ctx.strokeStyle = 'rgba(255, 200, 80, 0.45)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.58, 8 + i * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawMenuBackdrop(canvas) {
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const bw = Math.floor(w * dpr);
  const bh = Math.floor(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const portrait = h > w * 1.12;
  const cacheKey = portrait ? '_imgMobile' : '_imgDesktop';
  const imageSrc = portrait
    ? 'assets/menu-dawn-mobile.png?v=0.5.19.2'
    : 'assets/menu-dawn-desktop.png?v=0.5.19.2';
  const img = drawMenuBackdrop[cacheKey]
    || (drawMenuBackdrop[cacheKey] = Object.assign(new Image(), { src: imageSrc }));
  if (!img._menuBound) {
    img._menuBound = true;
    img.addEventListener('load', () => drawMenuBackdrop(canvas));
  }

  if (img.complete && img.naturalWidth) {
    // Fill the frame without cropping away the authored rod and tackle props.
    ctx.drawImage(img, 0, 0, w, h);
    ctx.fillStyle = 'rgba(6, 20, 32, 0.1)';
    ctx.fillRect(0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f7d4a4');
    g.addColorStop(0.45, '#3a8498');
    g.addColorStop(1, '#204e5e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

}
