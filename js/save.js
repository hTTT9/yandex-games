import { AQUARIUM_SLOTS } from './data/fish.js';

const STORAGE_KEY = 'quiet_cove_save_v3';

export function defaultSave() {
  return {
    version: 3,
    updatedAt: Date.now(),
    coins: 80,
    xp: 0,
    rodId: 'reed',
    baitId: 'bread',
    hookId: 'hook_s',
    lineId: 'line_thin',
    lineWear: 0,
    ownedRods: ['reed'],
    ownedBaits: ['bread'],
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
    trophyWall: Array(6).fill(null),
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
    removeAds: false,
    soundOn: true,
    uiLang: null,
    tutorialDone: false,
    castsTotal: 0,
    todIndex: 0,
    luckyUntil: 0,
    spotId: 'pier',
    bobberId: 'classic',
    ownedBobbers: ['classic'],
    heaviest: 0,
    caughtLegend: false,
    achievements: {},
    perfectHooks: 0,
    records: [],
    quests: { index: 0, done: {} },
    flags: {},
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
    trophyWall: normalizeSlots(parsed.trophyWall, 6),
    ownedHooks: parsed.ownedHooks || ['hook_s'],
    ownedLines: parsed.ownedLines || ['line_thin'],
    hookId: parsed.hookId || 'hook_s',
    lineId: parsed.lineId || 'line_thin',
    flags: { ...(base.flags), ...(parsed.flags || {}) },
    quests: parsed.quests || { index: 0, done: {} },
    ownedGroundbaits: parsed.ownedGroundbaits || {},
  };
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
    const data = await player.getData(['save']);
    const cloud = data?.save;
    if (!cloud || typeof cloud !== 'object') return local;
    if ((cloud.updatedAt || 0) > (local.updatedAt || 0)) {
      const merged = migrate(cloud);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    /* guest / offline */
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

export function anglerRank(xp) {
  return Math.max(1, Math.floor((xp || 0) / 80) + 1);
}
