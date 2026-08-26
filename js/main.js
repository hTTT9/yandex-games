import { applyI18n, fishName, getLang, initI18n, setLang, t } from './i18n.js';
import {
  AQUARIUM_SLOTS,
  BAITS,
  BACKGROUNDS,
  BOBBERS,
  FISH,
  GROUNDBAITS,
  HOOKS,
  IAP_ROD_SKIN,
  LINES,
  RODS,
  SPOTS,
  TOD_CYCLE,
  WEATHERS,
  baitFitsRod,
  biteActivity,
  fishHintLine,
  getBait,
  getBobber,
  getGroundbait,
  getHook,
  getLine,
  getRod,
  getSpot,
  getWeather,
  starRating,
} from './data/fish.js';
import {
  anglerRank,
  createCloudFlusher,
  loadLocal,
  mergeCloud,
  saveLocal,
} from './save.js';
import {
  gameplayStart,
  gameplayStop,
  getPayments,
  getPlayer,
  getYsdk,
  initYandexSdk,
  loadingReady,
  showFullscreenAdv,
  showRewardedVideo,
} from './yandex-sdk.js';
import { resumeAudio, setMuted, sfxClick, startAmbience, stopAmbience } from './audio.js';
import { createScene, drawMenuBackdrop, drawSpotThumb } from './fishing/scene.js';
import { createFishingController } from './fishing/loop.js';
import { drawFishArt } from './fishArt.js';
import { achievementIcon, MENU_TIPS_EN, MENU_TIPS_RU, shopIcon } from './uiIcons.js';
import { preloadFishPhotos } from './fishPics.js';
import {
  discoveredCount,
  ensureGoals,
  goalLabel,
  onCatchGoals,
  recordJournal,
} from './meta/goals.js';
import { ACHIEVEMENTS, evaluateAchievements } from './meta/achievements.js';
import { currentQuest, syncQuests } from './meta/quests.js';

const $ = (id) => document.getElementById(id);

const screens = {
  boot: $('boot'),
  menu: $('menu'),
  pier: $('pier'),
  pause: $('pause'),
  catch: $('catch'),
  fail: $('fail'),
  journal: $('journal'),
  aquarium: $('aquarium'),
  trophies: $('trophies'),
  shop: $('shop'),
  settings: $('settings'),
  spots: $('spots'),
  achievements: $('achievements'),
  records: $('records'),
};

let save = loadLocal();
let flushCloud = () => {};
let fishing = null;
let scene = null;
let currentScreen = 'boot';
let pendingCatch = null;
let doubleUsed = false;
let activePier = false;
let journalFilter = 'all';
let menuRaf = 0;
let menuT = 0;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const layout = params.get('layout');

function persist(immediate = false) {
  saveLocal(save, (s, flush) => flushCloud(s, flush || immediate));
  if (immediate) flushCloud(save, true);
}

function currentTod() {
  return TOD_CYCLE[save.todIndex % TOD_CYCLE.length] || 'morning';
}

function isLucky() {
  return Date.now() < (save.luckyUntil || 0);
}


function rodKindLabel(kind) {
  if (kind === 'spin') return t('pier.rodSpin');
  if (kind === 'bottom') return t('pier.rodBottom');
  return t('pier.rodFloat');
}

function maybeQuestToast(result) {
  if (!result?.justFinished) return;
  const q = result.justFinished;
  const name = getLang() === 'en' ? q.nameEn : q.nameRu;
  showAchToast(`${t('quest.title')}: ${name}`, q.reward);
}

function syncQuestProgress() {
  const result = syncQuests(save);
  maybeQuestToast(result);
  return result;
}

function renderMenuQuest() {
  const q = currentQuest(save);
  const fill = (el) => {
    if (!el) return;
    if (!q) {
      el.innerHTML = `<strong>${t('quest.current')}</strong><span>${t('quest.done')}</span>`;
      el.classList.add('done');
      return;
    }
    el.classList.remove('done');
    const name = getLang() === 'en' ? q.nameEn : q.nameRu;
    const desc = getLang() === 'en' ? q.descEn : q.descRu;
    el.innerHTML = `<strong>${t('quest.current')}</strong><span>${name}: ${desc}</span>`;
  };
  fill($('menu-quest'));
  fill($('pier-quest'));
}

function refreshHud() {
  $('hud-coins').textContent = String(save.coins);
  if ($('hud-rank-label')) {
    $('hud-rank-label').textContent = `${t('menu.rankXp')} ${anglerRank(save.xp)}`;
  }
  $('hud-tod').textContent = t(`pier.tod.${currentTod()}`);
  const spot = getSpot(save.spotId);
  $('hud-spot').textContent = getLang() === 'en' ? spot.nameEn : spot.nameRu;
  const combo = save.combo || 0;
  if ($('hud-combo')) {
    $('hud-combo').textContent = combo > 1 ? `${combo}× ${t('pier.combo')}` : getBaitLabel();
  }
  $('lucky-banner').classList.toggle('hidden', !isLucky());
  scene?.setTod(currentTod());
  scene?.setLucky(isLucky());
  scene?.setBobberColor(getBobber(save.bobberId).color);
  scene?.setWeather?.(save.weatherId || 'cloudy');
  scene?.setSpot?.(save.spotId || 'pier');
  const weather = getWeather(save.weatherId || 'cloudy');
  const act = biteActivity(weather.id, currentTod());
  if ($('hud-weather')) $('hud-weather').textContent = getLang() === 'en' ? weather.nameEn : weather.nameRu;
  if ($('activity-fill')) $('activity-fill').style.width = `${Math.round(Math.min(1, act) * 100)}%`;
  if ($('hud-line-wear')) {
    const wear = Math.round((save.lineWear || 0) * 100);
    $('hud-line-wear').textContent = wear > 0 ? `${t('pier.lineWear')}: ${wear}%` : '';
  }
  updateChumBtn();
  renderGoals();
  renderTackle();
  renderMenuQuest();
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === name);
  });
  currentScreen = name;

  if (name === 'pier') {
    activePier = true;
    gameplayStart();
    stopMenuAnim();
  } else if (name !== 'pause' && name !== 'catch' && name !== 'fail') {
    if (activePier) {
      fishing?.setPaused(true);
      fishing?.stop();
      activePier = false;
    }
    stopAmbience();
    gameplayStop();
    hidePierToast();
  }

  if (name === 'menu') {
    refreshMenu();
    startMenuAnim();
  }
  if (name === 'journal') renderJournal();
  if (name === 'aquarium') renderAquarium();
  if (name === 'trophies') renderTrophies();
  if (name === 'shop') renderShop();
  if (name === 'settings') renderSettings();
  if (name === 'spots') renderSpots();
  if (name === 'achievements') renderAchievements();
  if (name === 'records') renderRecords();
}

function startMenuAnim() {
  stopMenuAnim();
  const canvas = $('menu-canvas');
  if (!canvas) return;
  const loop = (ts) => {
    menuT = ts / 1000;
    drawMenuBackdrop(canvas, menuT);
    menuRaf = requestAnimationFrame(loop);
  };
  menuRaf = requestAnimationFrame(loop);
}

function stopMenuAnim() {
  cancelAnimationFrame(menuRaf);
}

function refreshMenu() {
  $('menu-coins').textContent = String(save.coins);
  $('menu-combo').textContent = String(save.bestCombo || 0);
  $('menu-rank').textContent = String(anglerRank(save.xp));
  const found = discoveredCount(save);
  $('menu-collection').textContent = `${found}/${FISH.length}`;
  $('menu-collection-fill').style.width = `${Math.round((found / FISH.length) * 100)}%`;
  const spot = getSpot(save.spotId);
  const rod = getRod(save.rodId);
  $('menu-spot-chip').textContent = getLang() === 'en' ? spot.nameEn : spot.nameRu;
  $('menu-tod-chip').textContent = t(`pier.tod.${currentTod()}`);
  $('menu-rod-chip').textContent = rodKindLabel(rod.kind);
  refreshMenuTip();
  renderMenuQuest();
}

function updateChumBtn() {
  const btn = $('btn-chum');
  if (!btn) return;
  const active = save.activeChum;
  if (active?.left > 0) {
    const g = getGroundbait(active.id);
    const name = g ? (getLang() === 'en' ? g.nameEn : g.nameRu) : t('pier.chum');
    btn.textContent = `${name} · ${active.left}`;
    btn.classList.add('active');
  } else {
    btn.textContent = t('pier.chum');
    btn.classList.remove('active');
  }
}

function activateChum() {
  if (fishing?.isBusy()) return;
  if (scene?.state?.selectedHotspot < 0) {
    $('pier-hint').textContent = t('pier.chumNeedHotspot');
    return;
  }
  if (save.activeChum?.left > 0) {
    $('pier-hint').textContent = t('pier.chumActive');
    return;
  }
  const owned = save.ownedGroundbaits || {};
  const id = Object.keys(owned).find((k) => (owned[k] || 0) > 0);
  if (!id) {
    $('pier-hint').textContent = t('pier.chumEmpty');
    return;
  }
  const g = getGroundbait(id);
  owned[id] -= 1;
  if (owned[id] <= 0) delete owned[id];
  save.ownedGroundbaits = owned;
  save.activeChum = { id, left: g.casts };
  if (!save.flags) save.flags = {};
  save.flags.usedChum = true;
  syncQuestProgress();
  persist(true);
  updateChumBtn();
  $('pier-hint').textContent = t('pier.chumActive');
  sfxClick();
}

function getBaitLabel() {
  const bait = getBait(save.baitId);
  return getLang() === 'en' ? bait.nameEn : bait.nameRu;
}

function renderGoals() {
  ensureGoals(save);
  const strip = $('goals-strip');
  strip.innerHTML = '';
  save.goals.forEach((g) => {
    if (g.done) return; // keep pier clean — only open goals
    const chip = document.createElement('div');
    chip.className = 'goal-chip';
    chip.textContent = goalLabel(g);
    strip.appendChild(chip);
  });
}

function renderTackle() {
  const row = $('gear-row') || $('tackle-bar');
  if (!row) return;
  row.innerHTML = '';

  const addSlot = ({ ico, lab, active, onClick }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `gear-slot${active ? ' active' : ''}`;
    btn.innerHTML = `<span class="g-ico">${ico}</span><span class="g-lab">${lab}</span>`;
    btn.addEventListener('click', () => {
      if (fishing?.isBusy()) return;
      onClick();
      sfxClick();
    });
    row.appendChild(btn);
  };

  const rod = getRod(save.rodId);
  const rodName = (getLang() === 'en' ? rod.nameEn : rod.nameRu).split(' ')[0];
  addSlot({
    ico: rod.kind === 'spin' ? 'S' : rod.kind === 'bottom' ? 'D' : 'U',
    lab: rodName.slice(0, 8),
    active: true,
    onClick: () => {
      const owned = save.ownedRods || ['reed'];
      const i = owned.indexOf(save.rodId);
      const next = owned[(i + 1) % owned.length];
      save.rodId = next;
      if (!baitFitsRod(getBait(save.baitId), getRod(next))) {
        const alt = owned.map(() => null);
        const bait = (save.ownedBaits || []).map(getBait).find((b) => baitFitsRod(b, getRod(next)));
        if (bait) save.baitId = bait.id;
        void alt;
      }
      scene?.setRodKind(getRod(next).kind);
      persist();
      refreshHud();
    },
  });

  const line = getLine(save.lineId || 'line_thin');
  addSlot({
    ico: 'L',
    lab: `${Math.round((line.strength || 0.8) * 20)}кг`,
    active: false,
    onClick: () => {
      const owned = save.ownedLines || ['line_thin'];
      const i = owned.indexOf(save.lineId);
      save.lineId = owned[(i + 1) % owned.length];
      save.lineWear = 0;
      persist();
      refreshHud();
    },
  });

  const hook = getHook(save.hookId || 'hook_s');
  const hookLab = (getLang() === 'en' ? hook.nameEn : hook.nameRu)
    .replace('Крючок ', '')
    .replace('Hook ', '')
    .slice(0, 6);
  addSlot({
    ico: 'H',
    lab: hookLab,
    active: false,
    onClick: () => {
      const owned = save.ownedHooks || ['hook_s'];
      const i = owned.indexOf(save.hookId);
      save.hookId = owned[(i + 1) % owned.length];
      persist();
      refreshHud();
    },
  });

  const bait = getBait(save.baitId);
  const baitLab = (getLang() === 'en' ? bait.nameEn : bait.nameRu).split(' ')[0].slice(0, 8);
  addSlot({
    ico: 'B',
    lab: baitLab,
    active: true,
    onClick: () => {
      const rodNow = getRod(save.rodId);
      const options = (save.ownedBaits || ['bread']).map(getBait).filter((b) => baitFitsRod(b, rodNow));
      if (!options.length) return;
      const i = options.findIndex((b) => b.id === save.baitId);
      save.baitId = options[(i + 1) % options.length].id;
      persist();
      refreshHud();
    },
  });
}

function advanceTodMaybe() {
  save.castsTotal = (save.castsTotal || 0) + 1;
  if (save.castsTotal % 5 === 0) {
    save.todIndex = (save.todIndex + 1) % TOD_CYCLE.length;
  }
  save.weatherCasts = (save.weatherCasts || 0) + 1;
  if (save.weatherCasts >= 4) {
    save.weatherCasts = 0;
    const ids = WEATHERS.map((w) => w.id);
    const cur = ids.indexOf(save.weatherId || 'cloudy');
    save.weatherId = ids[(cur + 1 + Math.floor(Math.random() * 2)) % ids.length];
  }
  if (save.castsTotal % 7 === 0 && Math.random() < 0.45) {
    save.luckyUntil = Date.now() + 90_000;
  }
}

function openPier() {
  maybeFullscreen();
  hidePierToast();
  scene.setBg(save.bgId);
  scene.setSpot?.(save.spotId || 'pier');
  scene.setRodSkin(save.rodSkin);
  scene.setTod(currentTod());
  scene.setLucky(isLucky());
  scene.setBobberColor(getBobber(save.bobberId).color);
  scene.setRodKind(getRod(save.rodId).kind);
  scene.setWeather?.(save.weatherId || 'cloudy');
  scene.resize();
  showScreen('pier');
  refreshHud();
  fishing.start();
  fishing.setPaused(false);
  resumeAudio().then(() => startAmbience());
  applyShotOverride();
}

function applyShotOverride() {
  if (!shot) return;
  if (shot === 'menu') showScreen('menu');
  if (shot === 'catch' && FISH[0]) {
    pendingCatch = { fish: FISH[12] || FISH[0], weight: 640, coins: 90, zone: 2, sweet: true, lucky: false, catchClass: 'trophy', rodKind: 'float' };
    openCatchCard(pendingCatch, true);
  }
  if (shot === 'trophies') showScreen('trophies');
  if (shot === 'journal') showScreen('journal');
  if (shot === 'shop') showScreen('shop');
  if (shot === 'settings') showScreen('settings');
}

function openCatchCard(info, shotMode = false) {
  pendingCatch = info;
  doubleUsed = false;
  const { fish, weight, coins, sweet, lucky, perfectHook } = info;
  save.combo = (save.combo || 0) + 1;
  if (save.combo > (save.bestCombo || 0)) save.bestCombo = save.combo;
  if (weight > (save.heaviest || 0)) save.heaviest = weight;
  if (fish.rarity === 'legend') save.caughtLegend = true;
  if (perfectHook) save.perfectHooks = (save.perfectHooks || 0) + 1;
  const comboMul = 1 + Math.min(0.5, (save.combo - 1) * 0.08);
  pendingCatch.coins = Math.round(coins * comboMul);
  pendingCatch.comboMul = comboMul;

  if (!save.flags) save.flags = {};
  if (save.spotId !== 'pier') save.flags.caughtOffPier = true;
  if (info.rodKind === 'spin' || info.rodKind === 'bottom') save.flags.caughtAltStyle = true;

  const rarityEl = $('catch-rarity');
  rarityEl.textContent = t(`rarity.${fish.rarity}`);
  rarityEl.className = `catch-rarity ${fish.rarity}`;
  const cls = info.catchClass || 'normal';
  const clsEl = $('catch-class');
  if (clsEl) {
    clsEl.textContent = t(`catch.class.${cls}`);
    clsEl.className = `catch-class ${cls}`;
  }
  drawFishArt($('catch-fish-canvas'), fish);
  $('catch-name').textContent = fishName(fish);

  const stars = starRating(fish, weight);
  const starsEl = $('catch-stars');
  starsEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('div');
    s.className = `star${i < stars ? ' on' : ''}`;
    starsEl.appendChild(s);
  }

  const journal = recordJournal(save, fish, weight);
  const bestNote = journal.isNewBest ? ` · ${t('catch.newBest')}` : '';
  $('catch-meta').textContent = `${t('catch.weight')}: ${weight}g${bestNote}`;
  $('catch-coins').textContent = `${t('catch.coins')}: ${pendingCatch.coins}`;

  const bonuses = [];
  if (sweet) bonuses.push(t('catch.sweet'));
  if (perfectHook) bonuses.push(t('catch.perfect'));
  if (lucky) bonuses.push(t('catch.lucky'));
  if (comboMul > 1.01) bonuses.push(`${t('catch.comboBonus')} ×${comboMul.toFixed(2)}`);
  const bonusEl = $('catch-bonus');
  if (bonuses.length) {
    bonusEl.textContent = bonuses.join(' · ');
    bonusEl.classList.remove('hidden');
    bonusEl.classList.add('hot');
  } else {
    bonusEl.classList.add('hidden');
  }

  save.xp = (save.xp || 0) + 12 + stars * 4
    + (fish.rarity === 'legend' ? 35 : fish.rarity === 'epic' ? 20 : fish.rarity === 'rare' ? 10 : 0);
  // records log
  if (!save.records) save.records = [];
  save.records.unshift({
    fishId: fish.id,
    weight,
    coins: pendingCatch.coins,
    spotId: save.spotId,
    tod: currentTod(),
    catchClass: cls,
    at: Date.now(),
  });
  save.records = save.records.slice(0, 40);
  onCatchGoals(save, info);
  syncQuestProgress();
  claimAchievements();
  persist(true);
  const canTrophy = (cls === 'trophy' || cls === 'large');
  if (canTrophy && !save.trophyWall) save.trophyWall = Array(6).fill(null);
  const hasTrophySlot = (save.trophyWall || []).some((s) => !s);
  $('btn-trophy')?.classList.toggle('hidden', shotMode || !canTrophy || !hasTrophySlot);
  $('btn-double-rv').classList.toggle('hidden', shotMode);
  showScreen('catch');
  gameplayStop();
}

function claimAchievements() {
  if (!save.achievements) save.achievements = {};
  const rank = anglerRank(save.xp);
  const newly = evaluateAchievements(save, FISH.length, rank);
  for (const a of newly) {
    save.achievements[a.id] = { done: true, at: Date.now() };
    save.coins += a.reward;
    showAchToast(getLang() === 'en' ? a.nameEn : a.nameRu, a.reward);
  }
}

function showAchToast(name, reward) {
  const el = document.createElement('div');
  el.className = 'toast-ach';
  el.textContent = `${t('achievements.toast')} ${name} · +${reward}`;
  $('app').appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function finishCatch(mode) {
  if (!pendingCatch) {
    resumePier();
    return;
  }
  const { fish, weight, coins, catchClass: cls } = pendingCatch;
  if (mode === 'keep') {
    const idx = save.aquarium.findIndex((s) => !s);
    if (idx >= 0) save.aquarium[idx] = { fishId: fish.id, weight, color: fish.color };
    else save.coins += coins;
  } else if (mode === 'trophy') {
    if (!save.trophyWall) save.trophyWall = Array(6).fill(null);
    const idx = save.trophyWall.findIndex((s) => !s);
    if (idx >= 0) {
      save.trophyWall[idx] = { fishId: fish.id, weight, color: fish.color, catchClass: cls || 'trophy' };
      syncQuestProgress();
    } else {
      save.coins += coins;
    }
  } else {
    save.coins += coins;
  }
  pendingCatch = null;
  persist(true);
  resumePier();
}

let failToastTimer = 0;

function hidePierToast() {
  const toast = $('pier-toast');
  if (toast) toast.classList.add('hidden');
  if (failToastTimer) {
    clearTimeout(failToastTimer);
    failToastTimer = 0;
  }
}

function showPierToast(title, text, { showRv = true, ms = 3200 } = {}) {
  const toast = $('pier-toast');
  if (!toast) return;
  $('pier-toast-title').textContent = title;
  $('pier-toast-text').textContent = text;
  const rv = $('btn-retry-rv');
  if (rv) rv.classList.toggle('hidden', !showRv);
  toast.classList.remove('hidden');
  if (failToastTimer) clearTimeout(failToastTimer);
  failToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    failToastTimer = 0;
  }, ms);
}

function resumePier() {
  hidePierToast();
  showScreen('pier');
  refreshHud();
  fishing.setPaused(false);
  gameplayStart();
}

function openFail(reason) {
  save.combo = 0;
  persist();
  // Stay on the pier — soft banner, no full-screen “Ушла” sheet
  fishing?.setPaused(false);
  const textMap = { snap: 'fail.snap', escape: 'fail.escape', miss: 'fail.miss', empty: 'fail.empty' };
  const titleMap = {
    snap: 'fail.snapTitle',
    escape: 'fail.escapeTitle',
    miss: 'fail.missTitle',
    empty: 'fail.emptyTitle',
  };
  showPierToast(
    t(titleMap[reason] || 'fail.title'),
    t(textMap[reason] || 'fail.text'),
    { showRv: reason !== 'empty', ms: reason === 'empty' ? 2400 : 3400 },
  );
  refreshHud();
  gameplayStart();
}

function renderJournal() {
  const filters = $('journal-filters');
  filters.innerHTML = '';
  ['all', 'common', 'rare', 'epic', 'legend'].forEach((f) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `filter-chip${journalFilter === f ? ' on' : ''}`;
    btn.textContent = f === 'all' ? t('journal.all') : t(`rarity.${f}`);
    btn.addEventListener('click', () => {
      journalFilter = f;
      renderJournal();
    });
    filters.appendChild(btn);
  });

  const list = $('journal-list');
  list.innerHTML = '';
  FISH.filter((fish) => journalFilter === 'all' || fish.rarity === journalFilter).forEach((fish) => {
    const entry = save.journal[fish.id];
    const row = document.createElement('div');
    row.className = `list-item${entry ? '' : ' locked'}`;
    const sw = document.createElement('div');
    sw.className = 'fish-thumb';
    const c = document.createElement('canvas');
    c.width = 112;
    c.height = 68;
    sw.appendChild(c);
    if (entry) drawFishArt(c, fish);
    else {
      c.getContext('2d').fillStyle = '#c5bdb2';
      c.getContext('2d').fillRect(0, 0, 112, 68);
    }
    const meta = document.createElement('div');
    meta.className = 'meta';
    if (entry) {
      const hints = fishHintLine(fish, getLang());
      const todLabels = (hints.tod || []).map((x) => t(`pier.tod.${x}`)).join(', ');
      const hintLine = [
        hints.spots?.length ? `${t('journal.hintSpot')}: ${hints.spots.join(', ')}` : '',
        hints.baits?.length ? `${t('journal.hintBait')}: ${hints.baits.join(', ')}` : '',
        todLabels ? `${t('journal.hintTod')}: ${todLabels}` : '',
      ].filter(Boolean).join(' · ');
      meta.innerHTML = `<strong>${fishName(fish)}</strong><span>${t('journal.count')}: ${entry.count} · ${t('journal.best')}: ${entry.best}g · ${t(`rarity.${fish.rarity}`)}</span><span class="hint-line">${hintLine}</span>`;
    } else {
      meta.innerHTML = `<strong>???</strong><span>${t('journal.locked')}</span>`;
    }
    row.append(sw, meta);
    list.appendChild(row);
  });
}

function renderAquarium() {
  const grid = $('tank-grid');
  grid.innerHTML = '';
  for (let i = 0; i < AQUARIUM_SLOTS; i++) {
    const slot = save.aquarium[i];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `tank-slot${slot ? ' filled' : ' empty-dash'}`;
    if (slot) {
      const fish = FISH.find((f) => f.id === slot.fishId);
      const art = document.createElement('div');
      art.className = 'tank-art';
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 90;
      art.appendChild(c);
      if (fish) drawFishArt(c, fish);
      const name = document.createElement('div');
      name.className = 'tank-name';
      name.textContent = fish ? fishName(fish) : '—';
      const wt = document.createElement('div');
      wt.className = 'tank-wt';
      wt.textContent = `${slot.weight}g`;
      el.append(art, name, wt);
      el.addEventListener('click', () => {
        save.aquarium[i] = null;
        persist(true);
        renderAquarium();
        sfxClick();
      });
    } else {
      el.innerHTML = `<span class="tank-empty-ico" aria-hidden="true"></span><span>${t('aquarium.empty')}</span>`;
    }
    grid.appendChild(el);
  }
}

function renderTrophies() {
  const grid = $('trophy-grid');
  if (!grid) return;
  if (!save.trophyWall) save.trophyWall = Array(6).fill(null);
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const slot = save.trophyWall[i];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `tank-slot${slot ? ' filled trophy' : ' empty-dash'}`;
    if (slot) {
      const fish = FISH.find((f) => f.id === slot.fishId);
      const art = document.createElement('div');
      art.className = 'tank-art';
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 90;
      art.appendChild(c);
      if (fish) drawFishArt(c, fish);
      const name = document.createElement('div');
      name.className = 'tank-name';
      name.textContent = fish ? fishName(fish) : '—';
      const wt = document.createElement('div');
      wt.className = 'tank-wt';
      const cls = slot.catchClass ? t(`catch.class.${slot.catchClass}`) : '';
      wt.textContent = `${slot.weight}g · ${cls}`;
      el.append(art, name, wt);
      el.addEventListener('click', () => {
        save.trophyWall[i] = null;
        persist(true);
        renderTrophies();
        sfxClick();
      });
    } else {
      el.innerHTML = `<span class="tank-empty-ico" aria-hidden="true"></span><span>${t('trophies.empty')}</span>`;
    }
    grid.appendChild(el);
  }
}

function itemTitle(item) {
  return getLang() === 'en' ? item.nameEn : item.nameRu;
}

function shopIco(kind) {
  const el = document.createElement('div');
  el.className = `shop-ico tone-${kind}`;
  el.innerHTML = shopIcon(kind);
  return el;
}

function appendShopRow(parent, { kind, title, meta, btn }) {
  const row = document.createElement('div');
  row.className = 'shop-item';
  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<strong>${title}</strong><span>${meta}</span>`;
  row.append(shopIco(kind), info, btn);
  parent.appendChild(row);
  return row;
}

function refreshMenuTip() {
  const el = $('menu-tip');
  if (!el) return;
  const tips = getLang() === 'en' ? MENU_TIPS_EN : MENU_TIPS_RU;
  const idx = (save.castsTotal || 0) % tips.length;
  el.textContent = tips[idx];
}

function renderShop() {
  $('shop-coins').textContent = String(save.coins);
  const rodsEl = $('shop-rods');
  rodsEl.innerHTML = '';
  RODS.forEach((rod) => {
    const owned = save.ownedRods.includes(rod.id);
    const equipped = save.rodId === rod.id;
    const row = document.createElement('div');
    row.className = `shop-item${equipped ? ' owned' : ''}`;
    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `<strong>${itemTitle(rod)}</strong><span>${t('shop.need')}: ${rod.price} · ${rodKindLabel(rod.kind)} · zone ${rod.maxZone}</span>`;
    row.appendChild(shopIco('rod'));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    if (equipped) {
      btn.textContent = t('shop.equipped');
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = t('shop.equip');
      btn.addEventListener('click', () => {
        save.rodId = rod.id;
        persist(true);
        renderShop();
      });
    } else {
      btn.textContent = `${t('shop.buy')} ${rod.price}`;
      btn.addEventListener('click', () => {
        if (save.coins < rod.price) return;
        save.coins -= rod.price;
        save.ownedRods.push(rod.id);
        save.rodId = rod.id;
        persist(true);
        renderShop();
        refreshMenu();
      });
    }
    row.append(info, btn);
    rodsEl.appendChild(row);
  });

  const baitsEl = $('shop-baits');
  baitsEl.innerHTML = '';
  BAITS.forEach((bait) => {
    const owned = save.ownedBaits.includes(bait.id);
    const equipped = save.baitId === bait.id;
    const row = document.createElement('div');
    row.className = `shop-item${equipped ? ' owned' : ''}`;
    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `<strong>${itemTitle(bait)}</strong><span>${bait.price}</span>`;
    row.appendChild(shopIco('bait'));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    if (equipped) {
      btn.textContent = t('shop.equipped');
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = t('shop.equip');
      btn.addEventListener('click', () => {
        save.baitId = bait.id;
        persist(true);
        renderShop();
      });
    } else {
      btn.textContent = `${t('shop.buy')} ${bait.price}`;
      btn.addEventListener('click', () => {
        if (save.coins < bait.price) return;
        save.coins -= bait.price;
        save.ownedBaits.push(bait.id);
        save.baitId = bait.id;
        persist(true);
        renderShop();
      });
    }
    row.append(info, btn);
    baitsEl.appendChild(row);
  });

  const cosEl = $('shop-cosmetics');
  cosEl.innerHTML = '';
  BACKGROUNDS.forEach((bg) => {
    const owned = save.ownedBgs.includes(bg.id);
    const equipped = save.bgId === bg.id;
    const row = document.createElement('div');
    row.className = `shop-item${equipped ? ' owned' : ''}`;
    const title = bg.id === 'dawn' ? t('shop.bgDawn') : bg.id === 'mist' ? t('shop.bgMist') : t('shop.bgSunset');
    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `<strong>${title}</strong><span>${bg.price}</span>`;
    row.appendChild(shopIco('bg'));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    if (equipped) {
      btn.textContent = t('shop.equipped');
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = t('shop.equip');
      btn.addEventListener('click', () => {
        save.bgId = bg.id;
        scene?.setBg(bg.id);
        persist(true);
        renderShop();
      });
    } else {
      btn.textContent = `${t('shop.buy')} ${bg.price}`;
      btn.addEventListener('click', () => {
        if (save.coins < bg.price) return;
        save.coins -= bg.price;
        save.ownedBgs.push(bg.id);
        save.bgId = bg.id;
        scene?.setBg(bg.id);
        persist(true);
        renderShop();
      });
    }
    row.append(info, btn);
    cosEl.appendChild(row);
  });

  const hooksEl = $('shop-hooks');
  if (hooksEl) {
    hooksEl.innerHTML = '';
    HOOKS.forEach((hook) => {
      if (!save.ownedHooks) save.ownedHooks = ['hook_s'];
      const owned = save.ownedHooks.includes(hook.id);
      const equipped = save.hookId === hook.id;
      const row = document.createElement('div');
      row.className = `shop-item${equipped ? ' owned' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${itemTitle(hook)}</strong><span>${hook.price}</span>`;
      row.appendChild(shopIco('hook'));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (equipped) { btn.textContent = t('shop.equipped'); btn.disabled = true; }
      else if (owned) {
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => { save.hookId = hook.id; persist(true); renderShop(); });
      } else {
        btn.textContent = `${t('shop.buy')} ${hook.price}`;
        btn.addEventListener('click', () => {
          if (save.coins < hook.price) return;
          save.coins -= hook.price;
          save.ownedHooks.push(hook.id);
          save.hookId = hook.id;
          persist(true); renderShop(); refreshMenu();
        });
      }
      row.append(info, btn);
      hooksEl.appendChild(row);
    });
  }

  const linesEl = $('shop-lines');
  if (linesEl) {
    linesEl.innerHTML = '';
    LINES.forEach((line) => {
      if (!save.ownedLines) save.ownedLines = ['line_thin'];
      const owned = save.ownedLines.includes(line.id);
      const equipped = save.lineId === line.id;
      const row = document.createElement('div');
      row.className = `shop-item${equipped ? ' owned' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${itemTitle(line)}</strong><span>${line.price}</span>`;
      row.appendChild(shopIco('line'));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (equipped) { btn.textContent = t('shop.equipped'); btn.disabled = true; }
      else if (owned) {
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => { save.lineId = line.id; save.lineWear = 0; persist(true); renderShop(); });
      } else {
        btn.textContent = `${t('shop.buy')} ${line.price}`;
        btn.addEventListener('click', () => {
          if (save.coins < line.price) return;
          save.coins -= line.price;
          save.ownedLines.push(line.id);
          save.lineId = line.id;
          save.lineWear = 0;
          persist(true); renderShop(); refreshMenu();
        });
      }
      row.append(info, btn);
      linesEl.appendChild(row);
    });
    if ((save.lineWear || 0) > 0.05) {
      const row = document.createElement('div');
      row.className = 'shop-item';
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${t('shop.repairLine')}</strong><span>25</span>`;
      row.appendChild(shopIco('line'));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-soft';
      btn.textContent = `${t('shop.buy')} 25`;
      btn.addEventListener('click', () => {
        if (save.coins < 25) return;
        save.coins -= 25;
        save.lineWear = 0;
        persist(true); renderShop(); refreshHud();
      });
      row.append(info, btn);
      linesEl.appendChild(row);
    }
  }

  const gbEl = $('shop-groundbait');
  if (gbEl) {
    gbEl.innerHTML = '';
    if (!save.ownedGroundbaits) save.ownedGroundbaits = {};
    GROUNDBAITS.forEach((g) => {
      const stock = save.ownedGroundbaits[g.id] || 0;
      const row = document.createElement('div');
      row.className = 'shop-item';
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${itemTitle(g)}</strong><span>${g.price} · ${stock} ${t('shop.packs')}</span>`;
      row.appendChild(shopIco('chum'));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      btn.textContent = `${t('shop.buy')} ${g.price}`;
      btn.addEventListener('click', () => {
        if (save.coins < g.price) return;
        save.coins -= g.price;
        save.ownedGroundbaits[g.id] = (save.ownedGroundbaits[g.id] || 0) + 1;
        persist(true); renderShop(); refreshMenu();
      });
      row.append(info, btn);
      gbEl.appendChild(row);
    });
  }

  const bobEl = $('shop-bobbers');
  if (bobEl) {
    bobEl.innerHTML = '';
    BOBBERS.forEach((bob) => {
      if (!save.ownedBobbers) save.ownedBobbers = ['classic'];
      const owned = save.ownedBobbers.includes(bob.id);
      const equipped = save.bobberId === bob.id;
      const row = document.createElement('div');
      row.className = `shop-item${equipped ? ' owned' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${itemTitle(bob)}</strong><span>${bob.price}</span>`;
      const sw = document.createElement('div');
      sw.className = 'fish-swatch';
      sw.style.background = bob.color;
      sw.style.width = '22px';
      sw.style.height = '28px';
      sw.style.borderRadius = '40%';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (equipped) {
        btn.textContent = t('shop.equipped');
        btn.disabled = true;
      } else if (owned) {
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => {
          save.bobberId = bob.id;
          scene?.setBobberColor(bob.color);
          persist(true);
          renderShop();
        });
      } else {
        btn.textContent = `${t('shop.buy')} ${bob.price}`;
        btn.addEventListener('click', () => {
          if (save.coins < bob.price) return;
          save.coins -= bob.price;
          save.ownedBobbers.push(bob.id);
          save.bobberId = bob.id;
          scene?.setBobberColor(bob.color);
          persist(true);
          renderShop();
        });
      }
      row.append(shopIco('bobber'), sw, info, btn);
      bobEl.appendChild(row);
    });
  }

  if (save.rodSkin) {
    $('btn-iap-rod-skin').textContent = t('shop.owned');
    $('btn-iap-rod-skin').disabled = true;
  } else {
    $('btn-iap-rod-skin').disabled = false;
    $('btn-iap-rod-skin').textContent = t('shop.iapRod');
  }
}

function renderSpots() {
  const list = $('spots-list');
  list.innerHTML = '';
  const rank = anglerRank(save.xp);
  SPOTS.forEach((spot) => {
    const unlocked = rank >= spot.unlockRank;
    const selected = save.spotId === spot.id;
    const row = document.createElement('div');
    row.className = `list-item spot-row${selected ? ' selected' : ''}${unlocked ? '' : ' locked'}`;
    const thumb = document.createElement('div');
    thumb.className = 'spot-thumb';
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 72;
    thumb.appendChild(c);
    drawSpotThumb(c, spot.id, Date.now() / 1000);
    if (!unlocked) thumb.classList.add('dim');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = getLang() === 'en' ? spot.nameEn : spot.nameRu;
    const desc = getLang() === 'en' ? spot.descEn : spot.descRu;
    meta.innerHTML = `<strong>${title}</strong><span class="spot-desc">${desc || ''}</span><span class="spot-meta">${unlocked ? `×${spot.rareMul}` : `${t('spots.needRank')} ${spot.unlockRank}`}</span>`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${selected ? 'btn-soft' : 'btn-primary'}`;
    if (!unlocked) {
      btn.textContent = `${t('spots.needRank')} ${spot.unlockRank}`;
      btn.disabled = true;
    } else if (selected) {
      btn.textContent = t('spots.selected');
      btn.disabled = true;
    } else {
      btn.textContent = t('spots.select');
      btn.addEventListener('click', () => {
        save.spotId = spot.id;
        scene?.setSpot?.(spot.id);
        persist(true);
        renderSpots();
        refreshMenu();
        sfxClick();
      });
    }
    row.append(thumb, meta, btn);
    list.appendChild(row);
  });
}

function achievementTone(id) {
  if (id.includes('combo')) return 'fire';
  if (id.includes('collector') || id === 'tank_full') return 'lake';
  if (id === 'legend' || id === 'big_one') return 'gold';
  if (id === 'rank5') return 'moss';
  return 'coral';
}

function renderAchievements() {
  const list = $('achievements-list');
  list.innerHTML = '';
  if (!save.achievements) save.achievements = {};
  const rank = anglerRank(save.xp);
  ACHIEVEMENTS.forEach((a) => {
    const done = !!save.achievements[a.id]?.done;
    const ready = !done && a.check(save, FISH.length, rank);
    const row = document.createElement('div');
    row.className = `achieve-row${done ? ' done' : ''}${ready ? ' ready' : ''}`;
    const ico = document.createElement('div');
    ico.className = `achieve-ico tone-${achievementTone(a.id)}${done ? ' lit' : ''}`;
    ico.innerHTML = achievementIcon(a.id);
    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = getLang() === 'en' ? a.nameEn : a.nameRu;
    const desc = getLang() === 'en' ? a.descEn : a.descRu;
    const status = done ? t('achievements.done') : ready ? '…' : t('achievements.locked');
    meta.innerHTML = `<strong>${name}</strong><span class="ach-desc">${desc}</span><span class="ach-meta">${t('achievements.reward')}: ${a.reward} · ${status}</span>`;
    row.append(ico, meta);
    list.appendChild(row);
  });
  claimAchievements();
  persist();
}

function renderRecords() {
  const sum = $('records-summary');
  sum.innerHTML = `
    <div class="record-pill"><span>${t('records.heaviest')}</span><strong>${save.heaviest || 0}g</strong></div>
    <div class="record-pill"><span>${t('records.bestCombo')}</span><strong>×${save.bestCombo || 0}</strong></div>
    <div class="record-pill"><span>${t('records.total')}</span><strong>${save.totalCaught || 0}</strong></div>
    <div class="record-pill"><span>${t('menu.collection')}</span><strong>${discoveredCount(save)}/${FISH.length}</strong></div>
  `;
  const list = $('records-list');
  list.innerHTML = '';
  const records = save.records || [];
  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'panel-note';
    empty.textContent = t('records.empty');
    list.appendChild(empty);
    return;
  }
  records.forEach((rec) => {
    const fish = FISH.find((f) => f.id === rec.fishId);
    if (!fish) return;
    const row = document.createElement('div');
    row.className = 'list-item';
    const thumb = document.createElement('div');
    thumb.className = 'fish-thumb';
    const c = document.createElement('canvas');
    c.width = 112;
    c.height = 68;
    thumb.appendChild(c);
    drawFishArt(c, fish);
    const spot = getSpot(rec.spotId);
    const meta = document.createElement('div');
    meta.className = 'meta';
    const spotName = getLang() === 'en' ? spot.nameEn : spot.nameRu;
    const tod = t(`pier.tod.${rec.tod || 'morning'}`);
    const cls = rec.catchClass ? ` · ${t(`catch.class.${rec.catchClass}`)}` : '';
    meta.innerHTML = `<strong>${fishName(fish)}</strong><span>${rec.weight}g${cls} · ${spotName} · ${tod} · +${rec.coins}</span>`;
    row.append(thumb, meta);
    list.appendChild(row);
  });
}

function renderSettings() {
  const soundBtn = $('btn-sound-toggle');
  soundBtn.textContent = save.soundOn ? 'ON' : 'OFF';
  soundBtn.classList.toggle('on', !!save.soundOn);
  $('btn-lang-ru').classList.toggle('on', getLang() === 'ru');
  $('btn-lang-en').classList.toggle('on', getLang() === 'en');
}

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function canRv() {
  const key = dayKey();
  if (save.rvDay !== key) {
    save.rvDay = key;
    save.rvCount = 0;
  }
  return save.rvCount < 8;
}

function markRv() {
  if (save.rvDay !== dayKey()) {
    save.rvDay = dayKey();
    save.rvCount = 0;
  }
  save.rvCount += 1;
  persist(true);
}

async function maybeFullscreen() {
  if (save.removeAds) return;
  const now = Date.now();
  if (!save.sessionStart) save.sessionStart = now;
  if (now - save.sessionStart < 90000) return;
  if (now - (save.lastFsAt || 0) < 180000) return;
  setMuted(true);
  await showFullscreenAdv();
  setMuted(!save.soundOn);
  if (save.soundOn) await resumeAudio();
  save.lastFsAt = Date.now();
  persist();
  if (currentScreen === 'pier') gameplayStart();
}

async function runRv(onReward) {
  if (!canRv()) return false;
  setMuted(true);
  fishing?.setPaused(true);
  const ok = await showRewardedVideo();
  setMuted(!save.soundOn);
  if (save.soundOn) await resumeAudio();
  if (ok) {
    markRv();
    onReward();
  }
  if (currentScreen === 'pier') {
    fishing?.setPaused(false);
    gameplayStart();
  }
  return ok;
}

async function buyRodSkin() {
  const payments = getPayments();
  if (!payments?.purchase) {
    save.rodSkin = true;
    scene?.setRodSkin(true);
    persist(true);
    renderShop();
    return;
  }
  try {
    gameplayStop();
    setMuted(true);
    const purchase = await payments.purchase({ id: IAP_ROD_SKIN });
    if (purchase) {
      save.rodSkin = true;
      scene?.setRodSkin(true);
      persist(true);
      renderShop();
    }
  } catch {
    /* cancelled */
  } finally {
    setMuted(!save.soundOn);
    if (save.soundOn) await resumeAudio();
  }
}

async function syncPurchases() {
  const payments = getPayments();
  if (!payments?.getPurchases) return;
  try {
    const list = await payments.getPurchases();
    if (list?.some((p) => p.productID === IAP_ROD_SKIN || p.productId === IAP_ROD_SKIN)) {
      save.rodSkin = true;
      scene?.setRodSkin(true);
      persist(true);
    }
  } catch {
    /* draft */
  }
}

function applySoundPref() {
  setMuted(!save.soundOn);
}

function bindUi() {
  $('btn-play').addEventListener('click', () => { sfxClick(); openPier(); });
  document.querySelectorAll('.side-nav-btn[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screen = btn.getAttribute('data-screen');
      if (!screen) return;
      fishing?.setPaused(true);
      fishing?.stop();
      activePier = false;
      gameplayStop();
      showScreen(screen);
      sfxClick();
    });
  });
  $('btn-journal').addEventListener('click', () => { sfxClick(); showScreen('journal'); });
  $('btn-aquarium').addEventListener('click', () => { sfxClick(); showScreen('aquarium'); });
  $('btn-trophies')?.addEventListener('click', () => { sfxClick(); showScreen('trophies'); });
  $('btn-shop').addEventListener('click', () => { sfxClick(); showScreen('shop'); });
  $('btn-settings').addEventListener('click', () => { sfxClick(); showScreen('settings'); });
  $('btn-spots').addEventListener('click', () => { sfxClick(); showScreen('spots'); });
  $('btn-achievements').addEventListener('click', () => { sfxClick(); showScreen('achievements'); });
  $('btn-records').addEventListener('click', () => { sfxClick(); showScreen('records'); });
  $('btn-settings').addEventListener('click', () => { sfxClick(); showScreen('settings'); });
  $('btn-journal-back').addEventListener('click', () => showScreen('menu'));
  $('btn-aquarium-back').addEventListener('click', () => showScreen('menu'));
  $('btn-trophies-back')?.addEventListener('click', () => showScreen('menu'));
  $('btn-shop-back').addEventListener('click', () => showScreen('menu'));
  $('btn-settings-back').addEventListener('click', () => showScreen('menu'));
  $('btn-spots-back').addEventListener('click', () => showScreen('menu'));
  $('btn-achievements-back').addEventListener('click', () => showScreen('menu'));
  $('btn-records-back').addEventListener('click', () => showScreen('menu'));

  $('btn-menu-from-pier').addEventListener('click', () => {
    fishing.setPaused(true);
    fishing.stop();
    maybeFullscreen();
    showScreen('menu');
  });
  $('btn-pause').addEventListener('click', () => {
    fishing.setPaused(true);
    gameplayStop();
    showScreen('pause');
  });
  $('btn-resume').addEventListener('click', () => {
    showScreen('pier');
    fishing.setPaused(false);
    gameplayStart();
  });
  $('btn-pause-menu').addEventListener('click', () => {
    fishing.stop();
    showScreen('menu');
  });

  const castBtn = $('btn-cast');
  castBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    castBtn.setPointerCapture?.(e.pointerId);
    fishing.startPower();
  });
  const endCast = (e) => {
    e.preventDefault();
    fishing.releaseCast();
  };
  castBtn.addEventListener('pointerup', endCast);
  castBtn.addEventListener('pointercancel', endCast);

  $('btn-hook').addEventListener('click', () => fishing.tryHook());
  const reel = $('btn-reel');
  reel.addEventListener('pointerdown', (e) => { e.preventDefault(); fishing.setReel(true); });
  const endReel = () => fishing.setReel(false);
  reel.addEventListener('pointerup', endReel);
  reel.addEventListener('pointerleave', endReel);
  reel.addEventListener('pointercancel', endReel);

  $('game-canvas').addEventListener('pointerdown', (e) => {
    if (fishing?.getPhase() !== 'idle') return;
    const idx = scene.pickHotspot(e.clientX, e.clientY);
    if (idx >= 0) {
      $('pier-hint').textContent = t('pier.hintHotspot');
      sfxClick();
    }
  });

  $('btn-sell').addEventListener('click', () => finishCatch('sell'));
  $('btn-keep').addEventListener('click', () => finishCatch('keep'));
  $('btn-trophy')?.addEventListener('click', () => finishCatch('trophy'));
  $('btn-chum')?.addEventListener('click', () => activateChum());
  $('btn-double-rv').addEventListener('click', async () => {
    if (doubleUsed || !pendingCatch) return;
    await runRv(() => {
      pendingCatch.coins *= 2;
      doubleUsed = true;
      $('catch-coins').textContent = `${t('catch.coins')}: ${pendingCatch.coins}`;
      $('btn-double-rv').classList.add('hidden');
    });
  });

  $('btn-fail-ok')?.addEventListener('click', () => resumePier());
  $('btn-retry-rv')?.addEventListener('click', async () => {
    hidePierToast();
    await runRv(() => {
      $('pier-hint').textContent = t('pier.hintCast');
      sfxClick();
    });
  });

  $('btn-iap-rod-skin').addEventListener('click', () => buyRodSkin());
  $('btn-bait-rv').addEventListener('click', async () => {
    await runRv(() => {
      if (!save.ownedBaits.includes('worm')) save.ownedBaits.push('worm');
      save.baitId = 'worm';
      persist(true);
      renderShop();
    });
  });

  $('btn-sound-toggle').addEventListener('click', () => {
    save.soundOn = !save.soundOn;
    applySoundPref();
    persist(true);
    renderSettings();
  });
  $('btn-lang-ru').addEventListener('click', () => {
    save.uiLang = 'ru';
    setLang('ru');
    applyI18n();
    persist(true);
    renderSettings();
    refreshMenu();
  });
  $('btn-lang-en').addEventListener('click', () => {
    save.uiLang = 'en';
    setLang('en');
    applyI18n();
    persist(true);
    renderSettings();
    refreshMenu();
  });

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('input, textarea')) return;
    e.preventDefault();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      setMuted(true);
      gameplayStop();
      fishing?.setPaused(true);
      persist(true);
    } else {
      applySoundPref();
      if (save.soundOn) resumeAudio();
      if (currentScreen === 'pier') {
        fishing?.setPaused(false);
        gameplayStart();
      }
    }
  });

  window.addEventListener('resize', () => {
    scene?.resize();
    if (currentScreen === 'menu') drawMenuBackdrop($('menu-canvas'), menuT);
  });
}

async function boot() {
  if (layout === 'desktop') document.body.classList.add('shot-desktop');

  const ysdk = await initYandexSdk();
  initI18n(ysdk?.environment?.i18n?.lang || 'ru');
  flushCloud = createCloudFlusher(getPlayer);
  save = await mergeCloud(getPlayer());
  if (save.uiLang === 'ru' || save.uiLang === 'en') setLang(save.uiLang);
  applyI18n();
  applySoundPref();
  ensureGoals(save);
  if (!save.sessionStart) save.sessionStart = Date.now();
  if (!save.weatherId) save.weatherId = 'cloudy';
  if (!save.hookId) save.hookId = 'hook_s';
  if (!save.lineId) save.lineId = 'line_thin';
  if (!save.trophyWall) save.trophyWall = Array(6).fill(null);
  if (!save.quests) save.quests = { index: 0, done: {} };
  if (!save.flags) save.flags = {};
  syncQuestProgress();
  persist(true);

  const canvas = $('game-canvas');
  scene = createScene(canvas);
  fishing = createFishingController({
    scene,
    getSave: () => save,
    getTod: currentTod,
    isLucky,
    onCatch: (info) => openCatchCard(info),
    onFail: (reason) => openFail(reason),
    onHint: (key) => { $('pier-hint').textContent = t(key); },
    onCastDone: () => {
      advanceTodMaybe();
      syncQuestProgress();
      persist(true);
      refreshHud();
    },
    ui: {
      castBtn: $('btn-cast'),
      hookBtn: $('btn-hook'),
      castUi: $('cast-ui'),
      fightUi: $('fight-ui'),
      castFill: $('cast-fill'),
      fightNeedle: $('fight-needle'),
      fightProgress: $('fight-progress-fill'),
      fightGreen: $('fight-green'),
      tackleBar: $('tackle-bar'),
      chumBtn: $('btn-chum'),
    },
  });

  bindUi();
  preloadFishPhotos();
  document.addEventListener('quietcove:fishpic', () => {
    if (currentScreen === 'aquarium') renderAquarium();
    if (currentScreen === 'trophies') renderTrophies();
    if (currentScreen === 'journal') renderJournal();
    if (currentScreen === 'catch' && pendingCatch?.fish) {
      drawFishArt($('catch-fish-canvas'), pendingCatch.fish);
    }
  });
  await syncPurchases();
  loadingReady();

  if (shot) {
    if (shot === 'menu') showScreen('menu');
    else if (shot === 'settings' || shot === 'journal' || shot === 'shop') showScreen(shot);
    else openPier();
    applyShotOverride();
  } else {
    showScreen('menu');
  }

  window.__quietCove = { save, getYsdk, discoveredCount: () => discoveredCount(save) };
}

boot();
