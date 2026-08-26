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

function tone(freq, dur, type = 'sine', gain = 0.03, slideTo = null) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 4200;
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo != null) {
    o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), c.currentTime + dur);
  }
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(f);
  f.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

/** Soft fishing-bell bite — short, gentle, not spammy */
export function sfxBite() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const now = c.currentTime;
  const makeBell = (freq, delay, gain) => {
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = 'sine';
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.value = 2800;
    g.gain.setValueAtTime(0.0001, now + delay);
    g.gain.exponentialRampToValueAtTime(gain, now + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.55);
    o.connect(f);
    f.connect(g);
    g.connect(c.destination);
    o.start(now + delay);
    o.stop(now + delay + 0.6);
  };
  // fundamental + soft partials (small bell)
  makeBell(880, 0, 0.028);
  makeBell(1320, 0.01, 0.012);
  makeBell(1760, 0.02, 0.006);
}

export function sfxCast() {
  tone(160, 0.16, 'triangle', 0.028, 90);
  setTimeout(() => tone(120, 0.1, 'sine', 0.012), 50);
}

export function sfxSplash() {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const bufferSize = Math.floor(c.sampleRate * 0.22);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * env * env * 0.55;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 900;
  f.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = 0.045;
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start();
}

export function sfxCatch() {
  tone(523, 0.12, 'sine', 0.03);
  setTimeout(() => tone(659, 0.14, 'sine', 0.026), 70);
  setTimeout(() => tone(784, 0.16, 'sine', 0.022), 140);
}

export function sfxFail() {
  tone(220, 0.18, 'triangle', 0.02, 140);
}

export function sfxClick() {
  tone(620, 0.035, 'sine', 0.016);
}

let ambienceNodes = null;

export function startAmbience() {
  if (muted) return;
  const c = ac();
  if (!c || ambienceNodes) return;
  const bufferSize = 2 * c.sampleRate;
  const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 380;
  const g = c.createGain();
  g.gain.value = 0.012;
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
