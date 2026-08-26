/** @typedef {'common'|'rare'|'epic'|'legend'} Rarity */
/** @typedef {'morning'|'day'|'evening'|'night'} Tod */
/** @typedef {'nibble'|'shy'|'aggressive'|'long'} BiteStyle */
/** @typedef {'float'|'spin'|'bottom'} RodKind */

export const TOD_CYCLE = ['morning', 'day', 'evening', 'night'];

/**
 * spots: ids where fish prefers
 * baits: preferred bait ids (strong match)
 * bite: wait/fight personality
 */
export const FISH = [
  { id: 'bleak', nameRu: 'Уклейка', nameEn: 'Bleak', rarity: 'common', color: '#9ad0e0', accent: '#e8f6ff', minW: 40, maxW: 90, coins: 8, zones: [0], pull: 0.44, todBias: ['morning', 'day'], spots: ['pier', 'bridge'], baits: ['bread', 'bloodworm'], bite: 'nibble', shape: 'slim' },
  { id: 'roach', nameRu: 'Плотва', nameEn: 'Roach', rarity: 'common', color: '#d9a06a', accent: '#fff0e0', minW: 80, maxW: 180, coins: 12, zones: [0, 1], pull: 0.5, todBias: ['day'], spots: ['pier', 'reeds', 'lilies'], baits: ['bread', 'worm'], bite: 'shy', shape: 'round' },
  { id: 'perch', nameRu: 'Окунь', nameEn: 'Perch', rarity: 'common', color: '#d47a4a', accent: '#2a5a3a', minW: 120, maxW: 280, coins: 16, zones: [0, 1], pull: 0.6, todBias: ['morning', 'evening'], spots: ['reeds', 'snags', 'pier'], baits: ['worm', 'shine', 'spinner'], bite: 'aggressive', shape: 'spiny' },
  { id: 'rudd', nameRu: 'Краснопёрка', nameEn: 'Rudd', rarity: 'common', color: '#e07060', accent: '#ffd0c0', minW: 90, maxW: 200, coins: 14, zones: [0], pull: 0.52, todBias: ['day', 'evening'], spots: ['lilies', 'reeds'], baits: ['bread', 'bloodworm'], bite: 'nibble', shape: 'round' },
  { id: 'bream', nameRu: 'Лещ', nameEn: 'Bream', rarity: 'common', color: '#c4b08a', accent: '#efe6d4', minW: 200, maxW: 450, coins: 22, zones: [1], pull: 0.64, todBias: ['evening', 'night'], spots: ['deep', 'channel'], baits: ['worm', 'pearl', 'bloodworm', 'corn', 'pellet'], bite: 'long', shape: 'flat' },
  { id: 'gudgeon', nameRu: 'Пескарь', nameEn: 'Gudgeon', rarity: 'common', color: '#b8956a', accent: '#e8d8c0', minW: 50, maxW: 120, coins: 10, zones: [0], pull: 0.42, todBias: ['day'], spots: ['pier', 'bridge'], baits: ['worm', 'bloodworm'], bite: 'shy', shape: 'slim' },
  { id: 'ruffe', nameRu: 'Ёрш', nameEn: 'Ruffe', rarity: 'common', color: '#8a9a7a', accent: '#d0dcc8', minW: 60, maxW: 140, coins: 11, zones: [0, 1], pull: 0.48, todBias: ['morning'], spots: ['snags', 'pier'], baits: ['worm'], bite: 'nibble', shape: 'spiny' },
  { id: 'dace', nameRu: 'Елец', nameEn: 'Dace', rarity: 'common', color: '#c8d4a8', accent: '#f0f4e4', minW: 70, maxW: 160, coins: 13, zones: [0, 1], pull: 0.5, todBias: ['day'], spots: ['bridge', 'channel'], baits: ['bread', 'shine'], bite: 'aggressive', shape: 'slim' },
  { id: 'crucian', nameRu: 'Карась', nameEn: 'Crucian', rarity: 'common', color: '#c9a060', accent: '#ffe8c0', minW: 150, maxW: 400, coins: 18, zones: [0, 1], pull: 0.57, todBias: ['morning', 'day'], spots: ['lilies', 'reeds', 'pond'], baits: ['bread', 'worm', 'pearl', 'corn'], bite: 'long', shape: 'round' },
  { id: 'ide', nameRu: 'Язь', nameEn: 'Ide', rarity: 'rare', color: '#e8c070', accent: '#fff4d0', minW: 250, maxW: 600, coins: 36, zones: [1, 2], pull: 0.7, todBias: ['morning'], spots: ['channel', 'bridge'], baits: ['worm', 'shine'], bite: 'aggressive', shape: 'thick' },
  { id: 'pikelet', nameRu: 'Щурка', nameEn: 'Young pike', rarity: 'rare', color: '#6aaa6a', accent: '#c8e8c0', minW: 300, maxW: 700, coins: 42, zones: [1, 2], pull: 0.84, todBias: ['morning', 'evening'], spots: ['reeds', 'snags', 'lilies'], baits: ['shine', 'spinner', 'minnow'], bite: 'aggressive', shape: 'pike' },
  { id: 'tench', nameRu: 'Линь', nameEn: 'Tench', rarity: 'rare', color: '#6b8f4e', accent: '#d4e8c4', minW: 280, maxW: 650, coins: 40, zones: [1], pull: 0.67, todBias: ['day'], spots: ['lilies', 'pond', 'deep'], baits: ['worm', 'bloodworm', 'pearl'], bite: 'shy', shape: 'thick' },
  { id: 'chub', nameRu: 'Голавль', nameEn: 'Chub', rarity: 'rare', color: '#8a9aaa', accent: '#dce4ec', minW: 320, maxW: 720, coins: 44, zones: [2], pull: 0.81, todBias: ['day'], spots: ['bridge', 'channel'], baits: ['shine', 'spinner', 'bread'], bite: 'aggressive', shape: 'thick' },
  { id: 'asp', nameRu: 'Жерех', nameEn: 'Asp', rarity: 'rare', color: '#b0c4d0', accent: '#e8f2f8', minW: 400, maxW: 900, coins: 55, zones: [2], pull: 0.88, todBias: ['morning'], spots: ['channel', 'open'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'slim' },
  { id: 'zander', nameRu: 'Судачок', nameEn: 'Zander', rarity: 'rare', color: '#7a9aaa', accent: '#d0e0e8', minW: 350, maxW: 800, coins: 48, zones: [1, 2], pull: 0.86, todBias: ['evening', 'night'], spots: ['deep', 'snags', 'channel'], baits: ['minnow', 'spinner', 'shine'], bite: 'long', shape: 'pike' },
  { id: 'barb', nameRu: 'Усач', nameEn: 'Barbel', rarity: 'rare', color: '#c4a070', accent: '#efe0c8', minW: 380, maxW: 850, coins: 50, zones: [2], pull: 0.88, todBias: ['day'], spots: ['channel', 'bridge'], baits: ['worm', 'bloodworm'], bite: 'long', shape: 'thick' },
  { id: 'vimba', nameRu: 'Рыбец', nameEn: 'Vimba', rarity: 'rare', color: '#d0b090', accent: '#f4e8d8', minW: 220, maxW: 520, coins: 38, zones: [1], pull: 0.7, todBias: ['morning'], spots: ['channel', 'open'], baits: ['bloodworm', 'pearl'], bite: 'nibble', shape: 'slim' },
  { id: 'catfish', nameRu: 'Сомик', nameEn: 'Little catfish', rarity: 'epic', color: '#5a5a68', accent: '#c8c8d4', minW: 500, maxW: 1200, coins: 80, zones: [2], pull: 0.96, todBias: ['evening', 'night'], spots: ['deep', 'snags'], baits: ['worm', 'minnow', 'pearl'], bite: 'long', shape: 'cat' },
  { id: 'mirror', nameRu: 'Зеркальный карп', nameEn: 'Mirror carp', rarity: 'epic', color: '#c9a070', accent: '#f0e0c8', minW: 600, maxW: 1400, coins: 90, zones: [1, 2], pull: 0.94, todBias: ['day', 'evening'], spots: ['pond', 'deep', 'lilies'], baits: ['pearl', 'bread', 'worm', 'corn', 'pellet'], bite: 'long', shape: 'carp' },
  { id: 'dawn_koi', nameRu: 'Рассветный кои', nameEn: 'Dawn koi', rarity: 'epic', color: '#ff8a6a', accent: '#ffe0d0', minW: 350, maxW: 800, coins: 110, zones: [2], pull: 0.9, todBias: ['morning'], spots: ['pond', 'lilies'], baits: ['pearl', 'bread'], bite: 'shy', shape: 'carp' },
  { id: 'glass', nameRu: 'Стеклянный окунь', nameEn: 'Glass perch', rarity: 'epic', color: '#a8e8ff', accent: '#e8f8ff', minW: 100, maxW: 220, coins: 100, zones: [0, 2], pull: 0.86, todBias: ['evening', 'night'], spots: ['open', 'deep'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'spiny' },
  { id: 'gold_orfe', nameRu: 'Золотая орфа', nameEn: 'Golden orfe', rarity: 'epic', color: '#f0b040', accent: '#ffe8a8', minW: 280, maxW: 640, coins: 95, zones: [1, 2], pull: 0.84, todBias: ['day'], spots: ['open', 'pond'], baits: ['shine', 'bread'], bite: 'nibble', shape: 'slim' },
  { id: 'storm_eel', nameRu: 'Штормовой угорь', nameEn: 'Storm eel', rarity: 'epic', color: '#4a5a70', accent: '#b0c0d0', minW: 400, maxW: 1000, coins: 105, zones: [2], pull: 0.96, todBias: ['evening', 'night'], spots: ['deep', 'snags'], baits: ['worm', 'minnow'], bite: 'long', shape: 'eel' },
  { id: 'pearl_crucian', nameRu: 'Жемчужный карась', nameEn: 'Pearl crucian', rarity: 'legend', color: '#e8e0f8', accent: '#ffffff', minW: 450, maxW: 900, coins: 160, zones: [1, 2], pull: 0.96, todBias: ['morning'], spots: ['pond', 'lilies'], baits: ['pearl'], bite: 'shy', shape: 'round' },
  { id: 'night_pike', nameRu: 'Ночная щука', nameEn: 'Night pike', rarity: 'legend', color: '#3d6b4a', accent: '#a8d0b0', minW: 700, maxW: 1600, coins: 180, zones: [2], pull: 0.96, todBias: ['night', 'evening'], spots: ['reeds', 'snags', 'open'], baits: ['minnow', 'spinner'], bite: 'aggressive', shape: 'pike' },
  { id: 'cove_spirit', nameRu: 'Дух заводи', nameEn: 'Cove spirit', rarity: 'legend', color: '#7ec8ff', accent: '#e0f4ff', minW: 200, maxW: 400, coins: 200, zones: [0, 1, 2], pull: 0.88, todBias: ['morning', 'night'], spots: ['open', 'deep', 'pond'], baits: ['pearl', 'shine'], bite: 'long', shape: 'spirit' },
];

export const RODS = [
  { id: 'reed', nameRu: 'Тростинная удочка', nameEn: 'Reed rod', kind: 'float', price: 0, maxZone: 0, hookWindow: 0.75, line: 0.68, waitMul: 1.05, fightMul: 1.05 },
  { id: 'pine', nameRu: 'Сосновая удочка', nameEn: 'Pine rod', kind: 'float', price: 120, maxZone: 1, hookWindow: 0.82, line: 0.76, waitMul: 1, fightMul: 1 },
  { id: 'cedar', nameRu: 'Кедровая удочка', nameEn: 'Cedar rod', kind: 'float', price: 280, maxZone: 2, hookWindow: 0.9, line: 0.84, waitMul: 0.95, fightMul: 0.95 },
  { id: 'match', nameRu: 'Матчевая удочка', nameEn: 'Match rod', kind: 'float', price: 420, maxZone: 2, hookWindow: 0.98, line: 0.88, waitMul: 0.92, fightMul: 0.92 },
  { id: 'carbon', nameRu: 'Карбоновая удочка', nameEn: 'Carbon rod', kind: 'float', price: 560, maxZone: 2, hookWindow: 1.05, line: 0.92, waitMul: 0.88, fightMul: 0.88 },
  { id: 'spin_light', nameRu: 'Лёгкий спиннинг', nameEn: 'Light spinning', kind: 'spin', price: 200, maxZone: 1, hookWindow: 0.68, line: 0.78, waitMul: 0.7, fightMul: 0.98 },
  { id: 'spin_mid', nameRu: 'Средний спиннинг', nameEn: 'Medium spinning', kind: 'spin', price: 380, maxZone: 2, hookWindow: 0.72, line: 0.84, waitMul: 0.62, fightMul: 0.94 },
  { id: 'spin_heavy', nameRu: 'Тяжёлый спиннинг', nameEn: 'Heavy spinning', kind: 'spin', price: 640, maxZone: 2, hookWindow: 0.78, line: 0.92, waitMul: 0.58, fightMul: 0.9 },
  { id: 'feeder_light', nameRu: 'Лёгкая донка', nameEn: 'Light feeder', kind: 'bottom', price: 240, maxZone: 1, hookWindow: 0.92, line: 0.82, waitMul: 1.55, fightMul: 0.96 },
  { id: 'feeder_carp', nameRu: 'Карповая донка', nameEn: 'Carp feeder', kind: 'bottom', price: 480, maxZone: 2, hookWindow: 1.0, line: 0.9, waitMul: 1.7, fightMul: 0.9 },
];

export const BAITS = [
  { id: 'bread', nameRu: 'Хлебный шарик', nameEn: 'Bread ball', price: 0, biteMul: 1, rareMul: 1, forKind: 'float' },
  { id: 'worm', nameRu: 'Червяк', nameEn: 'Worm', price: 40, biteMul: 1.1, rareMul: 1.12, forKind: 'any' },
  { id: 'bloodworm', nameRu: 'Мотыль', nameEn: 'Bloodworm', price: 70, biteMul: 1.15, rareMul: 1.18, forKind: 'float' },
  { id: 'shine', nameRu: 'Блесна рассвета', nameEn: 'Dawn spoon', price: 100, biteMul: 1.05, rareMul: 1.35, forKind: 'spin' },
  { id: 'spinner', nameRu: 'Вертушка', nameEn: 'Spinner', price: 130, biteMul: 1.08, rareMul: 1.4, forKind: 'spin' },
  { id: 'minnow', nameRu: 'Воблер', nameEn: 'Minnow lure', price: 160, biteMul: 1.05, rareMul: 1.5, forKind: 'spin' },
  { id: 'pearl', nameRu: 'Жемчужная наживка', nameEn: 'Pearl bait', price: 180, biteMul: 1.05, rareMul: 1.65, forKind: 'float' },
  { id: 'corn', nameRu: 'Кукуруза', nameEn: 'Corn', price: 50, biteMul: 1.08, rareMul: 1.1, forKind: 'bottom' },
  { id: 'pellet', nameRu: 'Пеллетс', nameEn: 'Pellets', price: 95, biteMul: 1.12, rareMul: 1.25, forKind: 'bottom' },
];

export const HOOKS = [
  { id: 'hook_s', nameRu: 'Крючок №10', nameEn: 'Hook #10', price: 0, hookMul: 1, sizeMul: 0.95 },
  { id: 'hook_m', nameRu: 'Крючок №6', nameEn: 'Hook #6', price: 60, hookMul: 1.08, sizeMul: 1 },
  { id: 'hook_l', nameRu: 'Крючок №2', nameEn: 'Hook #2', price: 120, hookMul: 1.12, sizeMul: 1.08 },
  { id: 'hook_xl', nameRu: 'Трофейный крючок', nameEn: 'Trophy hook', price: 220, hookMul: 1.18, sizeMul: 1.15 },
];

export const LINES = [
  { id: 'line_thin', nameRu: 'Леска 0.16', nameEn: 'Line 0.16', price: 0, strength: 0.64, wearPerFight: 0.055 },
  { id: 'line_mid', nameRu: 'Леска 0.22', nameEn: 'Line 0.22', price: 90, strength: 0.76, wearPerFight: 0.04 },
  { id: 'line_thick', nameRu: 'Леска 0.28', nameEn: 'Line 0.28', price: 160, strength: 0.86, wearPerFight: 0.028 },
  { id: 'line_braid', nameRu: 'Шнур', nameEn: 'Braid', price: 280, strength: 0.94, wearPerFight: 0.02 },
];

export const GROUNDBAITS = [
  { id: 'chum_mix', nameRu: 'Каша-прикормка', nameEn: 'Chum mix', price: 35, casts: 3, waitMul: 0.82, rareMul: 1.08 },
  { id: 'chum_sweet', nameRu: 'Сладкая прикормка', nameEn: 'Sweet chum', price: 55, casts: 3, waitMul: 0.78, rareMul: 1.12 },
  { id: 'chum_fish', nameRu: 'Рыбная прикормка', nameEn: 'Fishmeal chum', price: 70, casts: 2, waitMul: 0.85, rareMul: 1.2 },
];

export const WEATHERS = [
  { id: 'clear', nameRu: 'Ясно', nameEn: 'Clear', activity: { morning: 0.85, day: 0.7, evening: 0.9, night: 0.55 } },
  { id: 'cloudy', nameRu: 'Облачно', nameEn: 'Cloudy', activity: { morning: 1, day: 0.95, evening: 1.05, night: 0.75 } },
  { id: 'rain', nameRu: 'Дождь', nameEn: 'Rain', activity: { morning: 1.1, day: 1.15, evening: 1.2, night: 0.9 } },
];

export const BOBBERS = [
  { id: 'classic', nameRu: 'Классический', nameEn: 'Classic', price: 0, color: '#e85d4c' },
  { id: 'amber', nameRu: 'Янтарный', nameEn: 'Amber', price: 80, color: '#e0a040' },
  { id: 'mint', nameRu: 'Мятный', nameEn: 'Mint', price: 80, color: '#4ec9a0' },
  { id: 'violet', nameRu: 'Фиалковый', nameEn: 'Violet', price: 120, color: '#9b6fd6' },
];

export const SPOTS = [
  { id: 'pier', nameRu: 'Пирс', nameEn: 'Pier', unlockRank: 1, zoneBonus: 0, rareMul: 1, waitMul: 1, descRu: 'Спокойная заводь у досок', descEn: 'Calm water by the boards' },
  { id: 'reeds', nameRu: 'Камыши', nameEn: 'Reeds', unlockRank: 2, zoneBonus: 0, rareMul: 1.12, waitMul: 1.1, descRu: 'Укрытия для хищника', descEn: 'Cover for predators' },
  { id: 'lilies', nameRu: 'Кувшинки', nameEn: 'Lilies', unlockRank: 3, zoneBonus: 1, rareMul: 1.2, waitMul: 1.15, descRu: 'Тихие окна среди листьев', descEn: 'Quiet windows among leaves' },
  { id: 'bridge', nameRu: 'Мост', nameEn: 'Bridge', unlockRank: 3, zoneBonus: 1, rareMul: 1.18, waitMul: 1.05, descRu: 'Тень и течение', descEn: 'Shade and current' },
  { id: 'snags', nameRu: 'Коряжник', nameEn: 'Snags', unlockRank: 4, zoneBonus: 1, rareMul: 1.28, waitMul: 1.2, descRu: 'Опасные зацепы, крупная рыба', descEn: 'Snaggy, bigger fish' },
  { id: 'pond', nameRu: 'Тихий пруд', nameEn: 'Quiet pond', unlockRank: 4, zoneBonus: 0, rareMul: 1.22, waitMul: 1.25, descRu: 'Карповые и миражи', descEn: 'Carp and quiet miracles' },
  { id: 'channel', nameRu: 'Протока', nameEn: 'Channel', unlockRank: 5, zoneBonus: 2, rareMul: 1.3, waitMul: 0.95, descRu: 'Быстрая вода', descEn: 'Faster water' },
  { id: 'deep', nameRu: 'Омут', nameEn: 'Deep hole', unlockRank: 5, zoneBonus: 2, rareMul: 1.4, waitMul: 1.35, descRu: 'Глубина и терпение', descEn: 'Depth and patience' },
  { id: 'open', nameRu: 'Открытая гладь', nameEn: 'Open water', unlockRank: 6, zoneBonus: 2, rareMul: 1.35, waitMul: 1.1, descRu: 'Простор для спиннинга', descEn: 'Space for spinning' },
];

export const BACKGROUNDS = [
  { id: 'dawn', price: 0 },
  { id: 'mist', price: 180 },
  { id: 'sunset', price: 240 },
];

export const AQUARIUM_SLOTS = 8;
export const IAP_ROD_SKIN = 'quiet_cove_rod_skin';
export const SWEET_POWER_MIN = 0.58;
export const SWEET_POWER_MAX = 0.76;

export function getFish(id) {
  return FISH.find((f) => f.id === id);
}

export function getRod(id) {
  return RODS.find((r) => r.id === id) || RODS[0];
}

export function getBait(id) {
  return BAITS.find((b) => b.id === id) || BAITS[0];
}

export function getBobber(id) {
  return BOBBERS.find((b) => b.id === id) || BOBBERS[0];
}

export function getSpot(id) {
  return SPOTS.find((s) => s.id === id) || SPOTS[0];
}

export function getHook(id) {
  return HOOKS.find((h) => h.id === id) || HOOKS[0];
}

export function getLine(id) {
  return LINES.find((l) => l.id === id) || LINES[0];
}

export function getGroundbait(id) {
  return GROUNDBAITS.find((g) => g.id === id) || null;
}

export function getWeather(id) {
  return WEATHERS.find((w) => w.id === id) || WEATHERS[0];
}

export function rollWeight(fish, sizeMul = 1) {
  const lo = fish.minW;
  const hi = fish.maxW * Math.max(0.9, sizeMul);
  return Math.round(lo + Math.random() * (hi - lo));
}

/** @returns {'tiny'|'normal'|'large'|'trophy'} */
export function catchClass(fish, weight) {
  const t = (weight - fish.minW) / Math.max(1, fish.maxW - fish.minW);
  if (t >= 0.92 || weight >= fish.maxW * 0.95) return 'trophy';
  if (t >= 0.65) return 'large';
  if (t <= 0.28) return 'tiny';
  return 'normal';
}

export function biteActivity(weatherId, tod) {
  const w = getWeather(weatherId);
  return w.activity[tod] ?? 0.8;
}

export function fishHintLine(fish, lang = 'ru') {
  const spots = (fish.spots || []).slice(0, 2).map((id) => {
    const s = getSpot(id);
    return lang === 'en' ? s.nameEn : s.nameRu;
  });
  const baits = (fish.baits || []).slice(0, 2).map((id) => {
    const b = getBait(id);
    return b ? (lang === 'en' ? b.nameEn : b.nameRu) : id;
  });
  const tod = (fish.todBias || []).map((x) => x);
  return { spots, baits, tod };
}

export function sellValue(fish, weight) {
  const mid = (fish.minW + fish.maxW) / 2;
  const factor = 0.75 + (weight / mid) * 0.5;
  const legendBoost = fish.rarity === 'legend' ? 1.15 : 1;
  const cls = catchClass(fish, weight);
  const classMul = cls === 'trophy' ? 1.35 : cls === 'large' ? 1.15 : cls === 'tiny' ? 0.85 : 1;
  return Math.max(1, Math.round(fish.coins * factor * legendBoost * classMul));
}

export function starRating(fish, weight) {
  const t = (weight - fish.minW) / Math.max(1, fish.maxW - fish.minW);
  if (t > 0.85) return 3;
  if (t > 0.5) return 2;
  return 1;
}

export function baitFitsRod(bait, rod) {
  if (!bait.forKind || bait.forKind === 'any') return true;
  return bait.forKind === rod.kind;
}

export function pickFish(zone, bait, rod, opts = {}) {
  const {
    tod = 'morning',
    hotspot = false,
    lucky = false,
    spotId = 'pier',
    spotRareMul = 1,
    weatherId = 'clear',
    chumRareMul = 1,
  } = opts;
  const maxZone = rod.maxZone;
  const z = Math.min(Math.max(0, zone), maxZone);
  const activity = biteActivity(weatherId, tod);

  let pool = FISH.filter((f) => f.zones.includes(z));
  const preferred = pool.filter((f) => {
    const spotOk = !f.spots?.length || f.spots.includes(spotId);
    const todOk = !f.todBias?.length || f.todBias.includes(tod);
    const baitOk = !f.baits?.length || f.baits.includes(bait.id);
    const spinOk = rod.kind !== 'spin' || f.baits?.some((b) => ['shine', 'spinner', 'minnow'].includes(b)) || f.bite === 'aggressive';
    const bottomOk = rod.kind !== 'bottom' || f.bite === 'long' || f.bite === 'shy' || f.baits?.some((b) => ['worm', 'bread', 'pearl', 'corn', 'pellet', 'bloodworm'].includes(b));
    if (rod.kind === 'spin') return spotOk && todOk && (baitOk || Math.random() < 0.25) && spinOk;
    if (rod.kind === 'bottom') return spotOk && todOk && (baitOk || Math.random() < 0.3) && bottomOk;
    return spotOk && todOk && (baitOk || Math.random() < 0.25);
  });
  if (preferred.length) pool = preferred;
  if (!pool.length) pool = FISH.filter((f) => f.zones.includes(0));

  const weights = pool.map((f) => {
    let w = f.rarity === 'common' ? 10 : f.rarity === 'rare' ? 3.2 : f.rarity === 'epic' ? 1 : 0.32;
    if (f.rarity !== 'common') w *= bait.rareMul * spotRareMul * chumRareMul;
    if (f.todBias?.includes(tod)) w *= 1.8;
    if (f.spots?.includes(spotId)) w *= 1.7;
    if (f.baits?.includes(bait.id)) w *= 2.1;
    if (hotspot && f.rarity !== 'common') w *= 1.3;
    if (lucky && (f.rarity === 'epic' || f.rarity === 'legend')) w *= 1.7;
    if (rod.kind === 'spin' && f.bite === 'aggressive') w *= 1.4;
    if (rod.kind === 'float' && (f.bite === 'shy' || f.bite === 'long')) w *= 1.2;
    if (rod.kind === 'bottom' && (f.bite === 'long' || f.shape === 'carp' || f.shape === 'round')) w *= 1.45;
    if (weatherId === 'rain' && (f.bite === 'aggressive' || f.todBias?.includes('evening'))) w *= 1.15;
    if (weatherId === 'clear' && tod === 'day') w *= 0.9;
    w *= 0.75 + activity * 0.35;
    return w;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[0];
}

/** Base wait seconds before real bite — intentionally patient */
export function biteWaitRange(bite, rod, spot, bait, extras = {}) {
  const ranges = {
    nibble: [16, 32],
    shy: [22, 40],
    aggressive: [12, 24],
    long: [26, 48],
  };
  const [a, b] = ranges[bite] || ranges.nibble;
  const weatherMul = 1 / Math.max(0.55, extras.activity || 1);
  const chumMul = extras.chumWaitMul || 1;
  const mul = (rod.waitMul || 1) * (spot.waitMul || 1) * weatherMul * chumMul / Math.max(0.75, bait.biteMul || 1);
  return { min: a * mul, max: b * mul };
}

export function zoneFromPower(power, maxZone, spotBonus = 0) {
  let z = 0;
  if (power < 0.38) z = 0;
  else if (power < 0.72) z = Math.min(1, maxZone);
  else z = maxZone;
  return Math.min(maxZone, z + (spotBonus > 0 && power > 0.5 ? Math.min(spotBonus, maxZone - z) : 0));
}

export function isSweetCast(power) {
  return power >= SWEET_POWER_MIN && power <= SWEET_POWER_MAX;
}

/** Effective line limit combining rod + line item + wear (0..1 wear) */
export function effectiveLineLimit(rod, lineItem, wear = 0) {
  const base = Math.min(rod.line || 0.85, lineItem.strength || 0.7);
  return Math.max(0.5, base - wear * 0.42);
}
