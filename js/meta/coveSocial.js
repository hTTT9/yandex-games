/** Cove social board — preset phrases only (6+: no free-text UGC chat). */

export const COVE_PHRASES_RU = [
  'Клёв на пирсе сегодня ровный.',
  'Кто-нибудь пробовал чесночную прикормку?',
  'На кувшинках тихо, но крупно.',
  'Леска 0.22 держит лучше на омуте.',
  'Вечерний клёв уже начинается.',
  'Удачный час — не зевайте!',
  'Донка на коряжнике — осторожнее с зацепом.',
  'Поймал краснопёрку на червя — красота.',
];

export const COVE_PHRASES_EN = [
  'Bite is steady at the pier today.',
  'Anyone tried garlic chum?',
  'Quiet at the lilies, but bigger fish.',
  '0.22 line holds better in the deep hole.',
  'Evening bite is starting.',
  'Lucky hour — don’t miss it!',
  'Feeder at the snags — watch the snags.',
  'Caught a rudd on worm — beauty.',
];

export const COVE_EMOTES = [
  { id: 'wave', ru: '👋 Привет', en: '👋 Hi' },
  { id: 'bite', ru: '🎣 Клёв!', en: '🎣 Bite!' },
  { id: 'trophy', ru: '🏆 Трофей', en: '🏆 Trophy' },
  { id: 'calm', ru: '🌊 Тишина', en: '🌊 Calm' },
  { id: 'storm', ru: '🌧️ Дождик', en: '🌧️ Rain' },
  { id: 'luck', ru: '✨ Удача', en: '✨ Luck' },
];

export const FRIEND_LINES_RU = {
  mira: [
    'На кувшинках сегодня золотые блики.',
    'Попробуй сладкую прикормку на рассвете.',
    'Линь любит тишину — не торопись с подсечкой.',
  ],
  kolya: [
    'С моста вертушка работает лучше.',
    'Не держи спиннинг мёртвой хваткой — пульсируй.',
    'Жерех бьёт утром у опор.',
  ],
  lena: [
    'В камышах лучше тонкая леска.',
    'Если рвёт — ослабь и лови зелёную зону.',
    'Ночной причал любит терпение.',
  ],
  tim: [
    'У пирса спокойно — каша работает.',
    'Не гоните заброс: сладкая зона важнее силы.',
    'Карась клюёт длинно — подождите верный нырок.',
  ],
};

export const FRIEND_LINES_EN = {
  mira: [
    'Golden ripples on the lilies today.',
    'Try sweet chum at dawn.',
    'Tench likes quiet — don’t rush the hook.',
  ],
  kolya: [
    'Spinner works better from the bridge.',
    'Don’t lock the spin — pulse the reel.',
    'Asp hits mornings by the pillars.',
  ],
  lena: [
    'Thin line is better in the reeds.',
    'If it snaps — ease off and stay green.',
    'Night jetty rewards patience.',
  ],
  tim: [
    'Quiet at the pier — chum mix works.',
    'Don’t rush the cast: sweet zone beats power.',
    'Crucian bites long — wait for the real dip.',
  ],
};

export function coveFeed(save, lang = 'ru') {
  const phrases = lang === 'en' ? COVE_PHRASES_EN : COVE_PHRASES_RU;
  const seed = Math.floor((Date.now() / 60000) + (save.castsTotal || 0));
  const out = [];
  for (let i = 0; i < 5; i++) {
    out.push(phrases[(seed + i * 3) % phrases.length]);
  }
  return out;
}

export function friendReply(friendId, lang = 'ru') {
  const pack = lang === 'en' ? FRIEND_LINES_EN : FRIEND_LINES_RU;
  const lines = pack[friendId] || pack.mira;
  const i = Math.floor(Date.now() / 45000) % lines.length;
  return lines[i];
}

/** Live activity feed while fishing — preset lines only (6+ safe). */
export function pierActivityFeed(save, lang = 'ru') {
  const friends = ['mira', 'kolya', 'lena', 'tim'];
  const seed = Math.floor(Date.now() / 28000) + (save.castsTotal || 0);
  const out = [];
  for (let i = 0; i < 4; i++) {
    const fid = friends[(seed + i) % friends.length];
    const name = lang === 'en'
      ? ({ mira: 'Mira', kolya: 'Kolya', lena: 'Lena', tim: 'Tim' })[fid]
      : ({ mira: 'Мира', kolya: 'Коля', lena: 'Лена', tim: 'Тим' })[fid];
    const line = friendReply(fid, lang);
    out.push({ friendId: fid, name, text: line });
  }
  // Rotate a cove phrase in
  const phrases = lang === 'en' ? COVE_PHRASES_EN : COVE_PHRASES_RU;
  out.push({ friendId: null, name: lang === 'en' ? 'Cove' : 'Заводь', text: phrases[seed % phrases.length] });
  return out;
}
