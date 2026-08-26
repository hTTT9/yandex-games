export const ACHIEVEMENTS = [
  { id: 'first_catch', nameRu: 'Первый улов', nameEn: 'First catch', descRu: 'Поймайте любую рыбу', descEn: 'Catch any fish', check: (s) => (s.totalCaught || 0) >= 1, reward: 20 },
  { id: 'combo3', nameRu: 'Серия 3', nameEn: 'Combo 3', descRu: 'Комбо ×3', descEn: 'Reach combo ×3', check: (s) => (s.bestCombo || 0) >= 3, reward: 30 },
  { id: 'combo7', nameRu: 'Серия 7', nameEn: 'Combo 7', descRu: 'Комбо ×7', descEn: 'Reach combo ×7', check: (s) => (s.bestCombo || 0) >= 7, reward: 60 },
  { id: 'collector5', nameRu: 'Начинающий натуралист', nameEn: 'Junior naturalist', descRu: '5 видов в журнале', descEn: '5 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 5, reward: 40 },
  { id: 'collector12', nameRu: 'Знаток заводи', nameEn: 'Cove expert', descRu: '12 видов в журнале', descEn: '12 species in journal', check: (s) => Object.keys(s.journal || {}).length >= 12, reward: 80 },
  { id: 'collectorAll', nameRu: 'Полный журнал', nameEn: 'Full journal', descRu: 'Откройте всех рыб', descEn: 'Discover every fish', check: (s, fishCount) => Object.keys(s.journal || {}).length >= fishCount, reward: 200 },
  { id: 'big_one', nameRu: 'Тяжеловес', nameEn: 'Heavyweight', descRu: 'Рыба от 1000 г', descEn: 'Catch 1000g+', check: (s) => (s.heaviest || 0) >= 1000, reward: 70 },
  { id: 'legend', nameRu: 'Легенда заводи', nameEn: 'Cove legend', descRu: 'Поймайте легендарную', descEn: 'Catch a legend fish', check: (s) => !!s.caughtLegend, reward: 120 },
  { id: 'rank5', nameRu: 'Ранг 5', nameEn: 'Rank 5', descRu: 'Достигните 5 ранга', descEn: 'Reach angler rank 5', check: (s, _n, rank) => rank >= 5, reward: 90 },
  { id: 'tank_full', nameRu: 'Полный аквариум', nameEn: 'Full tank', descRu: 'Заполните все слоты', descEn: 'Fill every aquarium slot', check: (s) => (s.aquarium || []).every(Boolean), reward: 50 },
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
