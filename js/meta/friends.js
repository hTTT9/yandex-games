/** Preset angler friends — fixed names only (6+: no free-text UGC / chat). */

export const FRIENDS = [
  {
    id: 'mira',
    nameRu: 'Мира',
    nameEn: 'Mira',
    noteRu: 'Любит рассвет и кувшинки.',
    noteEn: 'Loves dawn and lily pads.',
    rank: 4,
    totalCaught: 86,
    heaviest: 980,
    bestCombo: 5,
    species: 14,
    achievements: 6,
    topFishRu: 'Линь',
    topFishEn: 'Tench',
    spotRu: 'Кувшинки',
    spotEn: 'Lilies',
  },
  {
    id: 'kolya',
    nameRu: 'Коля',
    nameEn: 'Kolya',
    noteRu: 'Спиннингист с моста.',
    noteEn: 'Spin angler from the bridge.',
    rank: 3,
    totalCaught: 54,
    heaviest: 720,
    bestCombo: 4,
    species: 11,
    achievements: 4,
    topFishRu: 'Жерех',
    topFishEn: 'Asp',
    spotRu: 'Мост',
    spotEn: 'Bridge',
  },
  {
    id: 'lena',
    nameRu: 'Лена',
    nameEn: 'Lena',
    noteRu: 'Охотится за трофеями ночью.',
    noteEn: 'Hunts trophies at night.',
    rank: 5,
    totalCaught: 120,
    heaviest: 1420,
    bestCombo: 7,
    species: 18,
    achievements: 8,
    topFishRu: 'Ночная щука',
    topFishEn: 'Night pike',
    spotRu: 'Омут',
    spotEn: 'Deep hole',
  },
  {
    id: 'tim',
    nameRu: 'Тим',
    nameEn: 'Tim',
    noteRu: 'Спокойная донка у пирса.',
    noteEn: 'Patient feeder by the pier.',
    rank: 2,
    totalCaught: 31,
    heaviest: 410,
    bestCombo: 3,
    species: 8,
    achievements: 3,
    topFishRu: 'Карась',
    topFishEn: 'Crucian',
    spotRu: 'Пирс',
    spotEn: 'Pier',
  },
];

export function getFriend(id) {
  return FRIENDS.find((f) => f.id === id) || FRIENDS[0];
}

/** Deterministic “friend best” for a species (lore records, no UGC). */
export function friendRecordForFish(fishId, friendId = null) {
  const fishHash = [...String(fishId)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const friend = friendId
    ? getFriend(friendId)
    : FRIENDS[fishHash % FRIENDS.length];
  const base = 80 + (fishHash % 40) + (friend.heaviest % 97);
  // Scale loosely by friend's heaviest reputation
  const scale = 0.55 + (friend.rank || 2) * 0.12;
  return {
    friend,
    weight: Math.round(base * scale * (1 + (fishHash % 7) * 0.08)),
  };
}

/** Best friend record among all preset friends for this species */
export function bestFriendRecord(fish, fishId) {
  const id = fishId || fish?.id || 'bleak';
  const lo = fish?.minW || 50;
  const hi = fish?.worldW || fish?.maxW || Math.round(lo * 2.2);
  const avg = fish?.avgW || Math.round((lo + hi) / 2);
  let best = null;
  for (const f of FRIENDS) {
    const hash = [...String(id), ...f.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const t = ((hash % 70) + 20) / 100; // 0.20..0.89 of range toward world
    const weight = Math.round(lo + (hi - lo) * (0.35 + t * 0.55));
    // Stronger friends lean heavier
    const w = Math.min(hi, Math.max(avg, Math.round(weight * (0.9 + f.rank * 0.04))));
    if (!best || w > best.weight) best = { friend: f, weight: w };
  }
  return best || { friend: FRIENDS[0], weight: avg };
}
