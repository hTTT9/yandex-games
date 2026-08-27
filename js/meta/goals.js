import { FISH } from '../data/fish.js';
import { t } from '../i18n.js';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const TEMPLATES = [
  { id: 'catch8', type: 'count', target: 8, reward: 112 },
  { id: 'catch12', type: 'count', target: 12, reward: 175 },
  { id: 'catch2rare', type: 'rarity', rarity: 'rare', target: 2, reward: 162 },
  { id: 'catch1epic', type: 'rarity', rarity: 'epic', target: 1, reward: 225 },
  { id: 'heavy800', type: 'weight', target: 800, reward: 138 },
  { id: 'heavy1200', type: 'weight', target: 1200, reward: 212 },
  { id: 'large2', type: 'cls', cls: 'large', target: 2, reward: 175 },
  { id: 'prize1', type: 'cls', cls: 'prize', target: 1, reward: 275 },
  { id: 'catch20', type: 'count', target: 20, reward: 220 },
  { id: 'catch2epic', type: 'rarity', rarity: 'epic', target: 2, reward: 320 },
  { id: 'heavy1800', type: 'weight', target: 1800, reward: 260 },
  { id: 'large4', type: 'cls', cls: 'large', target: 4, reward: 240 },
];

const GOALS_VER = 3;

export function ensureGoals(save) {
  const key = todayKey();
  if (
    save.goalsVer === GOALS_VER &&
    save.goalsDate === key &&
    Array.isArray(save.goals) &&
    save.goals.length
  ) {
    return save;
  }
  const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
  save.goalsVer = GOALS_VER;
  save.goalsDate = key;
  save.goalClaimed = false;
  save.goals = shuffled.slice(0, 3).map((g) => ({
    ...g,
    progress: 0,
    done: false,
  }));
  return save;
}

export function onCatchGoals(save, catchInfo) {
  ensureGoals(save);
  for (const g of save.goals) {
    if (g.done) continue;
    if (g.type === 'count') g.progress += 1;
    if (g.type === 'rarity' && catchInfo.fish.rarity === g.rarity) g.progress += 1;
    if (g.type === 'weight' && catchInfo.weight >= g.target) g.progress = g.target;
    if (g.type === 'cls') {
      const cls = catchInfo.catchClass;
      const ok =
        (g.cls === 'prize' && (cls === 'prize' || cls === 'trophy')) ||
        (g.cls === 'large' && (cls === 'large' || cls === 'prize' || cls === 'trophy'));
      if (ok) g.progress += 1;
    }
    if (g.progress >= g.target) g.done = true;
  }
  let bonus = 0;
  if (!save.goalClaimed && save.goals.every((g) => g.done)) {
    save.goalClaimed = true;
    bonus = save.goals.reduce((s, g) => s + g.reward, 0);
    save.coins += bonus;
  }
  return bonus;
}

export function goalLabel(g) {
  const fishWord = t('goal.fishUnit');
  if (g.type === 'count') return `${t('goal.progress')}: ${g.progress}/${g.target} ${fishWord}`;
  if (g.type === 'rarity') {
    const r = t(`rarity.${g.rarity}`);
    return `${r}: ${g.progress}/${g.target} ${fishWord}`;
  }
  if (g.type === 'weight') {
    return g.done
      ? `${t('goal.weight')}: ≥${g.target} g ✓`
      : `${t('goal.weight')}: ≥${g.target} g`;
  }
  if (g.type === 'cls') {
    const name = t(`catch.class.${g.cls === 'prize' ? 'prize' : 'large'}`);
    return `${name}: ${g.progress}/${g.target} ${fishWord}`;
  }
  return g.id;
}

export function journalEntry(save, fishId) {
  return save.journal[fishId] || null;
}

export function recordJournal(save, fish, weight) {
  const prev = save.journal[fish.id] || { count: 0, best: 0 };
  const best = Math.max(prev.best || 0, weight);
  const isNewBest = weight >= (prev.best || 0) && weight > 0;
  save.journal[fish.id] = {
    count: (prev.count || 0) + 1,
    best,
  };
  save.totalCaught = (save.totalCaught || 0) + 1;
  return { isNewBest, first: !prev.count };
}

export function discoveredCount(save) {
  return FISH.filter((f) => save.journal[f.id]?.count).length;
}
