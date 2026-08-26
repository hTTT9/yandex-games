/** Story quests — first day at the cove */

export const QUEST_CHAIN = [
  {
    id: 'q1_cast',
    nameRu: 'Первый заброс',
    nameEn: 'First cast',
    descRu: 'Сделайте любой заброс на пирсе',
    descEn: 'Make any cast at the pier',
    reward: 25,
    check: (s) => (s.castsTotal || 0) >= 1,
  },
  {
    id: 'q2_catch',
    nameRu: 'Первая рыба',
    nameEn: 'First fish',
    descRu: 'Поймайте любую рыбу',
    descEn: 'Catch any fish',
    reward: 35,
    check: (s) => (s.totalCaught || 0) >= 1,
  },
  {
    id: 'q3_chum',
    nameRu: 'Прикормите точку',
    nameEn: 'Chum the spot',
    descRu: 'Используйте прикормку у горячей точки',
    descEn: 'Use groundbait on a hotspot',
    reward: 40,
    check: (s) => !!(s.flags?.usedChum),
  },
  {
    id: 'q4_journal',
    nameRu: 'Три вида',
    nameEn: 'Three species',
    descRu: 'Откройте 3 вида в журнале',
    descEn: 'Discover 3 species in the journal',
    reward: 50,
    check: (s) => Object.keys(s.journal || {}).length >= 3,
  },
  {
    id: 'q5_spot',
    nameRu: 'Новое место',
    nameEn: 'New spot',
    descRu: 'Поймайте рыбу не на пирсе',
    descEn: 'Catch a fish away from the pier',
    reward: 55,
    check: (s) => !!(s.flags?.caughtOffPier),
  },
  {
    id: 'q6_trophy_wall',
    nameRu: 'На стену',
    nameEn: 'On the wall',
    descRu: 'Повесьте трофей на стену',
    descEn: 'Hang a trophy on the wall',
    reward: 60,
    check: (s) => (s.trophyWall || []).some((slot) => !!slot),
  },
  {
    id: 'q7_spin_or_bottom',
    nameRu: 'Другой стиль',
    nameEn: 'Another style',
    descRu: 'Поймайте на спиннинг или донку',
    descEn: 'Catch on spinning or feeder',
    reward: 70,
    check: (s) => !!(s.flags?.caughtAltStyle),
  },
];

export function syncQuests(save) {
  if (!save.quests) save.quests = { index: 0, done: {} };
  const q = QUEST_CHAIN[save.quests.index];
  if (!q) return { justFinished: null, allDone: true };
  if (save.quests.done[q.id]) {
    save.quests.index += 1;
    return syncQuests(save);
  }
  if (q.check(save)) {
    save.quests.done[q.id] = true;
    save.coins = (save.coins || 0) + q.reward;
    save.quests.index += 1;
    return { justFinished: q, allDone: save.quests.index >= QUEST_CHAIN.length };
  }
  return { justFinished: null, allDone: false, current: q };
}

export function currentQuest(save) {
  if (!save.quests) save.quests = { index: 0, done: {} };
  return QUEST_CHAIN[save.quests.index] || null;
}
