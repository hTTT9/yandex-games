export const ACHIEVEMENTS = [
  { id: 'first_catch', nameRu: 'Первый улов', nameEn: 'First catch', descRu: 'Поймайте любую рыбу', descEn: 'Catch any fish', check: (s) => (s.totalCaught || 0) >= 1, reward: 44, xp: 24, cat: 'catch' },
  { id: 'catch10', nameRu: 'Десятка', nameEn: 'Tenfold', descRu: '25 рыб всего', descEn: 'Catch 25 fish', check: (s) => (s.totalCaught || 0) >= 25, reward: 88, xp: 40, cat: 'catch' },
  { id: 'catch25', nameRu: 'Четверть сотни', nameEn: 'Quarter hundred', descRu: '60 рыб всего', descEn: 'Catch 60 fish', check: (s) => (s.totalCaught || 0) >= 60, reward: 154, xp: 64, cat: 'catch' },
  { id: 'catch50', nameRu: 'Полсотни', nameEn: 'Half hundred', descRu: '120 рыб всего', descEn: 'Catch 120 fish', check: (s) => (s.totalCaught || 0) >= 120, reward: 264, xp: 96, item: { biteHold: 2 }, cat: 'catch' },
  { id: 'catch100', nameRu: 'Сотня', nameEn: 'Century', descRu: '250 рыб всего', descEn: 'Catch 250 fish', check: (s) => (s.totalCaught || 0) >= 250, reward: 550, xp: 192, item: { biteHold: 5 }, cat: 'catch' },
  { id: 'catch200', nameRu: 'Двухсотка', nameEn: 'Double century', descRu: '500 рыб всего', descEn: 'Catch 500 fish', check: (s) => (s.totalCaught || 0) >= 500, reward: 880, xp: 288, item: { biteHold: 6 }, cat: 'catch' },

  { id: 'combo3', nameRu: 'Серия 3', nameEn: 'Combo 3', descRu: 'Комбо ×5', descEn: 'Reach combo ×5', check: (s) => (s.bestCombo || 0) >= 5, reward: 66, xp: 32, cat: 'combo' },
  { id: 'combo5', nameRu: 'Серия 5', nameEn: 'Combo 5', descRu: 'Комбо ×8', descEn: 'Reach combo ×8', check: (s) => (s.bestCombo || 0) >= 8, reward: 110, xp: 56, cat: 'combo' },
  { id: 'combo7', nameRu: 'Серия 7', nameEn: 'Combo 7', descRu: 'Комбо ×12', descEn: 'Reach combo ×12', check: (s) => (s.bestCombo || 0) >= 12, reward: 132, xp: 72, cat: 'combo' },
  { id: 'combo10', nameRu: 'Серия 10', nameEn: 'Combo 10', descRu: 'Комбо ×15', descEn: 'Reach combo ×15', check: (s) => (s.bestCombo || 0) >= 15, reward: 308, xp: 128, item: { biteHold: 3 }, cat: 'combo' },
  { id: 'combo15', nameRu: 'Серия 15', nameEn: 'Combo 15', descRu: 'Комбо ×20', descEn: 'Reach combo ×20', check: (s) => (s.bestCombo || 0) >= 20, reward: 484, xp: 192, item: { biteHold: 4 }, cat: 'combo' },

  { id: 'collector5', nameRu: 'Начинающий натуралист', nameEn: 'Junior naturalist', descRu: '8 видов в журнале', descEn: '8 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 8, reward: 88, xp: 40, cat: 'collect' },
  { id: 'collector12', nameRu: 'Знаток заводи', nameEn: 'Cove expert', descRu: '18 видов в журнале', descEn: '18 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 18, reward: 176, xp: 80, cat: 'collect' },
  { id: 'collector20', nameRu: 'Каталог заводи', nameEn: 'Cove catalog', descRu: '30 видов в журнале', descEn: '30 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 30, reward: 330, xp: 144, cat: 'collect' },
  { id: 'collector35', nameRu: 'Энциклопедист', nameEn: 'Encyclopedist', descRu: '45 видов в журнале', descEn: '45 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 45, reward: 484, xp: 208, item: { biteHold: 4 }, cat: 'collect' },
  { id: 'collector50', nameRu: 'Архивариус', nameEn: 'Archivist', descRu: '60 видов в журнале', descEn: '60 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 60, reward: 660, xp: 256, item: { biteHold: 5 }, cat: 'collect' },
  { id: 'collectorAll', nameRu: 'Полный журнал', nameEn: 'Full journal', descRu: 'Откройте всех рыб', descEn: 'Discover every fish', check: (s, fishCount) => Object.keys(s.journal || {}).length >= fishCount, reward: 880, xp: 320, item: { biteHold: 8 }, cat: 'collect' },

  { id: 'big_one', nameRu: 'Тяжеловес', nameEn: 'Heavyweight', descRu: 'Рыба от 1400 г', descEn: 'Catch 1400g+', check: (s) => (s.heaviest || 0) >= 1400, reward: 154, xp: 64, cat: 'size' },
  { id: 'big_1500', nameRu: 'Полтора кило', nameEn: 'Kilo and half', descRu: 'Рыба от 2000 г', descEn: 'Catch 2000g+', check: (s) => (s.heaviest || 0) >= 2000, reward: 264, xp: 112, cat: 'size' },
  { id: 'big_2000', nameRu: 'Двухкилограммовик', nameEn: 'Two-kilo club', descRu: 'Рыба от 2800 г', descEn: 'Catch 2800g+', check: (s) => (s.heaviest || 0) >= 2800, reward: 440, xp: 176, cat: 'size' },
  { id: 'prize_first', nameRu: 'Первая рекордная', nameEn: 'First record', descRu: 'Поймайте рекордный экземпляр', descEn: 'Catch a record-size fish', check: (s) => (s.records || []).some((r) => r.catchClass === 'prize' || r.catchClass === 'trophy'), reward: 198, xp: 88, cat: 'size' },
  { id: 'prize_5', nameRu: 'Пять рекордных', nameEn: 'Five records', descRu: '8 рекордных уловов', descEn: '8 record-size catches', check: (s) => (s.records || []).filter((r) => r.catchClass === 'prize' || r.catchClass === 'trophy').length >= 8, reward: 352, xp: 144, cat: 'size' },

  { id: 'legend', nameRu: 'Легенда заводи', nameEn: 'Cove legend', descRu: 'Поймайте легендарную', descEn: 'Catch a legend fish', check: (s) => !!s.caughtLegend, reward: 264, xp: 128, cat: 'rare' },
  { id: 'legend3', nameRu: 'Три легенды', nameEn: 'Triple legend', descRu: '5 легендарных уловов', descEn: 'Catch 5 legend fish', check: (s) => (s.legendCount || 0) >= 5, reward: 484, xp: 224, item: { biteHold: 3 }, cat: 'rare' },
  { id: 'epic_first', nameRu: 'Эпический день', nameEn: 'Epic day', descRu: 'Поймайте эпическую рыбу', descEn: 'Catch an epic fish', check: (s) => !!s.flags?.caughtEpic, reward: 176, xp: 80, cat: 'rare' },

  { id: 'rank3', nameRu: 'Ранг 3', nameEn: 'Rank 3', descRu: 'Достигните 5 ранга', descEn: 'Reach angler rank 5', check: (s, _n, rank) => rank >= 5, reward: 110, xp: 48, cat: 'rank' },
  { id: 'rank5', nameRu: 'Ранг 5', nameEn: 'Rank 5', descRu: 'Достигните 10 ранга', descEn: 'Reach angler rank 10', check: (s, _n, rank) => rank >= 10, reward: 198, xp: 88, cat: 'rank' },
  { id: 'rank8', nameRu: 'Ранг 8', nameEn: 'Rank 8', descRu: 'Достигните 20 ранга', descEn: 'Reach angler rank 20', check: (s, _n, rank) => rank >= 20, reward: 396, xp: 160, cat: 'rank' },
  { id: 'rank12', nameRu: 'Ранг 12', nameEn: 'Rank 12', descRu: 'Достигните 30 ранга', descEn: 'Reach angler rank 30', check: (s, _n, rank) => rank >= 30, reward: 704, xp: 256, item: { biteHold: 5 }, cat: 'rank' },

  { id: 'tank_full', nameRu: 'Полный аквариум', nameEn: 'Full tank', descRu: 'Заполните все слоты', descEn: 'Fill every aquarium slot', check: (s) => (s.aquarium || []).length > 0 && (s.aquarium || []).every(Boolean), reward: 176, xp: 72, cat: 'meta' },
  { id: 'trophy_wall', nameRu: 'Стена славы', nameEn: 'Wall of fame', descRu: 'Повесьте рыбу на стену трофеев', descEn: 'Hang a fish on the trophy wall', check: (s) => (s.trophyWall || []).some(Boolean), reward: 154, xp: 64, cat: 'meta' },
  { id: 'trophy_full', nameRu: 'Полная стена', nameEn: 'Full wall', descRu: 'Заполните все 20 слотов стены', descEn: 'Fill all 20 trophy slots', check: (s) => (s.trophyWall || []).length >= 20 && (s.trophyWall || []).every(Boolean), reward: 396, xp: 160, cat: 'meta' },

  { id: 'casts25', nameRu: 'Заброс за забросом', nameEn: 'Cast after cast', descRu: '80 забросов', descEn: '80 casts', check: (s) => (s.castsTotal || 0) >= 80, reward: 77, xp: 32, cat: 'cast' },
  { id: 'casts100', nameRu: 'Сотня забросов', nameEn: 'Cast century', descRu: '300 забросов', descEn: '300 casts', check: (s) => (s.castsTotal || 0) >= 300, reward: 220, xp: 88, cat: 'cast' },
  { id: 'casts250', nameRu: 'Марафон забросов', nameEn: 'Cast marathon', descRu: '800 забросов', descEn: '800 casts', check: (s) => (s.castsTotal || 0) >= 800, reward: 396, xp: 144, cat: 'cast' },
  { id: 'perfect5', nameRu: 'Точная рука', nameEn: 'Sure hand', descRu: '15 идеальных подсечек', descEn: '15 perfect hooks', check: (s) => (s.perfectHooks || 0) >= 15, reward: 132, xp: 64, cat: 'cast' },
  { id: 'perfect20', nameRu: 'Мастер подсечки', nameEn: 'Hook master', descRu: '50 идеальных подсечек', descEn: '50 perfect hooks', check: (s) => (s.perfectHooks || 0) >= 50, reward: 330, xp: 144, cat: 'cast' },
  { id: 'perfect50', nameRu: 'Снайпер', nameEn: 'Sniper', descRu: '120 идеальных подсечек', descEn: '120 perfect hooks', check: (s) => (s.perfectHooks || 0) >= 120, reward: 572, xp: 224, item: { biteHold: 3 }, cat: 'cast' },

  { id: 'hotcove_open', nameRu: 'Клёвая тропа', nameEn: 'Hot path', descRu: 'Откройте Клёвую заводь', descEn: 'Unlock Hot Cove', check: (s) => !!s.flags?.hotcoveUnlocked, reward: 220, xp: 96, item: { biteHold: 2 }, cat: 'explore' },
  { id: 'multi_rod', nameRu: 'Две лески', nameEn: 'Two lines', descRu: 'Купите слот на 3 удочки', descEn: 'Buy the 3rd rod slot', check: (s) => (s.rodSlots || 2) >= 3, reward: 176, xp: 80, cat: 'meta' },
  { id: 'spots4', nameRu: 'Странник', nameEn: 'Wanderer', descRu: 'Поймайте на 6 местах', descEn: 'Catch at 6 spots', check: (s) => Object.keys(s.spotsCaught || {}).length >= 6, reward: 154, xp: 64, cat: 'explore' },
  { id: 'spots8', nameRu: 'Путешественник', nameEn: 'Traveler', descRu: 'Поймайте на 10 местах', descEn: 'Catch at 10 spots', check: (s) => Object.keys(s.spotsCaught || {}).length >= 10, reward: 308, xp: 128, cat: 'explore' },
  { id: 'spots12', nameRu: 'Картограф', nameEn: 'Cartographer', descRu: 'Поймайте на 14 местах', descEn: 'Catch at 14 spots', check: (s) => Object.keys(s.spotsCaught || {}).length >= 14, reward: 484, xp: 192, cat: 'explore' },
  { id: 'night_owl', nameRu: 'Ночная смена', nameEn: 'Night shift', descRu: 'Поймайте рыбу ночью', descEn: 'Catch a fish at night', check: (s) => (s.records || []).some((r) => r.tod === 'night') || !!s.flags?.caughtNight, reward: 132, xp: 56, cat: 'explore' },
  { id: 'rain_catch', nameRu: 'Под дождём', nameEn: 'In the rain', descRu: 'Поймайте рыбу в дождь', descEn: 'Catch a fish in the rain', check: (s) => !!s.flags?.caughtRain, reward: 121, xp: 48, cat: 'explore' },
  { id: 'chum_user', nameRu: 'Прикормщик', nameEn: 'Chummer', descRu: 'Используйте прикормку', descEn: 'Use groundbait', check: (s) => !!s.flags?.usedChum, reward: 88, xp: 32, cat: 'meta' },

  { id: 'rich200', nameRu: 'Кошелёк', nameEn: 'Wallet', descRu: 'Накопите 800 монет сразу', descEn: 'Hold 800 coins at once', check: (s) => (s.coins || 0) >= 800, reward: 66, xp: 24, cat: 'coins' },
  { id: 'rich800', nameRu: 'Касса', nameEn: 'Till', descRu: 'Накопите 3000 монет сразу', descEn: 'Hold 3000 coins at once', check: (s) => (s.coins || 0) >= 3000, reward: 220, xp: 80, cat: 'coins' },
  { id: 'rich2000', nameRu: 'Банк заводи', nameEn: 'Cove bank', descRu: 'Накопите 10000 монет сразу', descEn: 'Hold 10000 coins at once', check: (s) => (s.coins || 0) >= 10000, reward: 440, xp: 160, cat: 'coins' },

  { id: 'rank40', nameRu: 'Ранг 40', nameEn: 'Rank 40', descRu: 'Достигните 40 ранга', descEn: 'Reach angler rank 40', check: (s, _n, rank) => rank >= 40, reward: 1100, xp: 448, item: { biteHold: 6 }, cat: 'rank' },
  { id: 'rank50', nameRu: 'Ранг 50', nameEn: 'Rank 50', descRu: 'Достигните максимального 50 ранга', descEn: 'Reach max angler rank 50', check: (s, _n, rank) => rank >= 50, reward: 1980, xp: 800, item: { biteHold: 10 }, cat: 'rank' },
  { id: 'catch750', nameRu: 'Семьсот пятьдесят', nameEn: 'Seven-fifty', descRu: '750 рыб всего', descEn: 'Catch 750 fish', check: (s) => (s.totalCaught || 0) >= 750, reward: 1540, xp: 560, item: { biteHold: 8 }, cat: 'catch' },
  { id: 'friend_ping', nameRu: 'Привет соседу', nameEn: 'Hello neighbour', descRu: 'Отправьте эмодзи на доске друзей', descEn: 'Send an emote on the friends board', check: (s) => !!s.covePing, reward: 55, xp: 24, cat: 'meta' },
];

export function evaluateAchievements(save, fishCount, rank) {
  const unlocked = save.achievements || {};
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (unlocked[a.id]?.done) continue;
    if (a.check(save, fishCount, rank)) {
      newly.push(a);
    }
  }
  return newly;
}
