import { FISH } from '../data/fish.js';
import { t } from '../i18n.js';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const TEMPLATES = [
  { id: 'catch3', type: 'count', target: 3, reward: 25 },
  { id: 'catch1rare', type: 'rarity', rarity: 'rare', target: 1, reward: 35 },
  { id: 'catch5', type: 'count', target: 5, reward: 40 },
  { id: 'catch1epic', type: 'rarity', rarity: 'epic', target: 1, reward: 60 },
  { id: 'heavy', type: 'weight', target: 500, reward: 30 },
];

export function ensureGoals(save) {
  const key = todayKey();
  if (save.goalsDate === key && Array.isArray(save.goals) && save.goals.length) return save;
  const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
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
  if (g.type === 'count') return `${t('goal.progress')}: ${g.progress}/${g.target}`;
  if (g.type === 'rarity') {
    const r = t(`rarity.${g.rarity}`);
    return `${r}: ${g.progress}/${g.target}`;
  }
  if (g.type === 'weight') return `≥${g.target}g: ${g.done ? '✓' : '…'}`;
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
