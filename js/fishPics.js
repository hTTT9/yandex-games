/** Photoreal fish thumbnails mapped by fish id / shape fallback */

const BY_ID = {
  bleak: 'assets/fish/bleak.jpg',
  rudd: 'assets/fish/rudd.jpg',
  perch: 'assets/fish/perch.jpg',
  ruffe: 'assets/fish/perch.jpg',
  crucian: 'assets/fish/crucian.jpg',
  pearl_crucian: 'assets/fish/crucian.jpg',
  bream: 'assets/fish/bream.jpg',
  vimba: 'assets/fish/bream.jpg',
  tench: 'assets/fish/tench.jpg',
  pikelet: 'assets/fish/pike.jpg',
  night_pike: 'assets/fish/pike.jpg',
  mirror: 'assets/fish/carp.jpg',
  dawn_koi: 'assets/fish/koi.jpg',
  catfish: 'assets/fish/catfish.jpg',
  storm_eel: 'assets/fish/catfish.jpg',
  // close cousins
  roach: 'assets/fish/rudd.jpg',
  gudgeon: 'assets/fish/bleak.jpg',
  dace: 'assets/fish/bleak.jpg',
  ide: 'assets/fish/rudd.jpg',
  chub: 'assets/fish/rudd.jpg',
  asp: 'assets/fish/bleak.jpg',
  zander: 'assets/fish/pike.jpg',
  barb: 'assets/fish/carp.jpg',
  glass: 'assets/fish/perch.jpg',
  gold_orfe: 'assets/fish/koi.jpg',
  cove_spirit: 'assets/fish/bleak.jpg',
};

const BY_SHAPE = {
  slim: 'assets/fish/bleak.jpg',
  round: 'assets/fish/crucian.jpg',
  spiny: 'assets/fish/perch.jpg',
  pike: 'assets/fish/pike.jpg',
  carp: 'assets/fish/carp.jpg',
  flat: 'assets/fish/bream.jpg',
  thick: 'assets/fish/tench.jpg',
  eel: 'assets/fish/catfish.jpg',
  cat: 'assets/fish/catfish.jpg',
  spirit: 'assets/fish/koi.jpg',
};

const cache = new Map();

export function fishImageSrc(fish) {
  if (!fish) return null;
  return BY_ID[fish.id] || BY_SHAPE[fish.shape] || null;
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
  return img.complete && img.naturalWidth ? img : img;
}

export function drawFishPhoto(canvas, fish) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const plate = ctx.createLinearGradient(0, 0, 0, h);
  plate.addColorStop(0, '#d8eef6');
  plate.addColorStop(1, '#7eafc2');
  ctx.fillStyle = plate;
  ctx.fillRect(0, 0, w, h);

  const src = fishImageSrc(fish);
  if (!src) return false;

  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    cache.set(src, img);
  }

  if (img.complete && img.naturalWidth > 0) {
    const scale = Math.min((w * 0.92) / img.naturalWidth, (h * 0.88) / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
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

/** Preload common fish photos */
export function preloadFishPhotos() {
  Object.values(BY_ID).forEach((src) => {
    if (cache.has(src)) return;
    const img = new Image();
    img.src = src;
    cache.set(src, img);
  });
}
