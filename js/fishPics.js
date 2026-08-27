/** Photoreal fish thumbnails — every species maps to a real photo (+ tint) */

const ASSETS = {
  bleak: 'assets/fish/bleak.jpg',
  rudd: 'assets/fish/rudd.jpg',
  perch: 'assets/fish/perch.jpg',
  crucian: 'assets/fish/crucian.jpg',
  bream: 'assets/fish/bream.jpg',
  tench: 'assets/fish/tench.jpg',
  pike: 'assets/fish/pike.jpg',
  carp: 'assets/fish/carp.jpg',
  koi: 'assets/fish/koi.jpg',
  catfish: 'assets/fish/catfish.jpg',
};

/** Exact / close species → asset key */
const BY_ID = {
  // Exact photo matches
  bleak: 'bleak',
  rudd: 'rudd',
  perch: 'perch',
  crucian: 'crucian',
  bream: 'bream',
  tench: 'tench',
  mirror: 'carp',
  carp_common: 'carp',
  dawn_koi: 'koi',
  catfish: 'catfish',

  // Spread cousins across different base photos (avoid twin thumbs)
  bleak_silver: 'bleak',
  smelt: 'bleak',
  minnow_fish: 'rudd',
  sunbleak_gold: 'koi',
  dace: 'rudd',
  gudgeon: 'crucian',
  gudgeon_sand: 'crucian',
  sabre: 'bleak',
  whitefish: 'bleak',
  asp: 'bleak',
  aurora_asp: 'koi',
  asp_flash: 'bleak',
  asp_rain: 'bleak',
  asp_comet: 'koi',
  grayling: 'pike',
  salmon_smolt: 'pike',
  gold_orfe: 'koi',

  rudd_shy: 'rudd',
  rudd_gold: 'koi',
  rudd_dusk: 'rudd',
  roach: 'rudd',
  roach_silver: 'bleak',
  star_roach: 'koi',
  nase: 'crucian',
  bitterling: 'rudd',

  perch_stripe: 'perch',
  perch_dawn: 'perch',
  perch_ice: 'perch',
  ruffe: 'crucian',
  glass: 'bleak',
  ember_perch: 'koi',
  trout: 'pike',
  trout_brook: 'pike',
  stickleback: 'tench',

  pearl_crucian: 'crucian',
  carp_kid: 'carp',

  moon_bream: 'bream',
  bream_bronze: 'bream',
  bream_night: 'bream',
  bream_opal: 'bream',
  vimba: 'bream',
  spirit_bream: 'koi',

  silk_tench: 'tench',
  tench_mud: 'tench',
  ide: 'tench',
  ide_spring: 'tench',
  chub: 'carp',
  chub_dusk: 'carp',
  chub_river: 'carp',
  barb: 'tench',
  barb_stone: 'tench',
  sturgeon_y: 'catfish',
  sterlet_gold: 'catfish',

  pikelet: 'pike',
  night_pike: 'pike',
  pike_queen: 'pike',
  pike_weed: 'pike',
  pike_clear: 'pike',
  pike_mist: 'pike',
  zander: 'pike',
  zander_fog: 'pike',
  zander_gold: 'koi',
  pike_perch: 'pike',

  crown_carp: 'carp',
  carp_mirror_y: 'carp',
  carp_kinglet: 'carp',
  carp_moon: 'carp',
  carp_ghost: 'koi',
  koi_midnight: 'koi',
  koi_ember: 'koi',

  sheat: 'catfish',
  mist_cat: 'catfish',
  cat_rain: 'catfish',
  storm_eel: 'catfish',
  eel_storm: 'catfish',
  eel_night: 'catfish',
  burbot: 'catfish',
  loach: 'tench',

  cove_gold: 'koi',
  cove_spirit: 'bleak',
  cove_pearl: 'koi',
};

const BY_SHAPE = {
  slim: 'bleak',
  round: 'rudd',
  spiny: 'perch',
  flat: 'bream',
  thick: 'tench',
  pike: 'pike',
  carp: 'carp',
  cat: 'catfish',
  eel: 'catfish',
  spirit: 'koi',
};

const cache = new Map();

function assetKey(fish) {
  if (!fish) return 'bleak';
  return BY_ID[fish.id] || BY_SHAPE[fish.shape] || 'bleak';
}

export function hasUniqueFishPhoto(fish) {
  return !!fishImageSrc(fish);
}

export function fishImageSrc(fish) {
  if (!fish) return null;
  return ASSETS[assetKey(fish)] || ASSETS.bleak;
}

export function getFishImage(fish) {
  const src = fishImageSrc(fish);
  if (!src) return null;
  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    cache.set(src, img);
  }
  return img;
}

function plate(ctx, w, h, fish) {
  const c0 = fish?.color || '#7eafc2';
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(232, 246, 252, 0.95)');
  g.addColorStop(0.45, `${c0}66`);
  g.addColorStop(1, 'rgba(40, 80, 100, 0.4)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Per-species look so shared photos still feel distinct */
function speciesFingerprint(fish) {
  const id = fish?.id || 'x';
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cousin = BY_ID[id] !== id;
  return {
    flip: (h & 1) === 0,
    zoom: cousin ? (0.78 + ((h >>> 3) % 35) / 100) : (0.9 + ((h >>> 3) % 18) / 100),
    offX: (((h >>> 8) % 25) - 12) / 100,
    offY: (((h >>> 13) % 21) - 10) / 100,
    hue: cousin ? (((h >>> 17) % 100) - 50) : (((h >>> 17) % 24) - 12),
    sat: cousin ? (0.55 + ((h >>> 23) % 55) / 100) : (0.85 + ((h >>> 23) % 25) / 100),
    bright: cousin ? (0.82 + ((h >>> 27) % 28) / 100) : (0.94 + ((h >>> 27) % 14) / 100),
    contrast: cousin ? 1.08 + ((h >>> 5) % 20) / 100 : 1,
    mark: (fish?.nameRu || fish?.nameEn || id).slice(0, 1).toUpperCase(),
    cousin,
  };
}

export function drawFishPhoto(canvas, fish, opts = {}) {
  const ctx = canvas.getContext('2d');
  const transform = ctx.getTransform?.();
  const cssMode = transform && transform.a !== 1 && transform.a !== 0;
  const w = cssMode ? canvas.width / transform.a : canvas.width;
  const h = cssMode ? canvas.height / transform.d : canvas.height;
  ctx.clearRect(0, 0, w, h);
  plate(ctx, w, h, fish);

  const src = fishImageSrc(fish);
  if (!src) return false;

  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    cache.set(src, img);
  }

  if (img.complete && img.naturalWidth > 0) {
    const fp = speciesFingerprint(fish);
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let dw;
    let dh;
    if (ir > cr) {
      dh = h * 0.9 * fp.zoom;
      dw = dh * ir;
    } else {
      dw = w * 0.92 * fp.zoom;
      dh = dw / ir;
    }
    let dx = (w - dw) / 2 + w * fp.offX;
    let dy = (h - dh) / 2 - h * 0.02 + h * fp.offY;

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(w * 0.04, h * 0.06, w * 0.92, h * 0.88, 10);
    else ctx.rect(w * 0.04, h * 0.06, w * 0.92, h * 0.88);
    ctx.clip();

    // Unique crop/flip/color grade per species (cousins share photo but look different)
    const filterBits = [
      `hue-rotate(${fp.hue}deg)`,
      `saturate(${fp.sat})`,
      `brightness(${fp.bright})`,
      fp.contrast && fp.contrast !== 1 ? `contrast(${fp.contrast})` : '',
    ].filter(Boolean);
    ctx.filter = filterBits.join(' ');
    if (fp.flip) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      dx = w - dx - dw;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
    ctx.restore();

    if (opts.tint !== false && fish?.color) {
      const a = fp.cousin ? 0.38 : 0.14;
      const n = fish.color.replace('#', '');
      if (n.length >= 6) {
        const r = parseInt(n.slice(0, 2), 16);
        const g = parseInt(n.slice(2, 4), 16);
        const b = parseInt(n.slice(4, 6), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(0, 0, w, h);
      }
    }
    // Accent rim for identity
    if (fish?.accent) {
      ctx.strokeStyle = `${fish.accent}88`;
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }
    // Tiny species mark so cousins never look identical
    if (fp.cousin || opts.mark !== false) {
      const m = fp.mark || '?';
      ctx.fillStyle = 'rgba(8, 24, 36, 0.55)';
      ctx.beginPath();
      ctx.arc(w - 12, h - 12, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2f6f8';
      ctx.font = `bold ${Math.max(9, Math.round(h * 0.22))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m, w - 12, h - 11);
    }
    return true;
  }

  if (!img._qcHooked) {
    img._qcHooked = true;
    img.addEventListener('load', () => {
      document.dispatchEvent(new CustomEvent('quietcove:fishpic', { detail: { src } }));
    }, { once: true });
  }
  return false;
}

export function preloadFishPhotos() {
  Object.values(ASSETS).forEach((src) => {
    if (cache.has(src)) return;
    const img = new Image();
    img.src = src;
    cache.set(src, img);
  });
}
