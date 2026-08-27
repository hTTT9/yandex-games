import { anglerRank } from '../save.js';

/** Story quests — first days at the cove (harder progression) */

export const QUEST_CHAIN = [
  {
    id: 'q1_cast',
    nameRu: 'Первый заброс',
    nameEn: 'First cast',
    descRu: 'Сделайте любой заброс на пирсе',
    descEn: 'Make any cast at the pier',
    reward: 44,
    check: (s) => (s.castsTotal || 0) >= 1,
  },
  {
    id: 'q2_catch',
    nameRu: 'Первая рыба',
    nameEn: 'First fish',
    descRu: 'Поймайте любую рыбу',
    descEn: 'Catch any fish',
    reward: 66,
    check: (s) => (s.totalCaught || 0) >= 1,
  },
  {
    id: 'q3_chum',
    nameRu: 'Прикормите точку',
    nameEn: 'Chum the spot',
    descRu: 'Используйте прикормку у горячей точки',
    descEn: 'Use groundbait on a hotspot',
    reward: 77,
    check: (s) => !!(s.flags?.usedChum),
  },
  {
    id: 'q4_journal',
    nameRu: 'Пять видов',
    nameEn: 'Five species',
    descRu: 'Откройте 5 видов в журнале',
    descEn: 'Discover 5 species in the journal',
    reward: 121,
    check: (s) => Object.keys(s.journal || {}).length >= 5,
  },
  {
    id: 'q5_spot',
    nameRu: 'Новое место',
    nameEn: 'New spot',
    descRu: 'Поймайте рыбу не на пирсе',
    descEn: 'Catch a fish away from the pier',
    reward: 132,
    check: (s) => !!(s.flags?.caughtOffPier),
  },
  {
    id: 'q6_rare',
    nameRu: 'Редкий улов',
    nameEn: 'Rare catch',
    descRu: 'Поймайте рыбу редкости «редкая» или выше',
    descEn: 'Catch a rare (or better) fish',
    reward: 165,
    check: (s) => !!(s.flags?.caughtRarePlus),
  },
  {
    id: 'q7_large',
    nameRu: 'Крупный экземпляр',
    nameEn: 'Large specimen',
    descRu: 'Поймайте крупную рыбу (класс «Крупная»)',
    descEn: 'Land a Large-class catch',
    reward: 176,
    check: (s) => !!(s.flags?.caughtLarge),
  },
  {
    id: 'q8_trophy_wall',
    nameRu: 'На стену',
    nameEn: 'On the wall',
    descRu: 'Повесьте трофей на стену',
    descEn: 'Hang a trophy on the wall',
    reward: 154,
    check: (s) => (s.trophyWall || []).some((slot) => !!slot),
  },
  {
    id: 'q9_spin_or_bottom',
    nameRu: 'Другой стиль',
    nameEn: 'Another style',
    descRu: 'Поймайте на спиннинг или донку',
    descEn: 'Catch on spinning or feeder',
    reward: 187,
    check: (s) => !!(s.flags?.caughtAltStyle),
  },
  {
    id: 'q10_night',
    nameRu: 'Ночная рыбалка',
    nameEn: 'Night fishing',
    descRu: 'Поймайте рыбу ночью',
    descEn: 'Catch a fish at night',
    reward: 198,
    check: (s) => !!(s.flags?.caughtNight),
  },
  {
    id: 'q11_rank8',
    nameRu: 'Расти ранг',
    nameEn: 'Climb ranks',
    descRu: 'Достигните 8 ранга рыболова',
    descEn: 'Reach angler rank 8',
    reward: 308,
    check: (s) => anglerRank(s.xp) >= 8,
  },
  {
    id: 'q12_collect12',
    nameRu: 'Дюжина видов',
    nameEn: 'Dozen species',
    descRu: 'Откройте 12 видов в журнале',
    descEn: 'Discover 12 species in the journal',
    reward: 264,
    check: (s) => Object.keys(s.journal || {}).length >= 12,
  },
  {
    id: 'q13_record',
    nameRu: 'Рекордный улов',
    nameEn: 'Record catch',
    descRu: 'Поймайте рекордный экземпляр',
    descEn: 'Catch a record-size fish',
    reward: 308,
    check: (s) => (s.records || []).some((r) => r.catchClass === 'prize' || r.catchClass === 'trophy'),
  },
  {
    id: 'q14_epic',
    nameRu: 'Эпический улов',
    nameEn: 'Epic catch',
    descRu: 'Поймайте эпическую или легендарную рыбу',
    descEn: 'Catch an epic or legendary fish',
    reward: 352,
    check: (s) => !!(s.flags?.caughtEpicPlus),
  },
  {
    id: 'q15_aquarium3',
    nameRu: 'Три в аквариуме',
    nameEn: 'Three in the tank',
    descRu: 'Держите 3 рыбы в аквариуме сразу',
    descEn: 'Keep 3 fish in the aquarium at once',
    reward: 220,
    check: (s) => (s.aquarium || []).filter(Boolean).length >= 3,
  },
  {
    id: 'q16_combo5',
    nameRu: 'Серия удач',
    nameEn: 'Hot streak',
    descRu: 'Наберите комбо ×5 без схода',
    descEn: 'Reach a ×5 catch combo',
    reward: 286,
    check: (s) => (s.bestCombo || 0) >= 5,
  },
  {
    id: 'q17_streak3',
    nameRu: 'Серия дней',
    nameEn: 'Day streak',
    descRu: 'Заходите 3 дня подряд',
    descEn: 'Log in 3 days in a row',
    reward: 330,
    check: (s) => (s.dailyStreak || 0) >= 3,
  },
  {
    id: 'q18_rank15',
    nameRu: 'Пятнадцатый',
    nameEn: 'Fifteenth',
    descRu: 'Достигните 15 ранга',
    descEn: 'Reach angler rank 15',
    reward: 484,
    check: (s) => anglerRank(s.xp) >= 15,
  },
  {
    id: 'q19_spots6',
    nameRu: 'Шесть точек',
    nameEn: 'Six spots',
    descRu: 'Поймайте рыбу на 6 разных местах',
    descEn: 'Catch fish at 6 different spots',
    reward: 396,
    check: (s) => Object.keys(s.spotsCaught || {}).length >= 6,
  },
  {
    id: 'q20_aquarium8',
    nameRu: 'Витрина',
    nameEn: 'Showcase',
    descRu: 'Держите 8 рыб в аквариуме',
    descEn: 'Keep 8 fish in the aquarium',
    reward: 440,
    check: (s) => (s.aquarium || []).filter(Boolean).length >= 8,
  },
  {
    id: 'q21_collect25',
    nameRu: 'Четверть каталога',
    nameEn: 'Quarter catalog',
    descRu: 'Откройте 25 видов в журнале',
    descEn: 'Discover 25 species',
    reward: 572,
    check: (s) => Object.keys(s.journal || {}).length >= 25,
  },
  {
    id: 'q22_combo10',
    nameRu: 'Десять подряд',
    nameEn: 'Ten in a row',
    descRu: 'Наберите комбо ×10',
    descEn: 'Reach combo ×10',
    reward: 616,
    check: (s) => (s.bestCombo || 0) >= 10,
  },
  {
    id: 'q23_rank30',
    nameRu: 'Тридцатый',
    nameEn: 'Thirtieth',
    descRu: 'Достигните 30 ранга',
    descEn: 'Reach angler rank 30',
    reward: 880,
    check: (s) => anglerRank(s.xp) >= 30,
  },
  {
    id: 'q24_nightjetty',
    nameRu: 'Ночной причал',
    nameEn: 'Night jetty',
    descRu: 'Поймайте рыбу на Ночном причале',
    descEn: 'Catch a fish at the Night jetty',
    reward: 990,
    check: (s) => !!(s.spotsCaught?.nightjetty),
  },
  {
    id: 'q25_rank45',
    nameRu: 'Мастер заводи',
    nameEn: 'Cove master',
    descRu: 'Достигните 45 ранга',
    descEn: 'Reach angler rank 45',
    reward: 1320,
    check: (s) => anglerRank(s.xp) >= 45,
  },
];

export function syncQuests(save) {
  if (!save.quests) save.quests = { index: 0, done: {} };
  // migrate renamed quest ids
  if (save.quests.done?.q11_rank4 && !save.quests.done.q11_rank8) {
    save.quests.done.q11_rank8 = true;
  }
  const q = QUEST_CHAIN[save.quests.index];
  if (!q) return { justFinished: null, allDone: true };
  if (save.quests.done[q.id]) {
    save.quests.index += 1;
    return syncQuests(save);
  }
  if (q.check(save)) {
    save.quests.done[q.id] = true;
    save.coins = (save.coins || 0) + (q.reward || 0);
    save.quests.index += 1;
    return { justFinished: q, allDone: save.quests.index >= QUEST_CHAIN.length };
  }
  return { justFinished: null, allDone: false };
}

export function currentQuest(save) {
  if (!save.quests) save.quests = { index: 0, done: {} };
  return QUEST_CHAIN[save.quests.index] || null;
}
