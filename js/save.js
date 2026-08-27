import { AQUARIUM_SLOTS, FREE_BAIT_IDS, TROPHY_SLOTS, MAX_ANGLER_RANK, BAITS } from './data/fish.js';

const STORAGE_KEY = 'quiet_cove_save_v3';

export function defaultLoadout(overrides = {}) {
  return {
    rodId: 'reed',
    baitId: 'bread',
    hookId: 'hook_s',
    lineId: 'line_thin',
    bobberId: 'classic',
    ...overrides,
  };
}

export function ensureLoadouts(save) {
  if (!Array.isArray(save.loadouts) || save.loadouts.length < 2) {
    const base = {
      rodId: save.rodId || 'reed',
      baitId: save.baitId || 'bread',
      hookId: save.hookId || 'hook_s',
      lineId: save.lineId || 'line_thin',
      bobberId: save.bobberId || 'classic',
    };
    const ownedRods = save.ownedRods || ['reed', 'bamboo'];
    const ownedBaits = save.ownedBaits || ['bread', 'worm'];
    save.loadouts = [
      { ...base },
      {
        ...base,
        rodId: ownedRods[1] || ownedRods[0] || 'reed',
        baitId: ownedBaits.includes('worm') ? 'worm' : (ownedBaits[1] || ownedBaits[0] || 'bread'),
      },
    ];
  }
  while (save.loadouts.length < 3) {
    save.loadouts.push({ ...save.loadouts[save.loadouts.length - 1] });
  }
  // One-time diversify identical twin setups (RF4: each rod is its own rig)
  if (!save.flags) save.flags = {};
  if (!save.flags.loadoutsDiversified) {
    const a = save.loadouts[0];
    const b = save.loadouts[1];
    const same = a && b && a.rodId === b.rodId && a.baitId === b.baitId && a.lineId === b.lineId && a.hookId === b.hookId;
    if (same) {
      const ownedRods = save.ownedRods || ['reed'];
      const ownedBaits = save.ownedBaits || ['bread'];
      if (ownedRods.length > 1) b.rodId = ownedRods.find((id) => id !== a.rodId) || ownedRods[1];
      if (ownedBaits.length > 1) b.baitId = ownedBaits.find((id) => id !== a.baitId) || ownedBaits[1];
    }
    save.flags.loadoutsDiversified = true;
  }
  if (save.editLoadout == null || save.editLoadout < 0) save.editLoadout = 0;
  save.editLoadout = Math.min(save.editLoadout, Math.max(0, (save.rodSlots || 2) - 1));
  return save.loadouts;
}

/** Sync top-level gear fields from the loadout being edited (shop / HUD). */
export function syncSaveFromEditLoadout(save) {
  ensureLoadouts(save);
  const L = save.loadouts[save.editLoadout] || save.loadouts[0];
  save.rodId = L.rodId;
  save.baitId = L.baitId;
  save.hookId = L.hookId;
  save.lineId = L.lineId;
  save.bobberId = L.bobberId;
}

export function writeEditLoadoutFromSave(save) {
  ensureLoadouts(save);
  const i = save.editLoadout || 0;
  save.loadouts[i] = {
    rodId: save.rodId,
    baitId: save.baitId,
    hookId: save.hookId,
    lineId: save.lineId,
    bobberId: save.bobberId,
  };
}

export function defaultSave() {
  const L = defaultLoadout();
  return {
    version: 3,
    updatedAt: Date.now(),
    coins: 120,
    xp: 0,
    rodId: L.rodId,
    baitId: L.baitId,
    hookId: L.hookId,
    lineId: L.lineId,
    lineWear: 0,
    ownedRods: ['reed', 'bamboo'],
    ownedBaits: ['bread', 'worm'],
    baitStock: { bread: -1, worm: 30 },
    ownedHooks: ['hook_s'],
    ownedLines: ['line_thin'],
    ownedGroundbaits: {},
    activeChum: null,
    weatherId: 'cloudy',
    weatherCasts: 0,
    ownedBgs: ['dawn'],
    bgId: 'dawn',
    rodSkin: false,
    freeBaitCharges: 0,
    journal: {},
    aquarium: Array(AQUARIUM_SLOTS).fill(null),
    trophyWall: Array(TROPHY_SLOTS).fill(null),
    totalCaught: 0,
    bestCombo: 0,
    combo: 0,
    goalsDate: '',
    goals: [],
    goalClaimed: false,
    rvDay: '',
    rvCount: 0,
    sessionStart: Date.now(),
    lastFsAt: 0,
    dailyStreak: 0,
    lastLoginDay: 0,
    dailyBonusToday: 0,
    removeAds: false,
    soundOn: true,
    uiLang: null,
    tutorialDone: false,
    castsTotal: 0,
    todIndex: 0,
    luckyUntil: 0,
    spotId: 'pier',
    bobberId: L.bobberId,
    ownedBobbers: ['classic'],
    netId: null,
    ownedNets: [],
    heaviest: 0,
    caughtLegend: false,
    achievements: {},
    perfectHooks: 0,
    records: [],
    quests: { index: 0, done: {} },
    flags: {},
    rodSlots: 2,
    biteHold: 0,
    legendCount: 0,
    spotsCaught: {},
    pinnedSpotId: null,
    favoriteFishId: null,
    multiCast: true,
    loadouts: [
      defaultLoadout({ rodId: 'reed', baitId: 'bread' }),
      defaultLoadout({ rodId: 'bamboo', baitId: 'worm' }),
      defaultLoadout({ rodId: 'reed', baitId: 'bread' }),
    ],
    editLoadout: 0,
  };
}

function safeParse(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || data.cleared === true) return null;
    return data;
  } catch {
    return null;
  }
}

function migrate(parsed) {
  const base = defaultSave();
  const merged = {
    ...base,
    ...parsed,
    aquarium: normalizeSlots(parsed.aquarium, AQUARIUM_SLOTS),
    trophyWall: normalizeSlots(parsed.trophyWall, TROPHY_SLOTS),
    ownedHooks: parsed.ownedHooks || ['hook_s'],
    ownedLines: parsed.ownedLines || ['line_thin'],
    ownedRods: [...new Set([...(parsed.ownedRods || ['reed']), 'bamboo'])],
    ownedBaits: [...new Set([...(parsed.ownedBaits || ['bread']), 'worm', 'bread'])],
    baitStock: migrateBaitStock(parsed),
    hookId: parsed.hookId || 'hook_s',
    lineId: parsed.lineId || 'line_thin',
    flags: { ...(base.flags), ...(parsed.flags || {}) },
    quests: parsed.quests || { index: 0, done: {} },
    ownedGroundbaits: parsed.ownedGroundbaits || {},
    ownedNets: Array.isArray(parsed.ownedNets) ? parsed.ownedNets : [],
    netId: parsed.netId || null,
    rodSlots: parsed.rodSlots || 2,
    biteHold: parsed.biteHold || 0,
    legendCount: parsed.legendCount || 0,
    spotsCaught: parsed.spotsCaught || {},
    multiCast: true,
    dailyStreak: parsed.dailyStreak || 0,
    lastLoginDay: parsed.lastLoginDay || 0,
    dailyBonusToday: parsed.dailyBonusToday || 0,
  };
  if (!parsed.loadouts) {
    merged.loadouts = [
      defaultLoadout({ rodId: 'reed', baitId: 'bread' }),
      defaultLoadout({ rodId: 'bamboo', baitId: 'worm' }),
      defaultLoadout({ rodId: 'reed', baitId: 'bread' }),
    ];
    merged.flags.loadoutsDiversified = true;
  }
  ensureLoadouts(merged);
  if (!merged.flags.multiCastMigratedV12) {
    merged.multiCast = true;
    merged.flags.multiCastMigratedV12 = true;
  } else {
    merged.multiCast = parsed.multiCast !== false;
  }
  // RF4 dual-rig pass: make sure slot 2 isn't a clone of slot 1
  if (!merged.flags.dualRigV13) {
    const a = merged.loadouts[0];
    const b = merged.loadouts[1];
    if (a && b && a.rodId === b.rodId) {
      const other = merged.ownedRods.find((id) => id !== a.rodId);
      if (other) b.rodId = other;
    }
    if (a && b && a.baitId === b.baitId) {
      const otherB = merged.ownedBaits.find((id) => id !== a.baitId);
      if (otherB) b.baitId = otherB;
    }
    merged.flags.dualRigV13 = true;
    merged.flags.loadoutsDiversified = true;
  }
  syncSaveFromEditLoadout(merged);
  merged.version = 3;
  return merged;
}

export function loadLocal() {
  let parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!parsed) parsed = safeParse(localStorage.getItem('quiet_cove_save_v2'));
  if (!parsed) parsed = safeParse(localStorage.getItem('quiet_cove_save_v1'));
  if (!parsed) return defaultSave();
  return migrate(parsed);
}

function normalizeSlots(arr, n) {
  const out = Array(n).fill(null);
  if (!Array.isArray(arr)) return out;
  for (let i = 0; i < n; i++) out[i] = arr[i] || null;
  return out;
}

export function saveLocal(state, flushCloud) {
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (flushCloud) flushCloud(state, true);
}

export async function mergeCloud(player) {
  const local = loadLocal();
  if (!player?.getData) return local;
  try {
    const data = await Promise.race([
      player.getData(['save']),
      new Promise((_, reject) => setTimeout(() => reject(new Error('cloud-timeout')), 2500)),
    ]);
    const cloud = data?.save;
    if (!cloud || typeof cloud !== 'object') return local;
    if ((cloud.updatedAt || 0) > (local.updatedAt || 0)) {
      const merged = migrate(cloud);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    /* guest / offline / timeout */
  }
  return local;
}

export function createCloudFlusher(getPlayer) {
  let timer = null;
  return function flushCloud(state, immediate = false) {
    const run = async () => {
      const player = getPlayer?.();
      if (!player?.setData) return;
      try {
        await player.setData({ save: { ...state, updatedAt: Date.now() } }, true);
      } catch {
        /* ignore */
      }
    };
    if (immediate) {
      clearTimeout(timer);
      run();
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(run, 800);
  };
}

export function xpToAdvance(rank) {
  if (rank >= MAX_ANGLER_RANK) return Number.POSITIVE_INFINITY;
  // Soft curve: early ranks quick, late ranks long (≈25–30k XP to 50)
  return Math.round(22 + rank * 11 + rank * rank * 0.48);
}

export function anglerRank(xp) {
  let r = 1;
  let left = Math.max(0, xp || 0);
  while (r < MAX_ANGLER_RANK) {
    const need = xpToAdvance(r);
    if (left < need) break;
    left -= need;
    r += 1;
  }
  return r;
}

export function rankXpProgress(xp) {
  const rank = anglerRank(xp);
  if (rank >= MAX_ANGLER_RANK) return { rank, into: 0, need: 0, pct: 1 };
  let spent = 0;
  for (let r = 1; r < rank; r++) spent += xpToAdvance(r);
  const into = Math.max(0, (xp || 0) - spent);
  const need = xpToAdvance(rank);
  return { rank, into, need, pct: need ? Math.min(1, into / need) : 1 };
}

export function isFreeBait(id) {
  return (FREE_BAIT_IDS || ['bread']).includes(id);
}

export function baitCharges(save, id) {
  if (isFreeBait(id)) return Infinity;
  const stock = save.baitStock || {};
  const n = stock[id];
  if (n == null) return 0;
  if (n < 0) return Infinity;
  return n;
}

export function ensureBaitStock(save) {
  if (!save.baitStock || typeof save.baitStock !== 'object') save.baitStock = {};
  for (const id of FREE_BAIT_IDS || ['bread']) {
    save.baitStock[id] = -1;
  }
  if (!save.ownedBaits?.includes('bread')) {
    save.ownedBaits = [...new Set([...(save.ownedBaits || []), 'bread'])];
  }
  return save.baitStock;
}

function migrateBaitStock(parsed) {
  const stock = { ...(parsed.baitStock || {}) };
  for (const id of FREE_BAIT_IDS || ['bread']) stock[id] = -1;
  // Legacy permanent unlocks → starter pack charges
  for (const id of parsed.ownedBaits || []) {
    if (isFreeBait(id)) continue;
    if (stock[id] == null) {
      const bait = BAITS.find((b) => b.id === id);
      stock[id] = bait?.packSize || 15;
    }
  }
  if (stock.worm == null) stock.worm = 30;
  return stock;
}

/** Spend one bait charge; free starters never deplete. Falls back to bread. */
export function consumeBaitCharge(save, baitId) {
  ensureBaitStock(save);
  let id = baitId || 'bread';
  if (!isFreeBait(id)) {
    const n = save.baitStock[id] || 0;
    if (n > 0) {
      save.baitStock[id] = n - 1;
      return id;
    }
    // empty → fall back to free bread
    id = 'bread';
    save.baitId = 'bread';
    if (save.loadouts?.[save.editLoadout || 0]) {
      save.loadouts[save.editLoadout || 0].baitId = 'bread';
    }
  }
  return id;
}

export function addBaitPack(save, baitId, packs = 1) {
  ensureBaitStock(save);
  if (isFreeBait(baitId)) {
    save.baitStock[baitId] = -1;
  } else {
    const bait = BAITS.find((b) => b.id === baitId);
    const add = (bait?.packSize || 15) * packs;
    save.baitStock[baitId] = Math.max(0, save.baitStock[baitId] || 0) + add;
  }
  if (!save.ownedBaits.includes(baitId)) save.ownedBaits.push(baitId);
}
