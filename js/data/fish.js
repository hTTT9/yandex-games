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
  { id: 'bleak', nameRu: 'Уклейка', nameEn: 'Bleak', rarity: 'common', color: '#9ad0e0', accent: '#e8f6ff', minW: 40, maxW: 90, coins: 14, zones: [0], pull: 0.44, todBias: ['morning', 'day'], spots: ['pier', 'bridge'], baits: ['bread', 'bloodworm'], bite: 'nibble', shape: 'slim' },
  { id: 'roach', nameRu: 'Плотва', nameEn: 'Roach', rarity: 'common', color: '#d9a06a', accent: '#fff0e0', minW: 80, maxW: 180, coins: 24, zones: [0, 1], pull: 0.5, todBias: ['day'], spots: ['pier', 'reeds', 'lilies'], baits: ['bread', 'worm'], bite: 'shy', shape: 'round' },
  { id: 'perch', nameRu: 'Окунь', nameEn: 'Perch', rarity: 'common', color: '#d47a4a', accent: '#2a5a3a', minW: 120, maxW: 280, coins: 32, zones: [0, 1], pull: 0.6, todBias: ['morning', 'evening'], spots: ['reeds', 'snags', 'pier'], baits: ['worm', 'shine', 'spinner'], bite: 'aggressive', shape: 'spiny' },
  { id: 'rudd', nameRu: 'Краснопёрка', nameEn: 'Rudd', rarity: 'common', color: '#e07060', accent: '#ffd0c0', minW: 90, maxW: 200, coins: 28, zones: [0], pull: 0.52, todBias: ['day', 'evening'], spots: ['lilies', 'reeds'], baits: ['bread', 'bloodworm'], bite: 'nibble', shape: 'round' },
  { id: 'bream', nameRu: 'Лещ', nameEn: 'Bream', rarity: 'common', color: '#c4b08a', accent: '#efe6d4', minW: 200, maxW: 450, coins: 42, zones: [1], pull: 0.64, todBias: ['evening', 'night'], spots: ['deep', 'channel'], baits: ['worm', 'pearl', 'bloodworm', 'corn', 'pellet'], bite: 'long', shape: 'flat' },
  { id: 'gudgeon', nameRu: 'Пескарь', nameEn: 'Gudgeon', rarity: 'common', color: '#b8956a', accent: '#e8d8c0', minW: 50, maxW: 120, coins: 21, zones: [0], pull: 0.42, todBias: ['day'], spots: ['pier', 'bridge'], baits: ['worm', 'bloodworm'], bite: 'shy', shape: 'slim' },
  { id: 'ruffe', nameRu: 'Ёрш', nameEn: 'Ruffe', rarity: 'common', color: '#8a9a7a', accent: '#d0dcc8', minW: 60, maxW: 140, coins: 21, zones: [0, 1], pull: 0.48, todBias: ['morning'], spots: ['snags', 'pier'], baits: ['worm'], bite: 'nibble', shape: 'spiny' },
  { id: 'dace', nameRu: 'Елец', nameEn: 'Dace', rarity: 'common', color: '#c8d4a8', accent: '#f0f4e4', minW: 70, maxW: 160, coins: 24, zones: [0, 1], pull: 0.5, todBias: ['day'], spots: ['bridge', 'channel'], baits: ['bread', 'shine'], bite: 'aggressive', shape: 'slim' },
  { id: 'crucian', nameRu: 'Карась', nameEn: 'Crucian', rarity: 'common', color: '#c9a060', accent: '#ffe8c0', minW: 150, maxW: 400, coins: 35, zones: [0, 1], pull: 0.57, todBias: ['morning', 'day'], spots: ['lilies', 'reeds', 'pond'], baits: ['bread', 'worm', 'pearl', 'corn'], bite: 'long', shape: 'round' },
  { id: 'ide', nameRu: 'Язь', nameEn: 'Ide', rarity: 'rare', color: '#e8c070', accent: '#fff4d0', minW: 250, maxW: 600, coins: 70, zones: [1, 2], pull: 0.7, todBias: ['morning'], spots: ['channel', 'bridge'], baits: ['worm', 'shine'], bite: 'aggressive', shape: 'thick' },
  { id: 'pikelet', nameRu: 'Щурка', nameEn: 'Young pike', rarity: 'rare', color: '#6aaa6a', accent: '#c8e8c0', minW: 300, maxW: 700, coins: 80, zones: [1, 2], pull: 0.84, todBias: ['morning', 'evening'], spots: ['reeds', 'snags', 'lilies'], baits: ['shine', 'spinner', 'minnow'], bite: 'aggressive', shape: 'pike' },
  { id: 'tench', nameRu: 'Линь', nameEn: 'Tench', rarity: 'rare', color: '#6b8f4e', accent: '#d4e8c4', minW: 280, maxW: 650, coins: 77, zones: [1], pull: 0.67, todBias: ['day'], spots: ['lilies', 'pond', 'deep'], baits: ['worm', 'bloodworm', 'pearl'], bite: 'shy', shape: 'thick' },
  { id: 'chub', nameRu: 'Голавль', nameEn: 'Chub', rarity: 'rare', color: '#8a9aaa', accent: '#dce4ec', minW: 320, maxW: 720, coins: 84, zones: [2], pull: 0.81, todBias: ['day'], spots: ['bridge', 'channel'], baits: ['shine', 'spinner', 'bread'], bite: 'aggressive', shape: 'thick' },
  { id: 'asp', nameRu: 'Жерех', nameEn: 'Asp', rarity: 'rare', color: '#b0c4d0', accent: '#e8f2f8', minW: 400, maxW: 900, coins: 105, zones: [2], pull: 0.88, todBias: ['morning'], spots: ['channel', 'open'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'slim' },
  { id: 'zander', nameRu: 'Судачок', nameEn: 'Zander', rarity: 'rare', color: '#7a9aaa', accent: '#d0e0e8', minW: 350, maxW: 800, coins: 91, zones: [1, 2], pull: 0.86, todBias: ['evening', 'night'], spots: ['deep', 'snags', 'channel'], baits: ['minnow', 'spinner', 'shine'], bite: 'long', shape: 'pike' },
  { id: 'barb', nameRu: 'Усач', nameEn: 'Barbel', rarity: 'rare', color: '#c4a070', accent: '#efe0c8', minW: 380, maxW: 850, coins: 98, zones: [2], pull: 0.88, todBias: ['day'], spots: ['channel', 'bridge'], baits: ['worm', 'bloodworm'], bite: 'long', shape: 'thick' },
  { id: 'vimba', nameRu: 'Рыбец', nameEn: 'Vimba', rarity: 'rare', color: '#d0b090', accent: '#f4e8d8', minW: 220, maxW: 520, coins: 74, zones: [1], pull: 0.7, todBias: ['morning'], spots: ['channel', 'open'], baits: ['bloodworm', 'pearl'], bite: 'nibble', shape: 'slim' },
  { id: 'catfish', nameRu: 'Сомик', nameEn: 'Little catfish', rarity: 'epic', color: '#5a5a68', accent: '#c8c8d4', minW: 500, maxW: 1200, coins: 154, zones: [2], pull: 0.96, todBias: ['evening', 'night'], spots: ['deep', 'snags'], baits: ['worm', 'minnow', 'pearl'], bite: 'long', shape: 'cat' },
  { id: 'mirror', nameRu: 'Зеркальный карп', nameEn: 'Mirror carp', rarity: 'epic', color: '#c9a070', accent: '#f0e0c8', minW: 600, maxW: 1400, coins: 175, zones: [1, 2], pull: 0.94, todBias: ['day', 'evening'], spots: ['pond', 'deep', 'lilies'], baits: ['pearl', 'bread', 'worm', 'corn', 'pellet'], bite: 'long', shape: 'carp' },
  { id: 'dawn_koi', nameRu: 'Рассветный кои', nameEn: 'Dawn koi', rarity: 'epic', color: '#ff8a6a', accent: '#ffe0d0', minW: 350, maxW: 800, coins: 214, zones: [2], pull: 0.9, todBias: ['morning'], spots: ['pond', 'lilies'], baits: ['pearl', 'bread'], bite: 'shy', shape: 'carp' },
  { id: 'glass', nameRu: 'Стеклянный окунь', nameEn: 'Glass perch', rarity: 'epic', color: '#a8e8ff', accent: '#e8f8ff', minW: 100, maxW: 220, coins: 192, zones: [0, 2], pull: 0.86, todBias: ['evening', 'night'], spots: ['open', 'deep'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'spiny' },
  { id: 'gold_orfe', nameRu: 'Золотая орфа', nameEn: 'Golden orfe', rarity: 'epic', color: '#f0b040', accent: '#ffe8a8', minW: 280, maxW: 640, coins: 182, zones: [1, 2], pull: 0.84, todBias: ['day'], spots: ['open', 'pond'], baits: ['shine', 'bread'], bite: 'nibble', shape: 'slim' },
  { id: 'storm_eel', nameRu: 'Штормовой угорь', nameEn: 'Storm eel', rarity: 'epic', color: '#4a5a70', accent: '#b0c0d0', minW: 400, maxW: 1000, coins: 203, zones: [2], pull: 0.96, todBias: ['evening', 'night'], spots: ['deep', 'snags'], baits: ['worm', 'minnow'], bite: 'long', shape: 'eel' },
  { id: 'pearl_crucian', nameRu: 'Жемчужный карась', nameEn: 'Pearl crucian', rarity: 'legend', color: '#e8e0f8', accent: '#ffffff', minW: 450, maxW: 900, coins: 308, zones: [1, 2], pull: 0.96, todBias: ['morning'], spots: ['pond', 'lilies'], baits: ['pearl'], bite: 'shy', shape: 'round' },
  { id: 'night_pike', nameRu: 'Ночная щука', nameEn: 'Night pike', rarity: 'legend', color: '#3d6b4a', accent: '#a8d0b0', minW: 700, maxW: 1600, coins: 346, zones: [2], pull: 0.96, todBias: ['night', 'evening'], spots: ['reeds', 'snags', 'open'], baits: ['minnow', 'spinner'], bite: 'aggressive', shape: 'pike' },
  { id: 'smelt', nameRu: 'Корюшка', nameEn: 'Smelt', rarity: 'common', color: '#c8d8e8', accent: '#f0f6ff', minW: 35, maxW: 80, coins: 18, zones: [0], pull: 0.4, todBias: ['morning'], spots: ['pier', 'open'], baits: ['bloodworm', 'bread'], bite: 'nibble', shape: 'slim' },
  { id: 'minnow_fish', nameRu: 'Верховка', nameEn: 'Sunbleak', rarity: 'common', color: '#d0e0a8', accent: '#f4ffe0', minW: 20, maxW: 55, coins: 14, zones: [0], pull: 0.38, todBias: ['day'], spots: ['reeds', 'lilies'], baits: ['bread', 'bloodworm'], bite: 'nibble', shape: 'slim' },
  { id: 'loach', nameRu: 'Вьюн', nameEn: 'Loach', rarity: 'common', color: '#8a7a58', accent: '#d8ccb0', minW: 40, maxW: 110, coins: 21, zones: [0, 1], pull: 0.46, todBias: ['evening', 'night'], spots: ['pond', 'reeds'], baits: ['worm', 'bloodworm'], bite: 'shy', shape: 'eel' },
  { id: 'whitefish', nameRu: 'Сиг', nameEn: 'Whitefish', rarity: 'common', color: '#b8c8d8', accent: '#e8f0f8', minW: 180, maxW: 420, coins: 38, zones: [1], pull: 0.58, todBias: ['morning', 'day'], spots: ['open', 'channel'], baits: ['bloodworm', 'pearl'], bite: 'long', shape: 'slim' },
  { id: 'sabre', nameRu: 'Чехонь', nameEn: 'Sabrefish', rarity: 'common', color: '#a8c0d0', accent: '#e0f0f8', minW: 120, maxW: 300, coins: 32, zones: [1], pull: 0.55, todBias: ['day'], spots: ['open', 'channel'], baits: ['shine', 'bread'], bite: 'aggressive', shape: 'slim' },
  { id: 'nase', nameRu: 'Подуст', nameEn: 'Nase', rarity: 'common', color: '#b0a888', accent: '#e8e0c8', minW: 150, maxW: 350, coins: 32, zones: [0, 1], pull: 0.54, todBias: ['day'], spots: ['bridge', 'channel'], baits: ['bread', 'corn'], bite: 'shy', shape: 'round' },
  { id: 'grayling', nameRu: 'Хариус', nameEn: 'Grayling', rarity: 'rare', color: '#7aa0b8', accent: '#d0e8f4', minW: 200, maxW: 480, coins: 77, zones: [1, 2], pull: 0.72, todBias: ['morning'], spots: ['channel', 'open'], baits: ['shine', 'bloodworm'], bite: 'aggressive', shape: 'slim' },
  { id: 'trout', nameRu: 'Форель', nameEn: 'Trout', rarity: 'rare', color: '#d08070', accent: '#f8d8c8', minW: 250, maxW: 600, coins: 91, zones: [1, 2], pull: 0.8, todBias: ['morning', 'day'], spots: ['channel', 'open'], baits: ['shine', 'spinner', 'minnow'], bite: 'aggressive', shape: 'spiny' },
  { id: 'pike_perch', nameRu: 'Судак', nameEn: 'Pike-perch', rarity: 'rare', color: '#6a8898', accent: '#c8dce8', minW: 400, maxW: 950, coins: 102, zones: [2], pull: 0.86, todBias: ['evening', 'night'], spots: ['deep', 'channel'], baits: ['minnow', 'spinner'], bite: 'long', shape: 'pike' },
  { id: 'sheat', nameRu: 'Сом', nameEn: 'Wels', rarity: 'rare', color: '#4a4a58', accent: '#b0b0c0', minW: 600, maxW: 1600, coins: 112, zones: [2], pull: 0.92, todBias: ['night', 'evening'], spots: ['deep', 'snags'], baits: ['worm', 'minnow', 'pearl'], bite: 'long', shape: 'cat' },
  { id: 'carp_common', nameRu: 'Сазан', nameEn: 'Common carp', rarity: 'rare', color: '#c09060', accent: '#f0dcc0', minW: 500, maxW: 1300, coins: 98, zones: [1, 2], pull: 0.9, todBias: ['day', 'evening'], spots: ['pond', 'deep'], baits: ['corn', 'pellet', 'pearl'], bite: 'long', shape: 'carp' },
  { id: 'rudd_gold', nameRu: 'Золотая краснопёрка', nameEn: 'Golden rudd', rarity: 'rare', color: '#f0a050', accent: '#ffe8c0', minW: 100, maxW: 240, coins: 80, zones: [0, 1], pull: 0.62, todBias: ['day'], spots: ['lilies', 'pond'], baits: ['bread', 'pearl'], bite: 'nibble', shape: 'round' },
  { id: 'burbot', nameRu: 'Налим', nameEn: 'Burbot', rarity: 'rare', color: '#6a7080', accent: '#c8d0dc', minW: 350, maxW: 900, coins: 88, zones: [2], pull: 0.84, todBias: ['night'], spots: ['deep', 'snags'], baits: ['worm', 'minnow'], bite: 'long', shape: 'eel' },
  { id: 'salmon_smolt', nameRu: 'Лососёнок', nameEn: 'Salmon smolt', rarity: 'epic', color: '#e8a090', accent: '#ffe0d8', minW: 300, maxW: 700, coins: 182, zones: [2], pull: 0.9, todBias: ['morning'], spots: ['channel', 'open'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'slim' },
  { id: 'sturgeon_y', nameRu: 'Стерлядь', nameEn: 'Sterlet', rarity: 'epic', color: '#a09070', accent: '#e8dcc8', minW: 400, maxW: 900, coins: 214, zones: [2], pull: 0.88, todBias: ['day', 'evening'], spots: ['deep', 'channel'], baits: ['worm', 'bloodworm'], bite: 'long', shape: 'thick' },
  { id: 'moon_bream', nameRu: 'Лунный лещ', nameEn: 'Moon bream', rarity: 'epic', color: '#d0c8e8', accent: '#f4f0ff', minW: 350, maxW: 780, coins: 192, zones: [1, 2], pull: 0.82, todBias: ['night'], spots: ['deep', 'open'], baits: ['pearl', 'bloodworm'], bite: 'shy', shape: 'flat' },
  { id: 'ember_perch', nameRu: 'Уголёк-окунь', nameEn: 'Ember perch', rarity: 'epic', color: '#e07040', accent: '#ffd0a8', minW: 180, maxW: 360, coins: 178, zones: [1, 2], pull: 0.86, todBias: ['evening'], spots: ['reeds', 'snags'], baits: ['spinner', 'worm'], bite: 'aggressive', shape: 'spiny' },
  { id: 'silk_tench', nameRu: 'Шёлковый линь', nameEn: 'Silk tench', rarity: 'epic', color: '#90b070', accent: '#e0f0c8', minW: 320, maxW: 700, coins: 189, zones: [1], pull: 0.8, todBias: ['day'], spots: ['pond', 'lilies'], baits: ['pearl', 'worm'], bite: 'shy', shape: 'thick' },
  { id: 'aurora_asp', nameRu: 'Аврора-жерех', nameEn: 'Aurora asp', rarity: 'legend', color: '#90c8ff', accent: '#e8f6ff', minW: 500, maxW: 1100, coins: 329, zones: [2], pull: 0.94, todBias: ['morning'], spots: ['open', 'channel'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'slim' },
  { id: 'mist_cat', nameRu: 'Туманный сом', nameEn: 'Mist catfish', rarity: 'legend', color: '#5a6878', accent: '#c0d0e0', minW: 800, maxW: 2000, coins: 368, zones: [2], pull: 0.96, todBias: ['night'], spots: ['deep', 'snags'], baits: ['minnow', 'pearl'], bite: 'long', shape: 'cat' },
  { id: 'crown_carp', nameRu: 'Королевский карп', nameEn: 'Crown carp', rarity: 'legend', color: '#e8c060', accent: '#fff0c0', minW: 900, maxW: 2200, coins: 385, zones: [2], pull: 0.96, todBias: ['evening'], spots: ['pond', 'deep'], baits: ['pellet', 'pearl'], bite: 'long', shape: 'carp' },
  { id: 'star_roach', nameRu: 'Звёздная плотва', nameEn: 'Star roach', rarity: 'legend', color: '#d8c0ff', accent: '#f8f0ff', minW: 200, maxW: 420, coins: 318, zones: [0, 1, 2], pull: 0.78, todBias: ['night', 'morning'], spots: ['pier', 'lilies', 'open'], baits: ['pearl', 'bread'], bite: 'nibble', shape: 'round' },
  { id: 'bleak_silver', nameRu: 'Серебристая уклейка', nameEn: 'Silver bleak', rarity: 'common', color: '#b8d8e8', accent: '#f0f8ff', minW: 30, maxW: 70, coins: 14, zones: [0], pull: 0.4, todBias: ['morning'], spots: ['pier', 'willow'], baits: ['bread', 'bloodworm'], bite: 'nibble', shape: 'slim' },
  { id: 'perch_stripe', nameRu: 'Полосатый окунь', nameEn: 'Striped perch', rarity: 'common', color: '#c86840', accent: '#2a5030', minW: 140, maxW: 320, coins: 35, zones: [0, 1], pull: 0.62, todBias: ['morning', 'evening'], spots: ['reeds', 'mill', 'willow'], baits: ['worm', 'spinner'], bite: 'aggressive', shape: 'spiny' },
  { id: 'rudd_shy', nameRu: 'Тихая краснопёрка', nameEn: 'Quiet rudd', rarity: 'common', color: '#d86050', accent: '#ffc8b8', minW: 80, maxW: 180, coins: 24, zones: [0], pull: 0.5, todBias: ['day'], spots: ['lilies', 'willow'], baits: ['bread', 'corn'], bite: 'shy', shape: 'round' },
  { id: 'bream_bronze', nameRu: 'Бронзовый лещ', nameEn: 'Bronze bream', rarity: 'common', color: '#b89868', accent: '#e8d8b8', minW: 220, maxW: 480, coins: 46, zones: [1], pull: 0.66, todBias: ['evening'], spots: ['deep', 'dam', 'channel'], baits: ['worm', 'pellet'], bite: 'long', shape: 'flat' },
  { id: 'chub_river', nameRu: 'Речной голавль', nameEn: 'River chub', rarity: 'rare', color: '#7a8a9a', accent: '#d0d8e0', minW: 300, maxW: 700, coins: 88, zones: [1, 2], pull: 0.82, todBias: ['day'], spots: ['bridge', 'mill', 'spit'], baits: ['shine', 'bread'], bite: 'aggressive', shape: 'thick' },
  { id: 'pike_weed', nameRu: 'Травяная щука', nameEn: 'Weed pike', rarity: 'rare', color: '#5a9860', accent: '#b8e0b0', minW: 350, maxW: 850, coins: 98, zones: [1, 2], pull: 0.88, todBias: ['morning', 'evening'], spots: ['reeds', 'lilies', 'hotcove'], baits: ['spinner', 'minnow'], bite: 'aggressive', shape: 'pike' },
  { id: 'carp_ghost', nameRu: 'Призрачный карп', nameEn: 'Ghost carp', rarity: 'epic', color: '#d8d0c0', accent: '#f8f4ec', minW: 550, maxW: 1300, coins: 203, zones: [1, 2], pull: 0.94, todBias: ['night'], spots: ['pond', 'dam', 'hotcove'], baits: ['pellet', 'pearl'], bite: 'long', shape: 'carp' },
  { id: 'zander_gold', nameRu: 'Золотой судак', nameEn: 'Golden zander', rarity: 'epic', color: '#c8a050', accent: '#ffe8b0', minW: 400, maxW: 950, coins: 220, zones: [2], pull: 0.9, todBias: ['evening', 'night'], spots: ['deep', 'dam', 'hotcove'], baits: ['minnow', 'spinner'], bite: 'long', shape: 'pike' },
  { id: 'eel_night', nameRu: 'Ночной угорь', nameEn: 'Night eel', rarity: 'epic', color: '#3a4858', accent: '#98a8b8', minW: 380, maxW: 920, coins: 192, zones: [2], pull: 0.95, todBias: ['night'], spots: ['snags', 'deep', 'nightjetty'], baits: ['worm', 'minnow'], bite: 'long', shape: 'eel' },
  { id: 'asp_flash', nameRu: 'Вспышка-жерех', nameEn: 'Flash asp', rarity: 'epic', color: '#a0c0d8', accent: '#e8f4ff', minW: 450, maxW: 1000, coins: 206, zones: [2], pull: 0.92, todBias: ['morning'], spots: ['open', 'spit', 'channel'], baits: ['shine', 'spinner'], bite: 'aggressive', shape: 'slim' },
  { id: 'koi_midnight', nameRu: 'Полночный кои', nameEn: 'Midnight koi', rarity: 'legend', color: '#304060', accent: '#e0e8ff', minW: 400, maxW: 900, coins: 357, zones: [1, 2], pull: 0.9, todBias: ['night'], spots: ['pond', 'hotcove', 'nightjetty'], baits: ['pearl'], bite: 'shy', shape: 'carp' },
  { id: 'pike_queen', nameRu: 'Царица-щука', nameEn: 'Queen pike', rarity: 'legend', color: '#2d6040', accent: '#90d0a8', minW: 900, maxW: 2400, coins: 406, zones: [2], pull: 0.98, todBias: ['evening', 'night'], spots: ['reeds', 'hotcove', 'snags'], baits: ['minnow', 'spinner'], bite: 'aggressive', shape: 'pike' },
  { id: 'spirit_bream', nameRu: 'Дух-лещ', nameEn: 'Spirit bream', rarity: 'legend', color: '#c0b8e8', accent: '#f4f0ff', minW: 500, maxW: 1100, coins: 374, zones: [1, 2], pull: 0.88, todBias: ['morning', 'night'], spots: ['deep', 'hotcove', 'open'], baits: ['pearl', 'bloodworm'], bite: 'long', shape: 'flat' },
  { id: 'cove_gold', nameRu: 'Золото заводи', nameEn: 'Cove gold', rarity: 'legend', color: '#e8c040', accent: '#fff4c0', minW: 300, maxW: 700, coins: 424, zones: [0, 1, 2], pull: 0.86, todBias: ['morning', 'day'], spots: ['hotcove', 'pier', 'open'], baits: ['pearl', 'shine'], bite: 'nibble', shape: 'spirit', weatherBias: ['clear', 'cloudy'] },
  { id: 'cove_spirit', nameRu: 'Дух заводи', nameEn: 'Cove spirit', rarity: 'legend', color: '#7ec8ff', accent: '#e0f4ff', minW: 200, maxW: 400, coins: 385, zones: [0, 1, 2], pull: 0.88, todBias: ['morning', 'night'], spots: ['open', 'deep', 'pond'], baits: ['pearl', 'shine'], bite: 'long', shape: 'spirit', weatherBias: ['cloudy', 'rain'] },
  // —— expanded pool (time / weather / bait / spot niches) ——
  { id: 'stickleback', nameRu: 'Колюшка', nameEn: 'Stickleback', rarity: 'common', color: '#8aa070', accent: '#d8e8c0', minW: 15, maxW: 40, coins: 10, zones: [0], pull: 0.32, todBias: ['day'], spots: ['pier', 'reeds', 'willow'], baits: ['bloodworm', 'bread'], bite: 'nibble', shape: 'spiny', weatherBias: ['clear', 'cloudy'] },
  { id: 'bitterling', nameRu: 'Горчак', nameEn: 'Bitterling', rarity: 'common', color: '#e8a0b0', accent: '#ffe0e8', minW: 25, maxW: 60, coins: 14, zones: [0], pull: 0.36, todBias: ['morning', 'day'], spots: ['lilies', 'pond', 'willow'], baits: ['bloodworm', 'dough'], bite: 'shy', shape: 'slim', weatherBias: ['clear'] },
  { id: 'sunbleak_gold', nameRu: 'Золотая верховка', nameEn: 'Golden sunbleak', rarity: 'common', color: '#e8d060', accent: '#fff8c8', minW: 18, maxW: 48, coins: 18, zones: [0], pull: 0.35, todBias: ['day'], spots: ['reeds', 'lilies', 'pier'], baits: ['bread', 'maggot'], bite: 'nibble', shape: 'slim', weatherBias: ['clear', 'cloudy'] },
  { id: 'carp_kid', nameRu: 'Карпёнок', nameEn: 'Young carp', rarity: 'common', color: '#c89858', accent: '#f0dcb0', minW: 120, maxW: 280, coins: 28, zones: [0, 1], pull: 0.5, todBias: ['day'], spots: ['pond', 'lilies', 'pier'], baits: ['corn', 'bread', 'dough'], bite: 'long', shape: 'carp', weatherBias: ['cloudy'] },
  { id: 'perch_dawn', nameRu: 'Рассветный окунь', nameEn: 'Dawn perch', rarity: 'common', color: '#d07040', accent: '#3a6040', minW: 100, maxW: 240, coins: 32, zones: [0, 1], pull: 0.58, todBias: ['morning'], spots: ['reeds', 'willow', 'pier'], baits: ['worm', 'spinner'], bite: 'aggressive', shape: 'spiny', weatherBias: ['cloudy', 'clear'] },
  { id: 'roach_silver', nameRu: 'Серебряная плотва', nameEn: 'Silver roach', rarity: 'common', color: '#c8b8a0', accent: '#f4ece0', minW: 70, maxW: 160, coins: 24, zones: [0, 1], pull: 0.48, todBias: ['day', 'evening'], spots: ['pier', 'bridge', 'willow'], baits: ['maggot', 'bread', 'dough'], bite: 'shy', shape: 'round', weatherBias: ['cloudy', 'rain'] },
  { id: 'bream_night', nameRu: 'Ночной лещ', nameEn: 'Night bream', rarity: 'common', color: '#a89878', accent: '#e0d4bc', minW: 240, maxW: 520, coins: 49, zones: [1], pull: 0.66, todBias: ['night', 'evening'], spots: ['deep', 'channel', 'dam'], baits: ['worm', 'bloodworm', 'pellet'], bite: 'long', shape: 'flat', weatherBias: ['cloudy', 'rain'] },
  { id: 'gudgeon_sand', nameRu: 'Песчаный пескарь', nameEn: 'Sand gudgeon', rarity: 'common', color: '#c8a878', accent: '#f0e0c0', minW: 45, maxW: 100, coins: 21, zones: [0], pull: 0.4, todBias: ['day'], spots: ['spit', 'pier', 'bridge'], baits: ['worm', 'maggot'], bite: 'shy', shape: 'slim', weatherBias: ['clear'] },
  { id: 'rudd_dusk', nameRu: 'Закатная краснопёрка', nameEn: 'Dusk rudd', rarity: 'common', color: '#e05040', accent: '#ffc0a8', minW: 95, maxW: 210, coins: 28, zones: [0, 1], pull: 0.52, todBias: ['evening'], spots: ['lilies', 'reeds', 'willow'], baits: ['bread', 'corn', 'maggot'], bite: 'nibble', shape: 'round', weatherBias: ['clear', 'cloudy'] },
  { id: 'chub_dusk', nameRu: 'Вечерний голавль', nameEn: 'Dusk chub', rarity: 'rare', color: '#708090', accent: '#c8d0d8', minW: 280, maxW: 680, coins: 88, zones: [1, 2], pull: 0.8, todBias: ['evening'], spots: ['bridge', 'mill', 'spit'], baits: ['shine', 'bread', 'cheese'], bite: 'aggressive', shape: 'thick', weatherBias: ['cloudy'] },
  { id: 'asp_rain', nameRu: 'Дождевой жерех', nameEn: 'Rain asp', rarity: 'rare', color: '#98b0c0', accent: '#dce8f0', minW: 380, maxW: 880, coins: 112, zones: [2], pull: 0.88, todBias: ['day', 'evening'], spots: ['open', 'channel', 'spit'], baits: ['shine', 'spinner', 'frog'], bite: 'aggressive', shape: 'slim', weatherBias: ['rain', 'cloudy'] },
  { id: 'trout_brook', nameRu: 'Ручьевая форель', nameEn: 'Brook trout', rarity: 'rare', color: '#c86858', accent: '#f0c8b8', minW: 200, maxW: 480, coins: 98, zones: [1, 2], pull: 0.78, todBias: ['morning'], spots: ['channel', 'mill', 'open'], baits: ['shine', 'spinner', 'maggot'], bite: 'aggressive', shape: 'spiny', weatherBias: ['cloudy', 'rain'] },
  { id: 'tench_mud', nameRu: 'Иловый линь', nameEn: 'Mud tench', rarity: 'rare', color: '#587848', accent: '#c0d8a8', minW: 300, maxW: 700, coins: 84, zones: [1], pull: 0.7, todBias: ['day', 'evening'], spots: ['pond', 'lilies', 'reeds'], baits: ['worm', 'bloodworm', 'cheese'], bite: 'shy', shape: 'thick', weatherBias: ['rain', 'cloudy'] },
  { id: 'carp_mirror_y', nameRu: 'Молодой зеркальный', nameEn: 'Young mirror', rarity: 'rare', color: '#d0a878', accent: '#f4e4c8', minW: 400, maxW: 900, coins: 102, zones: [1, 2], pull: 0.86, todBias: ['day'], spots: ['pond', 'dam', 'deep'], baits: ['boilie', 'pellet', 'corn'], bite: 'long', shape: 'carp', weatherBias: ['cloudy', 'clear'] },
  { id: 'zander_fog', nameRu: 'Туманный судак', nameEn: 'Fog zander', rarity: 'rare', color: '#688898', accent: '#c0d4e0', minW: 360, maxW: 860, coins: 105, zones: [1, 2], pull: 0.86, todBias: ['morning', 'evening'], spots: ['deep', 'dam', 'snags'], baits: ['minnow', 'spinner'], bite: 'long', shape: 'pike', weatherBias: ['cloudy', 'rain'] },
  { id: 'pike_clear', nameRu: 'Солнечная щука', nameEn: 'Sun pike', rarity: 'rare', color: '#70a870', accent: '#c8e8c0', minW: 320, maxW: 780, coins: 91, zones: [1, 2], pull: 0.84, todBias: ['day'], spots: ['reeds', 'lilies', 'open'], baits: ['spinner', 'frog', 'minnow'], bite: 'aggressive', shape: 'pike', weatherBias: ['clear'] },
  { id: 'barb_stone', nameRu: 'Каменный усач', nameEn: 'Stone barbel', rarity: 'rare', color: '#b09060', accent: '#e8d8b8', minW: 400, maxW: 920, coins: 105, zones: [2], pull: 0.9, todBias: ['day'], spots: ['channel', 'bridge', 'spit'], baits: ['worm', 'maggot', 'cheese'], bite: 'long', shape: 'thick', weatherBias: ['clear', 'cloudy'] },
  { id: 'ide_spring', nameRu: 'Весенний язь', nameEn: 'Spring ide', rarity: 'rare', color: '#e0b858', accent: '#fff0c0', minW: 260, maxW: 640, coins: 80, zones: [1, 2], pull: 0.72, todBias: ['morning'], spots: ['channel', 'bridge', 'willow'], baits: ['worm', 'shine', 'maggot'], bite: 'aggressive', shape: 'thick', weatherBias: ['cloudy', 'rain'] },
  { id: 'cat_rain', nameRu: 'Дождевой сомик', nameEn: 'Rain catfish', rarity: 'epic', color: '#505060', accent: '#b8b8c8', minW: 480, maxW: 1100, coins: 182, zones: [2], pull: 0.94, todBias: ['evening', 'night'], spots: ['deep', 'snags', 'dam'], baits: ['worm', 'minnow', 'cheese'], bite: 'long', shape: 'cat', weatherBias: ['rain'] },
  { id: 'eel_storm', nameRu: 'Грозовой угорь', nameEn: 'Thunder eel', rarity: 'epic', color: '#3a5068', accent: '#a0b8c8', minW: 420, maxW: 1050, coins: 217, zones: [2], pull: 0.96, todBias: ['evening', 'night'], spots: ['deep', 'snags', 'nightjetty'], baits: ['worm', 'minnow'], bite: 'long', shape: 'eel', weatherBias: ['rain', 'cloudy'] },
  { id: 'carp_kinglet', nameRu: 'Княжий карп', nameEn: 'Prince carp', rarity: 'epic', color: '#d8a050', accent: '#ffe8b0', minW: 700, maxW: 1600, coins: 231, zones: [1, 2], pull: 0.94, todBias: ['evening'], spots: ['pond', 'deep', 'hotcove'], baits: ['boilie', 'pellet', 'pearl'], bite: 'long', shape: 'carp', weatherBias: ['cloudy'] },
  { id: 'perch_ice', nameRu: 'Ледяной окунь', nameEn: 'Ice perch', rarity: 'epic', color: '#70a8c8', accent: '#d0e8f8', minW: 160, maxW: 340, coins: 189, zones: [1, 2], pull: 0.84, todBias: ['morning', 'day'], spots: ['open', 'deep', 'channel'], baits: ['spinner', 'shine', 'worm'], bite: 'aggressive', shape: 'spiny', weatherBias: ['clear', 'cloudy'] },
  { id: 'bream_opal', nameRu: 'Опаловый лещ', nameEn: 'Opal bream', rarity: 'epic', color: '#b0a8d0', accent: '#e8e4f8', minW: 380, maxW: 820, coins: 203, zones: [1, 2], pull: 0.84, todBias: ['night'], spots: ['deep', 'open', 'hotcove'], baits: ['pearl', 'bloodworm', 'pellet'], bite: 'shy', shape: 'flat', weatherBias: ['cloudy'] },
  { id: 'asp_comet', nameRu: 'Комета-жерех', nameEn: 'Comet asp', rarity: 'epic', color: '#80b8e0', accent: '#e0f0ff', minW: 480, maxW: 1080, coins: 228, zones: [2], pull: 0.93, todBias: ['morning'], spots: ['open', 'spit', 'channel'], baits: ['shine', 'spinner', 'frog'], bite: 'aggressive', shape: 'slim', weatherBias: ['clear'] },
  { id: 'koi_ember', nameRu: 'Угольный кои', nameEn: 'Ember koi', rarity: 'epic', color: '#e06040', accent: '#ffd0b0', minW: 320, maxW: 720, coins: 206, zones: [1, 2], pull: 0.88, todBias: ['evening'], spots: ['pond', 'lilies', 'hotcove'], baits: ['pearl', 'bread', 'boilie'], bite: 'shy', shape: 'carp', weatherBias: ['clear', 'cloudy'] },
  { id: 'pike_mist', nameRu: 'Туманная щука', nameEn: 'Mist pike', rarity: 'legend', color: '#406858', accent: '#a0d0b8', minW: 850, maxW: 2200, coins: 396, zones: [2], pull: 0.97, todBias: ['morning', 'evening'], spots: ['reeds', 'snags', 'hotcove'], baits: ['minnow', 'frog', 'spinner'], bite: 'aggressive', shape: 'pike', weatherBias: ['cloudy', 'rain'] },
  { id: 'carp_moon', nameRu: 'Лунный карп', nameEn: 'Moon carp', rarity: 'legend', color: '#d8d0e8', accent: '#f8f4ff', minW: 950, maxW: 2400, coins: 413, zones: [2], pull: 0.96, todBias: ['night'], spots: ['pond', 'deep', 'nightjetty'], baits: ['boilie', 'pearl', 'pellet'], bite: 'long', shape: 'carp', weatherBias: ['cloudy', 'clear'] },
  { id: 'sterlet_gold', nameRu: 'Золотая стерлядь', nameEn: 'Golden sterlet', rarity: 'legend', color: '#e0c060', accent: '#fff0c0', minW: 500, maxW: 1100, coins: 385, zones: [2], pull: 0.9, todBias: ['day', 'evening'], spots: ['deep', 'channel', 'dam'], baits: ['worm', 'bloodworm', 'maggot'], bite: 'long', shape: 'thick', weatherBias: ['cloudy'] },
  { id: 'cove_pearl', nameRu: 'Жемчуг заводи', nameEn: 'Cove pearl', rarity: 'legend', color: '#f0e8ff', accent: '#ffffff', minW: 250, maxW: 520, coins: 444, zones: [0, 1, 2], pull: 0.85, todBias: ['morning', 'night'], spots: ['hotcove', 'pond', 'open'], baits: ['pearl'], bite: 'shy', shape: 'spirit', weatherBias: ['rain', 'cloudy'] },
];

export const RODS = [
  { id: 'bamboo', nameRu: 'Бамбуковая удочка', nameEn: 'Bamboo rod', kind: 'float', price: 1940, maxZone: 1, hookWindow: 0.78, line: 0.72, waitMul: 1.02, fightMul: 1.02, unlockRank: 1 },
  { id: 'telescopic', nameRu: 'Телескоп', nameEn: 'Telescopic', kind: 'float', price: 7340, maxZone: 2, hookWindow: 0.94, line: 0.86, waitMul: 0.93, fightMul: 0.93, unlockRank: 10 },
  { id: 'spin_ultra', nameRu: 'Ультралайт', nameEn: 'Ultralight spin', kind: 'spin', price: 6480, maxZone: 1, hookWindow: 0.7, line: 0.8, waitMul: 0.66, fightMul: 1.0, unlockRank: 6 },
  { id: 'feeder_method', nameRu: 'Методная донка', nameEn: 'Method feeder', kind: 'bottom', price: 12100, maxZone: 2, hookWindow: 1.05, line: 0.92, waitMul: 1.65, fightMul: 0.88, unlockRank: 24 },
  { id: 'reed', nameRu: 'Тростинная удочка', nameEn: 'Reed rod', kind: 'float', price: 0, maxZone: 0, hookWindow: 0.75, line: 0.84, waitMul: 1.05, fightMul: 1.08, unlockRank: 1 },
  { id: 'pine', nameRu: 'Сосновая удочка', nameEn: 'Pine rod', kind: 'float', price: 2610, maxZone: 1, hookWindow: 0.82, line: 0.76, waitMul: 1, fightMul: 1, unlockRank: 2 },
  { id: 'cedar', nameRu: 'Кедровая удочка', nameEn: 'Cedar rod', kind: 'float', price: 6030, maxZone: 2, hookWindow: 0.9, line: 0.84, waitMul: 0.95, fightMul: 0.95, unlockRank: 8 },
  { id: 'match', nameRu: 'Матчевая удочка', nameEn: 'Match rod', kind: 'float', price: 9090, maxZone: 2, hookWindow: 0.98, line: 0.88, waitMul: 0.92, fightMul: 0.92, unlockRank: 16 },
  { id: 'carbon', nameRu: 'Карбоновая удочка', nameEn: 'Carbon rod', kind: 'float', price: 12100, maxZone: 2, hookWindow: 1.05, line: 0.92, waitMul: 0.88, fightMul: 0.88, unlockRank: 22 },
  { id: 'spin_light', nameRu: 'Лёгкий спиннинг', nameEn: 'Light spinning', kind: 'spin', price: 4320, maxZone: 1, hookWindow: 0.68, line: 0.78, waitMul: 0.7, fightMul: 0.98, unlockRank: 4 },
  { id: 'spin_mid', nameRu: 'Средний спиннинг', nameEn: 'Medium spinning', kind: 'spin', price: 8190, maxZone: 2, hookWindow: 0.72, line: 0.84, waitMul: 0.62, fightMul: 0.94, unlockRank: 14 },
  { id: 'spin_heavy', nameRu: 'Тяжёлый спиннинг', nameEn: 'Heavy spinning', kind: 'spin', price: 13820, maxZone: 2, hookWindow: 0.78, line: 0.92, waitMul: 0.58, fightMul: 0.9, unlockRank: 28 },
  { id: 'feeder_light', nameRu: 'Лёгкая донка', nameEn: 'Light feeder', kind: 'bottom', price: 5180, maxZone: 1, hookWindow: 0.92, line: 0.82, waitMul: 1.55, fightMul: 0.96, unlockRank: 5 },
  { id: 'feeder_carp', nameRu: 'Карповая донка', nameEn: 'Carp feeder', kind: 'bottom', price: 10350, maxZone: 2, hookWindow: 1.0, line: 0.9, waitMul: 1.7, fightMul: 0.9, unlockRank: 18 },
  { id: 'fly_light', nameRu: 'Нахлыст лёгкий', nameEn: 'Light fly rod', kind: 'float', price: 8420, maxZone: 1, hookWindow: 1.08, line: 0.8, waitMul: 0.9, fightMul: 0.96, unlockRank: 12 },
  { id: 'carbon_pro', nameRu: 'Карбон Pro', nameEn: 'Carbon Pro', kind: 'float', price: 20700, maxZone: 2, hookWindow: 1.12, line: 0.96, waitMul: 0.84, fightMul: 0.84, unlockRank: 32 },
  { id: 'spin_legend', nameRu: 'Легенда спиннинга', nameEn: 'Legend spin', kind: 'spin', price: 24300, maxZone: 2, hookWindow: 0.82, line: 0.98, waitMul: 0.52, fightMul: 0.82, unlockRank: 40 },
  { id: 'feeder_pro', nameRu: 'Донка мастера', nameEn: 'Master feeder', kind: 'bottom', price: 22050, maxZone: 2, hookWindow: 1.1, line: 0.97, waitMul: 1.75, fightMul: 0.82, unlockRank: 36 },
  { id: 'night_match', nameRu: 'Ночной матч', nameEn: 'Night match', kind: 'float', price: 25650, maxZone: 2, hookWindow: 1.15, line: 0.97, waitMul: 0.86, fightMul: 0.8, unlockRank: 42 },
  { id: 'boat_troll', nameRu: 'Троллинговая', nameEn: 'Trolling rod', kind: 'spin', price: 15570, maxZone: 2, hookWindow: 0.74, line: 0.96, waitMul: 0.55, fightMul: 0.86, unlockRank: 35 },
];

export const BAITS = [
  { id: 'dough', nameRu: 'Тесто', nameEn: 'Dough', price: 580, packSize: 20, biteMul: 1.05, rareMul: 1.05, forKind: 'float' },
  { id: 'maggot', nameRu: 'Опарыш', nameEn: 'Maggot', price: 1170, packSize: 15, biteMul: 1.12, rareMul: 1.14, forKind: 'float' },
  { id: 'cheese', nameRu: 'Сыр', nameEn: 'Cheese', price: 1400, packSize: 15, biteMul: 1.1, rareMul: 1.2, forKind: 'bottom' },
  { id: 'frog', nameRu: 'Лягушонок', nameEn: 'Frog lure', price: 4100, packSize: 10, biteMul: 1.06, rareMul: 1.55, forKind: 'spin' , unlockRank: 16 },
  { id: 'boilie', nameRu: 'Бойл', nameEn: 'Boilie', price: 3020, packSize: 10, biteMul: 1.14, rareMul: 1.4, forKind: 'bottom' , unlockRank: 12 },
  { id: 'bread', nameRu: 'Хлебный шарик', nameEn: 'Bread ball', price: 0, biteMul: 1, rareMul: 1, forKind: 'float' },
  { id: 'worm', nameRu: 'Червяк', nameEn: 'Worm', price: 860, packSize: 20, biteMul: 1.1, rareMul: 1.12, forKind: 'any' },
  { id: 'bloodworm', nameRu: 'Мотыль', nameEn: 'Bloodworm', price: 1530, packSize: 15, biteMul: 1.15, rareMul: 1.18, forKind: 'float' },
  { id: 'shine', nameRu: 'Блесна рассвета', nameEn: 'Dawn spoon', price: 2160, packSize: 10, biteMul: 1.05, rareMul: 1.35, forKind: 'spin' },
  { id: 'spinner', nameRu: 'Вертушка', nameEn: 'Spinner', price: 2790, packSize: 10, biteMul: 1.08, rareMul: 1.4, forKind: 'spin' , unlockRank: 10 },
  { id: 'minnow', nameRu: 'Воблер', nameEn: 'Minnow lure', price: 3460, packSize: 10, biteMul: 1.05, rareMul: 1.5, forKind: 'spin' , unlockRank: 14 },
  { id: 'pearl', nameRu: 'Жемчужная наживка', nameEn: 'Pearl bait', price: 3870, packSize: 10, biteMul: 1.05, rareMul: 1.65, forKind: 'float' , unlockRank: 20 },
  { id: 'corn', nameRu: 'Кукуруза', nameEn: 'Corn', price: 1080, packSize: 15, biteMul: 1.08, rareMul: 1.1, forKind: 'bottom' },
  { id: 'squid', nameRu: 'Кальмар', nameEn: 'Squid strip', price: 5580, packSize: 8, biteMul: 1.08, rareMul: 1.7, forKind: 'spin', unlockRank: 30 },
  { id: 'livebait', nameRu: 'Живец', nameEn: 'Live bait', price: 6440, packSize: 6, biteMul: 1.1, rareMul: 1.85, forKind: 'spin', unlockRank: 38 },
  { id: 'nightcrawler', nameRu: 'Ночной червь', nameEn: 'Nightcrawler', price: 3780, packSize: 12, biteMul: 1.18, rareMul: 1.45, forKind: 'any', unlockRank: 25 },
  { id: 'halo', nameRu: 'Ореол', nameEn: 'Halo bait', price: 7200, packSize: 6, biteMul: 1.12, rareMul: 1.95, forKind: 'float', unlockRank: 42 },
  { id: 'pellet', nameRu: 'Пеллетс', nameEn: 'Pellets', price: 2070, packSize: 10, biteMul: 1.12, rareMul: 1.25, forKind: 'bottom' },
];

export const HOOKS = [
  { id: 'hook_circle', nameRu: 'Крючок-круг', nameEn: 'Circle hook', price: 3240, hookMul: 1.15, sizeMul: 1.05 },
  { id: 'hook_barbless', nameRu: 'Безбородый', nameEn: 'Barbless', price: 2160, hookMul: 1.05, sizeMul: 1.02 },
  { id: 'hook_s', nameRu: 'Крючок №10', nameEn: 'Hook #10', price: 0, hookMul: 1, sizeMul: 0.95 },
  { id: 'hook_m', nameRu: 'Крючок №6', nameEn: 'Hook #6', price: 1300, hookMul: 1.08, sizeMul: 1 },
  { id: 'hook_l', nameRu: 'Крючок №2', nameEn: 'Hook #2', price: 2610, hookMul: 1.12, sizeMul: 1.08 },
  { id: 'hook_xl', nameRu: 'Трофейный крючок', nameEn: 'Trophy hook', price: 4770, hookMul: 1.18, sizeMul: 1.15, unlockRank: 18 },
  { id: 'hook_pro', nameRu: 'Крючок мастера', nameEn: 'Master hook', price: 8100, hookMul: 1.24, sizeMul: 1.2, unlockRank: 32 },
  { id: 'hook_night', nameRu: 'Ночной крючок', nameEn: 'Night hook', price: 9450, hookMul: 1.22, sizeMul: 1.18, unlockRank: 40 },
];

export const LINES = [
  { id: 'line_fluoro', nameRu: 'Флюорокарбон', nameEn: 'Fluoro', price: 4320, strength: 0.9, wearPerFight: 0.024 },
  { id: 'line_thin', nameRu: 'Леска 0.16', nameEn: 'Line 0.16', price: 0, strength: 0.8, wearPerFight: 0.04 },
  { id: 'line_mid', nameRu: 'Леска 0.22', nameEn: 'Line 0.22', price: 1940, strength: 0.86, wearPerFight: 0.032 },
  { id: 'line_thick', nameRu: 'Леска 0.28', nameEn: 'Line 0.28', price: 3460, strength: 0.92, wearPerFight: 0.024 },
  { id: 'line_braid', nameRu: 'Шнур', nameEn: 'Braid', price: 6030, strength: 0.96, wearPerFight: 0.018, unlockRank: 20 },
  { id: 'line_pro', nameRu: 'Шнур Pro', nameEn: 'Braid Pro', price: 10800, strength: 0.98, wearPerFight: 0.014, unlockRank: 34 },
  { id: 'line_night', nameRu: 'Ночная леска', nameEn: 'Night line', price: 11700, strength: 0.97, wearPerFight: 0.015, unlockRank: 40 },
];

export const GROUNDBAITS = [
  { id: 'chum_mix', nameRu: 'Каша-прикормка', nameEn: 'Chum mix', price: 760, casts: 3, waitMul: 0.82, rareMul: 1.08 },
  { id: 'chum_sweet', nameRu: 'Сладкая прикормка', nameEn: 'Sweet chum', price: 1170, casts: 3, waitMul: 0.78, rareMul: 1.12 },
  { id: 'chum_garlic', nameRu: 'Чесночная', nameEn: 'Garlic chum', price: 990, casts: 3, waitMul: 0.8, rareMul: 1.1 },
  { id: 'chum_spicy', nameRu: 'Острая', nameEn: 'Spicy chum', price: 1710, casts: 2, waitMul: 0.76, rareMul: 1.22 },
  { id: 'chum_fish', nameRu: 'Рыбная прикормка', nameEn: 'Fishmeal chum', price: 1530, casts: 2, waitMul: 0.85, rareMul: 1.2 },
  { id: 'chum_honey', nameRu: 'Медовая', nameEn: 'Honey chum', price: 1300, casts: 3, waitMul: 0.77, rareMul: 1.15 },
  { id: 'chum_hemp', nameRu: 'Конопляная', nameEn: 'Hemp chum', price: 1620, casts: 3, waitMul: 0.8, rareMul: 1.18 },
  { id: 'chum_anise', nameRu: 'Анисовая', nameEn: 'Anise chum', price: 1400, casts: 3, waitMul: 0.79, rareMul: 1.14 },
  { id: 'chum_blood', nameRu: 'Кровяная', nameEn: 'Bloodmeal chum', price: 2070, casts: 2, waitMul: 0.74, rareMul: 1.28 },
  { id: 'chum_carp', nameRu: 'Карповая смесь', nameEn: 'Carp mix', price: 2380, casts: 2, waitMul: 0.86, rareMul: 1.32 },
  { id: 'chum_predator', nameRu: 'Хищная', nameEn: 'Predator chum', price: 2610, casts: 2, waitMul: 0.88, rareMul: 1.35 },
  { id: 'chum_night', nameRu: 'Ночная', nameEn: 'Night chum', price: 1940, casts: 2, waitMul: 0.81, rareMul: 1.26 },
  { id: 'chum_vanilla', nameRu: 'Ванильная', nameEn: 'Vanilla chum', price: 1080, casts: 3, waitMul: 0.8, rareMul: 1.1 },
  { id: 'chum_cocoa', nameRu: 'Какао-микс', nameEn: 'Cocoa mix', price: 1530, casts: 3, waitMul: 0.78, rareMul: 1.16 },
];

export const WEATHERS = [
  { id: 'clear', nameRu: 'Ясно', nameEn: 'Clear', activity: { morning: 0.85, day: 0.7, evening: 0.9, night: 0.55 } },
  { id: 'cloudy', nameRu: 'Облачно', nameEn: 'Cloudy', activity: { morning: 1, day: 0.95, evening: 1.05, night: 0.75 } },
  { id: 'rain', nameRu: 'Дождь', nameEn: 'Rain', activity: { morning: 1.1, day: 1.15, evening: 1.2, night: 0.9 } },
];

export const BOBBERS = [
  { id: 'neon', nameRu: 'Неоновый', nameEn: 'Neon', price: 2160, color: '#40e0c0' },
  { id: 'nightglow', nameRu: 'Ночной', nameEn: 'Nightglow', price: 3020, color: '#f0e060' },
  { id: 'classic', nameRu: 'Классический', nameEn: 'Classic', price: 0, color: '#e85d4c' },
  { id: 'amber', nameRu: 'Янтарный', nameEn: 'Amber', price: 1710, color: '#e0a040' },
  { id: 'mint', nameRu: 'Мятный', nameEn: 'Mint', price: 1710, color: '#4ec9a0' },
  { id: 'violet', nameRu: 'Фиалковый', nameEn: 'Violet', price: 2610, color: '#9b6fd6' },
];

/** Landing nets: scoop finishes the fight when progress reaches (1 - help). */
export const NETS = [
  { id: 'net_t1', nameRu: 'Сачок ученика', nameEn: 'Trainee net', price: 2610, help: 0.05, tier: 1 },
  { id: 'net_t2', nameRu: 'Сачок береговой', nameEn: 'Shore net', price: 5620, help: 0.1, tier: 2 },
  { id: 'net_t3', nameRu: 'Сачок мастера', nameEn: 'Master net', price: 10350, help: 0.15, tier: 3 },
  { id: 'net_t4', nameRu: 'Сачок трофейный', nameEn: 'Trophy net', price: 16830, help: 0.2, tier: 4, unlockRank: 28 },
  { id: 'net_t5', nameRu: 'Сачок ночной', nameEn: 'Night net', price: 25200, help: 0.24, tier: 5, unlockRank: 42 },
];

export const SPOTS = [
  { id: 'pier', nameRu: 'Пирс', nameEn: 'Pier', unlockRank: 1, zoneBonus: 0, rareMul: 1, waitMul: 1, descRu: 'Спокойная заводь у досок', descEn: 'Calm water by the boards' },
  { id: 'reeds', nameRu: 'Камыши', nameEn: 'Reeds', unlockRank: 4, zoneBonus: 0, rareMul: 1.12, waitMul: 1.1, descRu: 'Укрытия для хищника', descEn: 'Cover for predators' },
  { id: 'willow', nameRu: 'Ива', nameEn: 'Willow', unlockRank: 5, zoneBonus: 0, rareMul: 1.14, waitMul: 1.08, descRu: 'Тень ветвей у берега', descEn: 'Shade under the bank' },
  { id: 'lilies', nameRu: 'Кувшинки', nameEn: 'Lilies', unlockRank: 8, zoneBonus: 1, rareMul: 1.2, waitMul: 1.15, descRu: 'Тихие окна среди листьев', descEn: 'Quiet windows among leaves' },
  { id: 'bridge', nameRu: 'Мост', nameEn: 'Bridge', unlockRank: 10, zoneBonus: 1, rareMul: 1.18, waitMul: 1.05, descRu: 'Тень и течение', descEn: 'Shade and current' },
  { id: 'mill', nameRu: 'Мельница', nameEn: 'Mill', unlockRank: 12, zoneBonus: 1, rareMul: 1.22, waitMul: 1.12, descRu: 'Омут у старого колеса', descEn: 'Pool by the old wheel' },
  { id: 'snags', nameRu: 'Коряжник', nameEn: 'Snags', unlockRank: 16, zoneBonus: 1, rareMul: 1.28, waitMul: 1.2, descRu: 'Опасные зацепы, крупная рыба', descEn: 'Snaggy, bigger fish' },
  { id: 'pond', nameRu: 'Тихий пруд', nameEn: 'Quiet pond', unlockRank: 18, zoneBonus: 0, rareMul: 1.22, waitMul: 1.25, descRu: 'Карповые и миражи', descEn: 'Carp and quiet miracles' },
  { id: 'spit', nameRu: 'Коса', nameEn: 'Spit', unlockRank: 20, zoneBonus: 1, rareMul: 1.26, waitMul: 1.05, descRu: 'Песчаный язык в протоку', descEn: 'Sand tongue into the channel' },
  { id: 'channel', nameRu: 'Протока', nameEn: 'Channel', unlockRank: 25, zoneBonus: 2, rareMul: 1.3, waitMul: 0.95, descRu: 'Быстрая вода', descEn: 'Faster water' },
  { id: 'deep', nameRu: 'Омут', nameEn: 'Deep hole', unlockRank: 28, zoneBonus: 2, rareMul: 1.4, waitMul: 1.35, descRu: 'Глубина и терпение', descEn: 'Depth and patience' },
  { id: 'dam', nameRu: 'Плотина', nameEn: 'Dam', unlockRank: 32, zoneBonus: 2, rareMul: 1.38, waitMul: 1.2, descRu: 'Глубокая стена и хищник', descEn: 'Deep wall and predators' },
  { id: 'open', nameRu: 'Открытая гладь', nameEn: 'Open water', unlockRank: 38, zoneBonus: 2, rareMul: 1.35, waitMul: 1.1, descRu: 'Простор для спиннинга', descEn: 'Space for spinning' },
  { id: 'nightjetty', nameRu: 'Ночной причал', nameEn: 'Night jetty', unlockRank: 45, zoneBonus: 2, rareMul: 1.42, waitMul: 1.3, descRu: 'Тишина и крупные тени', descEn: 'Quiet and big shadows' },
  { id: 'hotcove', nameRu: 'Клёвая заводь', nameEn: 'Hot Cove', unlockRank: 1, zoneBonus: 2, rareMul: 1.55, waitMul: 0.82, unlockAds: 5, descRu: 'За 5 реклам — навсегда. Сильный клёв.', descEn: 'Unlock with 5 ads — forever. Strong bite.' },
];

export const BACKGROUNDS = [
  { id: 'dawn', price: 0 },
  { id: 'mist', price: 3870 },
  { id: 'sunset', price: 5180 },
];

export const AQUARIUM_SLOTS = 20;
export const TROPHY_SLOTS = 20;
export const MAX_ANGLER_RANK = 50;
export const FREE_BAIT_IDS = ['bread'];
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

export function getNet(id) {
  return NETS.find((n) => n.id === id) || null;
}

/** Progress needed before scoop is allowed (e.g. help 0.15 → 0.85). */
export function netScoopThreshold(net) {
  const help = Math.max(0, Math.min(0.35, net?.help || 0));
  return Math.max(0.65, 1 - help);
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

export function rollWeight(fish, sizeMul = 1, opts = {}) {
  const rank = Math.max(1, opts.rank || 1);
  const unlock = fishUnlockRank(fish);
  let t = Math.random();
  // Early ranks: smaller specimens; later: chance of bigger fish
  if (rank <= unlock) t *= t;
  else if (rank >= unlock + 3) t = Math.sqrt(t);
  const lo = fish.minW;
  const hi = fish.maxW * Math.max(0.9, sizeMul);
  return Math.round(lo + t * (hi - lo));
}

/** Typical / “average” specimen for this species */
export function avgWeight(fish) {
  if (!fish) return 0;
  if (fish.avgW) return fish.avgW;
  return Math.round(fish.minW * 0.35 + fish.maxW * 0.65);
}

/** Soft world-record ceiling (game lore, slightly above max roll) */
export function worldRecordWeight(fish) {
  if (!fish) return 0;
  if (fish.worldW) return fish.worldW;
  return Math.round(fish.maxW * 1.12);
}

/**
 * Size class vs species range (RF4-style «трофейная» → у нас «рекордная»).
 * @returns {'tiny'|'normal'|'large'|'prize'}
 */
export function catchClass(fish, weight) {
  const avg = avgWeight(fish);
  const t = (weight - fish.minW) / Math.max(1, fish.maxW - fish.minW);
  if (weight >= fish.maxW * 0.92 || t >= 0.9 || weight >= avg * 1.55) return 'prize';
  if (t >= 0.62 || weight >= avg * 1.22) return 'large';
  if (t <= 0.28 || weight < avg * 0.72) return 'tiny';
  return 'normal';
}

/** How this catch compares to average (−1 below, 0 near, 1 above, 2 prize) */
export function weightVsAvg(fish, weight) {
  const avg = avgWeight(fish);
  const ratio = weight / Math.max(1, avg);
  if (ratio >= 1.5) return 2;
  if (ratio >= 1.12) return 1;
  if (ratio <= 0.78) return -1;
  return 0;
}

export function biteActivity(weatherId, tod) {
  const w = getWeather(weatherId);
  return w.activity[tod] ?? 0.8;
}

export function fishHintLine(fish, lang = 'ru') {
  const spots = (fish.spots || []).slice(0, 3).map((id) => {
    const s = getSpot(id);
    return lang === 'en' ? s.nameEn : s.nameRu;
  });
  const baits = (fish.baits || []).slice(0, 3).map((id) => {
    const b = getBait(id);
    return b ? (lang === 'en' ? b.nameEn : b.nameRu) : id;
  });
  const tod = (fish.todBias || []).map((x) => x);
  const weather = (fish.weatherBias || []).map((id) => {
    const w = getWeather(id);
    return w ? (lang === 'en' ? w.nameEn : w.nameRu) : id;
  });
  return { spots, baits, tod, weather };
}

/** Species that prefer this spot (for spots screen) */
export function fishAtSpot(spotId) {
  return FISH.filter((f) => !f.spots?.length || f.spots.includes(spotId));
}

export function zoneLabel(zone, lang = 'ru') {
  if (lang === 'en') {
    if (zone <= 0) return 'Near shore';
    if (zone === 1) return 'Mid water';
    return 'Far / deep';
  }
  if (zone <= 0) return 'У берега';
  if (zone === 1) return 'Средняя даль';
  return 'Даль / глубина';
}

export function sellValue(fish, weight) {
  const mid = (fish.minW + fish.maxW) / 2;
  const factor = 0.72 + (weight / mid) * 0.48;
  // rarity: common / rare / epic / legend
  const rarityMul =
    fish.rarity === 'legend' ? 1.65 :
    fish.rarity === 'epic' ? 1.4 :
    fish.rarity === 'rare' ? 1.22 : 1;
  // size class: tiny / normal / large / prize (рекордная)
  const cls = catchClass(fish, weight);
  const classMul =
    cls === 'prize' || cls === 'trophy' ? 1.55 :
    cls === 'large' ? 1.28 :
    cls === 'tiny' ? 0.78 : 1;
  return Math.max(1, Math.round(fish.coins * factor * rarityMul * classMul));
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
    rank = 1,
  } = opts;
  const maxZone = rod.maxZone;
  const z = Math.min(Math.max(0, zone), maxZone);
  const activity = biteActivity(weatherId, tod);
  const playerRank = Math.max(1, rank);

  let pool = FISH.filter((f) => f.zones.includes(z) && fishUnlockRank(f) <= playerRank);
  if (!pool.length) {
    pool = FISH.filter((f) => f.zones.includes(z) && fishUnlockRank(f) <= playerRank + 1);
  }
  if (!pool.length) pool = FISH.filter((f) => f.zones.includes(0) && fishUnlockRank(f) <= Math.max(1, playerRank));

  const preferred = pool.filter((f) => {
    const spotOk = !f.spots?.length || f.spots.includes(spotId);
    const todOk = !f.todBias?.length || f.todBias.includes(tod);
    const baitOk = !f.baits?.length || f.baits.includes(bait.id);
    const weatherOk = !f.weatherBias?.length || f.weatherBias.includes(weatherId);
    const spinOk = rod.kind !== 'spin' || f.baits?.some((b) => ['shine', 'spinner', 'minnow', 'frog'].includes(b)) || f.bite === 'aggressive';
    const bottomOk = rod.kind !== 'bottom' || f.bite === 'long' || f.bite === 'shy' || f.baits?.some((b) => ['worm', 'bread', 'pearl', 'corn', 'pellet', 'bloodworm', 'cheese', 'boilie', 'dough', 'maggot'].includes(b));
    // Prefer matching niches; soft fallbacks so pools don't empty
    const nicheScore = (spotOk ? 1 : 0) + (todOk ? 1 : 0) + (baitOk ? 1 : 0) + (weatherOk ? 1 : 0);
    if (nicheScore < 2 && Math.random() > 0.12) return false;
    if (rod.kind === 'spin') return (baitOk || Math.random() < 0.18) && spinOk && (spotOk || Math.random() < 0.2);
    if (rod.kind === 'bottom') return (baitOk || Math.random() < 0.22) && bottomOk && (spotOk || Math.random() < 0.2);
    return (baitOk || Math.random() < 0.18) && (spotOk || Math.random() < 0.25) && (todOk || Math.random() < 0.2);
  });
  if (preferred.length) pool = preferred;
  if (!pool.length) {
    pool = FISH.filter((f) => f.zones.includes(0) && fishUnlockRank(f) <= playerRank);
  }
  if (!pool.length) pool = FISH.filter((f) => fishUnlockRank(f) === 1);

  const weights = pool.map((f) => {
    let w = f.rarity === 'common' ? 10 : f.rarity === 'rare' ? 3.2 : f.rarity === 'epic' ? 1 : 0.32;
    const ur = fishUnlockRank(f);
    // Prefer fish near current rank (progression curve)
    if (ur === playerRank) w *= 1.35;
    else if (ur < playerRank - 1) w *= 0.7;
    if (f.rarity !== 'common') w *= bait.rareMul * spotRareMul * chumRareMul;
    if (f.todBias?.includes(tod)) w *= 2.2;
    else if (f.todBias?.length) w *= 0.45;
    if (f.spots?.includes(spotId)) w *= 2.0;
    else if (f.spots?.length) w *= 0.4;
    if (f.baits?.includes(bait.id)) w *= 2.6;
    else if (f.baits?.length) w *= 0.35;
    if (f.weatherBias?.includes(weatherId)) w *= 1.85;
    else if (f.weatherBias?.length) w *= 0.5;
    if (hotspot && f.rarity !== 'common') w *= 1.3;
    if (lucky && (f.rarity === 'epic' || f.rarity === 'legend')) w *= 1.7;
    if (rod.kind === 'spin' && f.bite === 'aggressive') w *= 1.45;
    if (rod.kind === 'float' && (f.bite === 'shy' || f.bite === 'long' || f.bite === 'nibble')) w *= 1.25;
    if (rod.kind === 'bottom' && (f.bite === 'long' || f.shape === 'carp' || f.shape === 'round' || f.shape === 'flat')) w *= 1.5;
    if (weatherId === 'rain' && (f.bite === 'aggressive' || f.shape === 'cat' || f.shape === 'eel' || f.todBias?.includes('evening'))) w *= 1.25;
    if (weatherId === 'clear' && tod === 'day' && f.bite === 'shy') w *= 0.85;
    if (weatherId === 'cloudy' && (f.bite === 'long' || f.shape === 'carp')) w *= 1.15;
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

/** Fight pull scaled by size + gear so early fish rarely snap starter line */
export function fightPull(fish, weight, lineLimit) {
  const sizeT = Math.max(0, Math.min(1, (weight - fish.minW) / Math.max(1, fish.maxW - fish.minW)));
  let pull = (fish.pull || 0.4) * (0.52 + 0.38 * sizeT);
  if (fish.rarity === 'rare') pull *= 1.05;
  else if (fish.rarity === 'epic') pull *= 1.12;
  else if (fish.rarity === 'legend') pull *= 1.18;
  const gear = Math.max(0.55, lineLimit || 0.75);
  // Soft cap: fish rarely demand more than ~82% of line until late rarity
  const softCap = gear * (fish.rarity === 'common' ? 0.72 : fish.rarity === 'rare' ? 0.82 : 0.9);
  pull = Math.min(pull, softCap);
  return Math.max(0.2, Math.min(0.88, pull));
}

/** Base wait seconds before real bite — wide patience window */
export function biteWaitRange(bite, rod, spot, bait, extras = {}) {
  // Every valid cast eventually gets a bite; conditions nudge patience inside 5–300s.
  const ranges = {
    nibble: [18, 140],
    shy: [28, 190],
    aggressive: [8, 90],
    long: [40, 240],
  };
  const [a, b] = ranges[bite] || ranges.nibble;
  const weatherMul = 1 / Math.max(0.55, extras.activity || 1);
  const chumMul = extras.chumWaitMul || 1;
  const mul = (rod.waitMul || 1) * (spot.waitMul || 1) * weatherMul * chumMul / Math.max(0.75, bait.biteMul || 1);
  let min = Math.max(5, Math.min(220, a * mul));
  let max = Math.max(min + 8, Math.min(300, b * mul));
  // Extra jitter so each cast feels less predictable within the hard bounds
  const span = max - min;
  const skew = (Math.random() - 0.35) * span * 0.35;
  min = Math.max(5, Math.min(280, min + skew * 0.35));
  max = Math.max(min + 5, Math.min(300, max + skew));
  return { min, max };
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
  const base = Math.min(rod.line || 0.85, lineItem.strength || 0.7) + 0.1;
  return Math.max(0.68, base - wear * 0.18);
}

/** Progression unlock: when this species can appear (1 = starter pier) */
export function fishUnlockRank(fish) {
  if (fish?.unlockRank != null) return fish.unlockRank;
  if (fish?.rarity === 'legend') return 40;
  if (fish?.rarity === 'epic') return 28;
  if (fish?.rarity === 'rare') {
    const mz = Math.max(0, ...(fish.zones || [0]));
    return mz >= 2 ? 18 : 12;
  }
  const mz = Math.max(0, ...(fish.zones || [0]));
  const maxW = fish?.maxW || 100;
  const pull = fish?.pull || 0.4;
  if (mz >= 1 && (maxW >= 400 || pull >= 0.62)) return 8;
  if (mz >= 1 || maxW >= 160 || pull >= 0.48) return 4;
  return 1;
}

/** Apply soft pull caps so early commons fit starter gear + infer weather niches */
(function balanceFishProgression() {
  for (const f of FISH) {
    // Compute from base stats before caps (50-rank progression)
    const ur = (() => {
      if (f.rarity === 'legend') return 40;
      if (f.rarity === 'epic') return 28;
      if (f.rarity === 'rare') {
        const mz = Math.max(0, ...(f.zones || [0]));
        return mz >= 2 ? 18 : 12;
      }
      const mz = Math.max(0, ...(f.zones || [0]));
      const maxW = f.maxW || 100;
      const pull = f.pull || 0.4;
      if (mz >= 1 && (maxW >= 400 || pull >= 0.62)) return 8;
      if (mz >= 1 || maxW >= 160 || pull >= 0.48) return 4;
      return 1;
    })();
    f.unlockRank = ur;
    if (!f.avgW) f.avgW = Math.round(f.minW * 0.35 + f.maxW * 0.65);
    if (!f.worldW) f.worldW = Math.round(f.maxW * 1.12);
    if (!f.weatherBias?.length) {
      if (f.shape === 'eel' || f.shape === 'cat' || f.todBias?.includes('night')) f.weatherBias = ['rain', 'cloudy'];
      else if (f.bite === 'aggressive' || f.shape === 'pike' || f.shape === 'spiny') f.weatherBias = ['cloudy', 'rain'];
      else if (f.shape === 'carp' || f.bite === 'long') f.weatherBias = ['cloudy', 'clear'];
      else if (f.bite === 'shy') f.weatherBias = ['cloudy', 'clear'];
      else f.weatherBias = ['clear', 'cloudy'];
    }
    if (f.rarity === 'common') {
      if (ur <= 1) f.pull = Math.min(f.pull, 0.34);
      else if (ur <= 4) f.pull = Math.min(f.pull, 0.46);
      else f.pull = Math.min(f.pull, 0.56);
    } else if (f.rarity === 'rare') {
      f.pull = Math.min(f.pull, ur >= 18 ? 0.76 : 0.68);
    } else if (f.rarity === 'epic') {
      f.pull = Math.min(f.pull, 0.82);
    } else {
      f.pull = Math.min(f.pull, 0.9);
    }
  }
})();
