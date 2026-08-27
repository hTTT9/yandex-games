let muted = false;
let ctx = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function setMuted(v) {
  muted = v;
  if (muted && ctx?.state === 'running') ctx.suspend?.();
  if (muted) stopAmbience();
}

export function isMuted() {
  return muted;
}

export async function resumeAudio() {
  if (muted) return;
  const c = ac();
  if (c?.state === 'suspended') await c.resume();
}

function envGain(g, t0, attack, peak, dur, end = 0.0001) {
  g.gain.cancelScheduledValues(t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
  g.gain.exponentialRampToValueAtTime(end, t0 + dur);
}

function noiseBuffer(c, seconds, color = 'white') {
  const n = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    if (color === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else if (color === 'pink') {
      last = 0.98 * last + 0.02 * white;
      data[i] = white * 0.35 + last;
    } else {
      data[i] = white;
    }
  }
  return buf;
}

function playNoise(c, {
  seconds = 0.2,
  color = 'white',
  filterType = 'bandpass',
  freq = 800,
  Q = 1,
  gain = 0.04,
  attack = 0.01,
  slideFreq = null,
} = {}) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, seconds, color);
  const f = c.createBiquadFilter();
  f.type = filterType;
  f.frequency.setValueAtTime(freq, c.currentTime);
  if (slideFreq != null) {
    f.frequency.exponentialRampToValueAtTime(Math.max(40, slideFreq), c.currentTime + seconds);
  }
  f.Q.value = Q;
  const g = c.createGain();
  envGain(g, c.currentTime, attack, gain, seconds * 0.92);
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start();
  src.stop(c.currentTime + seconds + 0.02);
}

function playTone(c, {
  freq = 440,
  dur = 0.2,
  type = 'sine',
  gain = 0.03,
  attack = 0.01,
  slideTo = null,
  filterFreq = 4200,
  delay = 0,
} = {}) {
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = filterFreq;
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo != null) {
    o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
  }
  envGain(g, t0, attack, gain, dur);
  o.connect(f);
  f.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

/** Soft UI tap */
export function sfxClick() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  playTone(c, { freq: 740, dur: 0.04, type: 'sine', gain: 0.014, attack: 0.004, filterFreq: 2600 });
}

/**
 * Cast: air whoosh (noise sweep) + low rod thump — not a chirpy beep.
 */
export function sfxCast() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  // Whoosh through air
  playNoise(c, {
    seconds: 0.28,
    color: 'pink',
    filterType: 'bandpass',
    freq: 1400,
    slideFreq: 320,
    Q: 0.55,
    gain: 0.055,
    attack: 0.008,
  });
  // Soft body / blank thump
  playTone(c, {
    freq: 95,
    dur: 0.18,
    type: 'sine',
    gain: 0.04,
    attack: 0.006,
    slideTo: 55,
    filterFreq: 380,
  });
  playTone(c, {
    freq: 180,
    dur: 0.1,
    type: 'triangle',
    gain: 0.012,
    attack: 0.01,
    delay: 0.04,
    filterFreq: 700,
  });
}

/**
 * Bobber hit: soft «бульк» — quick pitch drop + tiny bubble noise.
 */
export function sfxSplash() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;

  // Main plop (бульк)
  playTone(c, {
    freq: 240,
    dur: 0.22,
    type: 'sine',
    gain: 0.055,
    attack: 0.004,
    slideTo: 70,
    filterFreq: 900,
  });
  // Secondary hollow bubble
  playTone(c, {
    freq: 160,
    dur: 0.28,
    type: 'sine',
    gain: 0.028,
    attack: 0.01,
    slideTo: 48,
    filterFreq: 500,
    delay: 0.03,
  });
  // Water droplet noise
  playNoise(c, {
    seconds: 0.16,
    color: 'white',
    filterType: 'bandpass',
    freq: 1100,
    slideFreq: 420,
    Q: 1.1,
    gain: 0.038,
    attack: 0.005,
  });
  // Tiny delayed drip
  playTone(c, {
    freq: 420,
    dur: 0.08,
    type: 'sine',
    gain: 0.012,
    attack: 0.003,
    slideTo: 180,
    filterFreq: 1600,
    delay: 0.11,
  });

  // Very soft surface ring
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(520, t0 + 0.02);
  o.frequency.exponentialRampToValueAtTime(180, t0 + 0.2);
  envGain(g, t0 + 0.02, 0.008, 0.01, 0.2);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0 + 0.02);
  o.stop(t0 + 0.25);
}

/**
 * Bite bell: real-ish fishing bell — bright strike + long metallic decay.
 */
export function sfxBite() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;

  const strike = (freq, gain, delay, dur, detune = 0) => {
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = 'sine';
    o.frequency.value = freq;
    o.detune.value = detune;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(5200, t0 + delay);
    f.frequency.exponentialRampToValueAtTime(1800, t0 + delay + dur);
    g.gain.setValueAtTime(0.0001, t0 + delay);
    g.gain.exponentialRampToValueAtTime(gain, t0 + delay + 0.008);
    // Fast strike then long ring
    g.gain.exponentialRampToValueAtTime(gain * 0.45, t0 + delay + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
    o.connect(f);
    f.connect(g);
    g.connect(c.destination);
    o.start(t0 + delay);
    o.stop(t0 + delay + dur + 0.02);
  };

  // Fundamental ~G5 fishing bell + inharmonic partials
  strike(784, 0.034, 0, 0.85);
  strike(1176, 0.018, 0.008, 0.7, 6);
  strike(1568, 0.01, 0.014, 0.55, -4);
  strike(2093, 0.006, 0.02, 0.4);

  // Soft wooden/metal body thump under the ring
  playTone(c, {
    freq: 210,
    dur: 0.12,
    type: 'triangle',
    gain: 0.016,
    attack: 0.004,
    slideTo: 120,
    filterFreq: 600,
  });

  // Tiny noise transient = clapper hit
  playNoise(c, {
    seconds: 0.045,
    color: 'white',
    filterType: 'highpass',
    freq: 1800,
    Q: 0.7,
    gain: 0.022,
    attack: 0.001,
  });
}

export function sfxCatch() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  playTone(c, { freq: 523, dur: 0.11, type: 'sine', gain: 0.028, attack: 0.01 });
  playTone(c, { freq: 659, dur: 0.13, type: 'sine', gain: 0.024, attack: 0.01, delay: 0.07 });
  playTone(c, { freq: 784, dur: 0.16, type: 'sine', gain: 0.02, attack: 0.01, delay: 0.14 });
}

export function sfxFail() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  playTone(c, {
    freq: 220,
    dur: 0.22,
    type: 'triangle',
    gain: 0.022,
    attack: 0.01,
    slideTo: 110,
    filterFreq: 900,
  });
}

let ambienceNodes = null;

export function startAmbience() {
  if (muted) return;
  const c = ac();
  if (!c || ambienceNodes) return;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer(c, 2, 'brown');
  noise.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 320;
  const g = c.createGain();
  g.gain.value = 0.01;
  noise.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  noise.start();
  ambienceNodes = { noise, g };
}

export function stopAmbience() {
  if (!ambienceNodes) return;
  try { ambienceNodes.noise.stop(); } catch { /* */ }
  try { ambienceNodes.noise.disconnect(); } catch { /* */ }
  ambienceNodes = null;
}
