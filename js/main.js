import { applyI18n, fishName, getLang, initI18n, setLang, t } from './i18n.js';
import {
  AQUARIUM_SLOTS,
  TROPHY_SLOTS,
  BAITS,
  BACKGROUNDS,
  BOBBERS,
  FISH,
  GROUNDBAITS,
  HOOKS,
  LINES,
  NETS,
  RODS,
  SPOTS,
  TOD_CYCLE,
  WEATHERS,
  baitFitsRod,
  biteActivity,
  avgWeight,
  fishAtSpot,
  fishHintLine,
  getBait,
  getBobber,
  getGroundbait,
  getHook,
  getLine,
  getNet,
  getRod,
  getSpot,
  getWeather,
  netScoopThreshold,
  sellValue,
  starRating,
  weightVsAvg,
  worldRecordWeight,
  zoneLabel,
} from './data/fish.js';
import {
  addBaitPack,
  anglerRank,
  baitCharges,
  createCloudFlusher,
  ensureBaitStock,
  ensureLoadouts,
  isFreeBait,
  loadLocal,
  mergeCloud,
  rankXpProgress,
  saveLocal,
  syncSaveFromEditLoadout,
  writeEditLoadoutFromSave,
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
import { createScene, drawMenuBackdrop, drawSpotThumb } from './fishing/scene.js?v=0.5.20.0';
import { createFishingController } from './fishing/loop.js?v=0.5.20.0';
import { drawFishArt, drawFishCard } from './fishArt.js';
import { achievementIcon, itemIcon, loadoutIcon, MENU_TIPS_EN, MENU_TIPS_RU, shopIcon, tabIcon } from './uiIcons.js';
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
import { FRIENDS, getFriend, bestFriendRecord } from './meta/friends.js';
import { coveFeed, COVE_EMOTES, friendReply, pierActivityFeed } from './meta/coveSocial.js';

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
  profile: $('profile'),
  friends: $('friends'),
  inventory: $('inventory'),
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
let menuResizeBound = false;
let fromPierNav = false;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const layout = params.get('layout');

function persist(immediate = false) {
  writeEditLoadoutFromSave(save);
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
      el.innerHTML = `<strong>${t('quest.current')}</strong><span class="pq-desc">${t('quest.done')}</span>`;
      el.classList.add('done');
      return;
    }
    el.classList.remove('done');
    const name = getLang() === 'en' ? q.nameEn : q.nameRu;
    const desc = getLang() === 'en' ? q.descEn : q.descRu;
    el.innerHTML = `<strong>${t('quest.current')}</strong><span class="pq-name">${name}</span><span class="pq-desc">${desc}</span>`;
  };
  fill($('menu-quest'));
  fill($('pier-quest'));
}

function refreshHud() {
  $('hud-coins').textContent = String(save.coins);
  if ($('hud-rank-label')) {
    $('hud-rank-label').textContent = `${t('hud.rank')} ${anglerRank(save.xp)}`;
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
  scene?.setRodId?.(save.rodId);
  scene?.setRodKind?.(getRod(save.rodId).kind);
  const weather = getWeather(save.weatherId || 'cloudy');
  const act = biteActivity(weather.id, currentTod());
  const weatherName = getLang() === 'en' ? weather.nameEn : weather.nameRu;
  if ($('hud-weather')) $('hud-weather').textContent = weatherName;
  if ($('hud-weather-top')) $('hud-weather-top').textContent = weatherName;
  const actPct = Math.round(Math.min(1, act) * 100);
  if ($('activity-fill')) $('activity-fill').style.width = `${actPct}%`;
  if ($('activity-pct')) $('activity-pct').textContent = `${t('pier.biteActivity') || 'Клёв'} ${actPct}%`;
  if ($('hud-line-wear')) {
    const wear = Math.round((save.lineWear || 0) * 100);
    const el = $('hud-line-wear');
    el.textContent = wear > 0 ? `${t('pier.lineWear')}: ${wear}%` : '';
    el.title = wear > 0 ? `${t('pier.lineWear')}: ${wear}%` : '';
    el.classList.toggle('hidden', wear <= 0);
    document.querySelector('.wear-sep')?.classList.toggle('hidden', wear <= 0);
  }
  updateChumBtn();
  renderGoals();
  renderTackle();
  renderMenuQuest();
  const hb = $('btn-hold-bite');
  if (hb) hb.textContent = `${t('pier.holdBite')} (${save.biteHold || 0})`;
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
  } else {
    ['menu-collection-panel', 'menu-quests-panel', 'menu-more-panel'].forEach((id) => {
      $(id)?.classList.add('hidden');
    });
  }
  if (name === 'journal') renderJournal();
  if (name === 'aquarium') renderAquarium();
  if (name === 'trophies') renderTrophies();
  if (name === 'shop') renderShop();
  if (name === 'settings') renderSettings();
  if (name === 'spots') renderSpots();
  if (name === 'achievements') renderAchievements();
  if (name === 'records') renderRecords();
  if (name === 'profile') renderProfile();
  if (name === 'friends') renderFriends();
  if (name === 'inventory') renderInventory();
}

function startMenuAnim() {
  stopMenuAnim();
  const canvas = $('menu-canvas');
  if (!canvas) return;
  syncMenuLayout();
  const redraw = () => {
    if (currentScreen === 'menu') drawMenuBackdrop(canvas);
  };
  redraw();
  if (!menuResizeBound) {
    menuResizeBound = true;
    window.addEventListener('resize', () => {
      if (currentScreen === 'menu') {
        syncMenuLayout();
        drawMenuBackdrop($('menu-canvas'));
      }
    });
  }
  // one extra paint after layout settles
  menuRaf = requestAnimationFrame(redraw);
}

function syncMenuLayout() {
  const menu = $('menu');
  const app = $('app');
  if (!menu || !app) return;
  menu.classList.toggle('menu-mobile-layout', app.clientWidth < 700);
}

function stopMenuAnim() {
  cancelAnimationFrame(menuRaf);
  menuRaf = 0;
}

function touchDailyStreak() {
  const day = Math.floor(Date.now() / 86_400_000);
  if (save.lastLoginDay === day) return false;
  if (save.lastLoginDay === day - 1) save.dailyStreak = (save.dailyStreak || 0) + 1;
  else save.dailyStreak = 1;
  save.lastLoginDay = day;
  const bonus = Math.min(80, 8 + save.dailyStreak * 6);
  save.coins = (save.coins || 0) + bonus;
  save.xp = (save.xp || 0) + Math.min(40, 4 + save.dailyStreak * 3);
  save.dailyBonusToday = bonus;
  return true;
}

function nextUnlockHint() {
  const rank = anglerRank(save.xp);
  const nextSpot = SPOTS.find((s) => !s.unlockAds && (s.unlockRank || 1) > rank);
  const lockedFish = FISH.filter((f) => !save.journal?.[f.id]);
  const near = lockedFish
    .map((f) => ({ f, ur: f.unlockRank || 1 }))
    .filter((x) => x.ur <= rank + 1)
    .sort((a, b) => a.ur - b.ur)[0];
  if (nextSpot && nextSpot.unlockRank === rank + 1) {
    return getLang() === 'en'
      ? `Next spot at rank ${nextSpot.unlockRank}: ${nextSpot.nameEn}`
      : `След. место на ранге ${nextSpot.unlockRank}: ${nextSpot.nameRu}`;
  }
  if (near) {
    return getLang() === 'en'
      ? `Near unlock: keep casting (rank ${near.ur}+)`
      : `Близко к новому виду — ловите дальше (ранг ${near.ur}+)`;
  }
  const q = currentQuest(save);
  if (q) return getLang() === 'en' ? `Quest: ${q.nameEn}` : `Задание: ${q.nameRu}`;
  return getLang() === 'en' ? 'Explore new spots and fill the journal' : 'Открывайте места и заполняйте журнал';
}

function refreshMenuMotivate() {
  const el = $('menu-motivate');
  if (!el) return;
  const streak = save.dailyStreak || 0;
  const bonus = save.dailyBonusToday || 0;
  const streakLine = streak > 0
    ? (getLang() === 'en'
      ? `Day streak ×${streak}${bonus ? ` · +${bonus} today` : ''}`
      : `Серия дней ×${streak}${bonus ? ` · сегодня +${bonus}` : ''}`)
    : (getLang() === 'en' ? 'Start a daily streak' : 'Начните дневную серию');
  el.innerHTML = `
    <div class="motivate-row"><strong>${streakLine}</strong></div>
    <div class="motivate-row soft">${nextUnlockHint()}</div>`;
}

function refreshMenu() {
  $('menu-coins').textContent = String(save.coins);
  if ($('menu-combo')) $('menu-combo').textContent = String(save.bestCombo || 0);
  $('menu-rank').textContent = String(anglerRank(save.xp));
  if ($('menu-streak')) $('menu-streak').textContent = String(save.dailyStreak || 0);
  const found = discoveredCount(save);
  if ($('menu-collection')) $('menu-collection').textContent = `${found}/${FISH.length}`;
  if ($('menu-collection-fill')) $('menu-collection-fill').style.width = `${Math.round((found / FISH.length) * 100)}%`;
  if ($('menu-collection-fill-lab')) $('menu-collection-fill-lab').textContent = `${found}/${FISH.length}`;
  const spot = getSpot(save.spotId);
  $('menu-spot-chip').textContent = getLang() === 'en' ? spot.nameEn : spot.nameRu;
  $('menu-tod-chip').textContent = t(`pier.tod.${currentTod()}`);
  refreshMenuTip();
  refreshMenuMotivate();
  renderMenuQuest();
}

function toggleMenuPanel(id) {
  ['menu-collection-panel', 'menu-quests-panel', 'menu-more-panel'].forEach((pid) => {
    const el = $(pid);
    if (!el) return;
    if (pid === id) el.classList.toggle('hidden');
    else el.classList.add('hidden');
  });
}

function updateChumBtn() {
  const btn = $('btn-chum');
  if (!btn) return;
  const active = save.activeChum;
  if (active?.left > 0) {
    const g = getGroundbait(active.id);
    const full = g ? (getLang() === 'en' ? g.nameEn : g.nameRu) : t('pier.chum');
    const short = (full || '').split(/[\s/-]/)[0] || t('pier.chum');
    btn.textContent = `${short} ×${active.left}`;
    btn.title = `${full} · ${active.left}`;
    btn.classList.add('active');
  } else {
    btn.textContent = t('pier.chumShort') || t('pier.chum');
    btn.title = t('pier.chum');
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
  row.classList.add('gear-row-rich');
  ensureLoadouts(save);
  syncSaveFromEditLoadout(save);

  const addSlot = ({ kind, icoHtml, lab, sub, active, onClick, tone, disabled }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `gear-chip tone-${tone || kind}${active ? ' active' : ''}${disabled ? ' dim' : ''}`;
    btn.disabled = !!disabled;
    btn.innerHTML = `<span class="g-ico">${icoHtml}</span><span class="g-text"><span class="g-lab">${lab}</span><span class="g-sub">${sub || ''}</span></span>`;
    btn.addEventListener('click', () => {
      if (disabled) return;
      // Always allow switching rod slots (RF4); block only mid fight/power/bite for gear parts
      if (kind !== 'loadout') {
        if (fishing?.isBusy() && fishing?.getPhase() !== 'wait' && fishing?.getPhase() !== 'idle') return;
      } else if (fishing?.getPhase() === 'fight' || fishing?.getPhase() === 'bite' || fishing?.getPhase() === 'power') {
        return;
      }
      onClick();
      sfxClick();
    });
    row.appendChild(btn);
  };

  const slots = Math.max(2, Math.min(3, save.rodSlots || 2));
  const usedIdx = new Set(fishing?.usedLoadoutIndexes?.() || []);
  for (let i = 0; i < slots; i++) {
    const L = save.loadouts[i] || save.loadouts[0];
    const r = getRod(L?.rodId || 'reed');
    const bait = getBait(L?.baitId || 'bread');
    const inWater = usedIdx.has(i);
    const rodLab = (getLang() === 'en' ? r.nameEn : r.nameRu).split(' ')[0];
    const baitLab = (getLang() === 'en' ? bait.nameEn : bait.nameRu).split(' ')[0];
    addSlot({
      kind: 'loadout',
      tone: 'loadout',
      icoHtml: loadoutIcon(i + 1),
      lab: t('tackle.rodSlot').replace('{n}', String(i + 1)),
      sub: inWater
        ? t('tackle.inWater')
        : `${rodLab} · ${baitLab}`,
      active: save.editLoadout === i,
      onClick: () => {
        writeEditLoadoutFromSave(save);
        save.editLoadout = i;
        syncSaveFromEditLoadout(save);
        scene?.setRodId?.(save.rodId);
        scene?.setRodKind?.(getRod(save.rodId).kind);
        scene?.setBobberColor?.(getBobber(save.bobberId).color);
        persist();
        refreshHud();
        fishing?.refreshCastUi?.();
      },
    });
  }
}

function advanceTodMaybe() {
  save.castsTotal = (save.castsTotal || 0) + 1;
  if (save.castsTotal % 5 === 0) {
    // Prefer next period, sometimes jump to a random different one
    if (Math.random() < 0.65) {
      save.todIndex = (save.todIndex + 1) % TOD_CYCLE.length;
    } else {
      let next = save.todIndex;
      while (next === save.todIndex) next = Math.floor(Math.random() * TOD_CYCLE.length);
      save.todIndex = next;
    }
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
  scene.setRodId?.(save.rodId);
  scene.setWeather?.(save.weatherId || 'cloudy');
  scene.resize();
  showScreen('pier');
  // Keep quest collapsed by default — more landscape
  const dock = $('quest-dock');
  const panel = $('quest-panel');
  const qBtn = $('btn-quest-toggle');
  dock?.classList.add('collapsed');
  panel?.classList.add('collapsed');
  qBtn?.setAttribute('aria-expanded', 'false');
  refreshHud();
  fishing.start();
  fishing.setPaused(false);
  resumeAudio().then(() => startAmbience());
  showTutorialIfNeeded();
  applyShotOverride();
}

function applyShotOverride() {
  if (!shot) return;
  if (shot === 'menu') showScreen('menu');
  if (shot === 'catch' && FISH[0]) {
    pendingCatch = { fish: FISH[12] || FISH[0], weight: 640, coins: 90, zone: 2, sweet: true, lucky: false, catchClass: 'prize', rodKind: 'float' };
    openCatchCard(pendingCatch, true);
  }
  if (shot === 'trophies') showScreen('trophies');
  if (shot === 'journal') showScreen('journal');
  if (shot === 'shop') showScreen('shop');
  if (shot === 'settings') showScreen('settings');
  if (shot === 'spots') showScreen('spots');
  if (shot === 'achievements') showScreen('achievements');
  if (shot === 'aquarium') showScreen('aquarium');
  if (shot === 'records') showScreen('records');
}

function openCatchCard(info, shotMode = false) {
  pendingCatch = info;
  doubleUsed = false;
  const { fish, weight, coins, sweet, lucky, perfectHook } = info;
  save.combo = (save.combo || 0) + 1;
  if (save.combo > (save.bestCombo || 0)) save.bestCombo = save.combo;
  if (weight > (save.heaviest || 0)) save.heaviest = weight;
  if (fish.rarity === 'legend') {
    save.caughtLegend = true;
    save.legendCount = (save.legendCount || 0) + 1;
  }
  if (!save.spotsCaught) save.spotsCaught = {};
  save.spotsCaught[save.spotId || 'pier'] = true;
  if (perfectHook) save.perfectHooks = (save.perfectHooks || 0) + 1;
  const comboMul = 1 + Math.min(0.5, (save.combo - 1) * 0.08);
  pendingCatch.coins = Math.round(coins * comboMul);
  pendingCatch.comboMul = comboMul;

  if (!save.flags) save.flags = {};
  if (save.spotId !== 'pier') save.flags.caughtOffPier = true;
  if (info.rodKind === 'spin' || info.rodKind === 'bottom') save.flags.caughtAltStyle = true;
  if (fish.rarity === 'epic') save.flags.caughtEpic = true;
  if (fish.rarity === 'rare' || fish.rarity === 'epic' || fish.rarity === 'legend') {
    save.flags.caughtRarePlus = true;
  }
  if (fish.rarity === 'epic' || fish.rarity === 'legend') {
    save.flags.caughtEpicPlus = true;
  }
  if (info.catchClass === 'large' || info.catchClass === 'prize' || info.catchClass === 'trophy') {
    save.flags.caughtLarge = true;
  }
  if (currentTod() === 'night') save.flags.caughtNight = true;
  if ((save.weatherId || '') === 'rain') save.flags.caughtRain = true;

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
  const avg = avgWeight(fish);
  const world = worldRecordWeight(fish);
  const friendRec = bestFriendRecord(fish);
  const vs = weightVsAvg(fish, weight);
  const vsLabel = vs >= 2 ? t('catch.vsPrize') : vs === 1 ? t('catch.vsAbove') : vs < 0 ? t('catch.vsBelow') : t('catch.vsAvg');
  $('catch-meta').textContent = `${t('catch.weight')}: ${weight}g${bestNote} · ${vsLabel}`;
  const cmp = $('catch-compare');
  if (cmp) {
    const friendName = getLang() === 'en' ? friendRec.friend.nameEn : friendRec.friend.nameRu;
    cmp.innerHTML = `
      <span>${t('catch.avg')}: ${avg}g</span>
      <span>${t('catch.world')}: ${world}g</span>
      <span>${t('catch.friendRec').replace('{name}', friendName)}: ${friendRec.weight}g</span>`;
    cmp.classList.remove('hidden');
  }
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

  save.xp = (save.xp || 0) + 16 + stars * 5
    + (fish.rarity === 'legend' ? 45 : fish.rarity === 'epic' ? 28 : fish.rarity === 'rare' ? 14 : 0);
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
  const canTrophy = (cls === 'prize' || cls === 'trophy' || cls === 'large');
  if (canTrophy && !save.trophyWall) save.trophyWall = Array(TROPHY_SLOTS).fill(null);
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
    save.coins += a.reward || 0;
    if (a.xp) save.xp = (save.xp || 0) + a.xp;
    if (a.item?.biteHold) save.biteHold = (save.biteHold || 0) + a.item.biteHold;
    const bits = [`+${a.reward || 0}`];
    if (a.xp) bits.push(`+${a.xp} XP`);
    if (a.item?.biteHold) bits.push(`+${a.item.biteHold} hold`);
    showAchToast(getLang() === 'en' ? a.nameEn : a.nameRu, bits.join(' · '));
  }
}

function showAchToast(name, reward) {
  const el = document.createElement('div');
  el.className = 'toast-ach';
  el.textContent = `${t('achievements.toast')} ${name} · ${reward}`;
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
    if (!save.trophyWall) save.trophyWall = Array(TROPHY_SLOTS).fill(null);
    const idx = save.trophyWall.findIndex((s) => !s);
    if (idx >= 0) {
      save.trophyWall[idx] = { fishId: fish.id, weight, color: fish.color, catchClass: cls || 'prize' };
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
let tutorialStep = 0;

function hidePierToast() {
  const toast = $('pier-toast');
  if (toast) toast.classList.add('hidden');
  if (failToastTimer) {
    clearTimeout(failToastTimer);
    failToastTimer = 0;
  }
}

function renderTutorialStep() {
  const overlay = $('tutorial');
  if (!overlay) return;
  const n = tutorialStep + 1;
  const stepEl = $('tutorial-step');
  const titleEl = $('tutorial-title');
  const textEl = $('tutorial-text');
  if (stepEl) stepEl.textContent = t('tutorial.step').replace('{n}', String(n));
  if (titleEl) titleEl.textContent = t(`tutorial.${n}.title`);
  if (textEl) textEl.textContent = t(`tutorial.${n}.text`);
  const btn = $('btn-tutorial-next');
  if (btn) btn.textContent = n >= 3 ? t('tutorial.done') : t('tutorial.next');
}

function showTutorialIfNeeded() {
  if (save.tutorialDone || shot) {
    $('tutorial')?.classList.add('hidden');
    return;
  }
  tutorialStep = 0;
  renderTutorialStep();
  $('tutorial')?.classList.remove('hidden');
  fishing?.setPaused(true);
}

function advanceTutorial() {
  if (tutorialStep < 2) {
    tutorialStep += 1;
    renderTutorialStep();
    sfxClick();
    return;
  }
  save.tutorialDone = true;
  persist(true);
  $('tutorial')?.classList.add('hidden');
  fishing?.setPaused(false);
  sfxClick();
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
  const textMap = { snap: 'fail.snap', escape: 'fail.escape', miss: 'fail.miss' };
  const titleMap = {
    snap: 'fail.snapTitle',
    escape: 'fail.escapeTitle',
    miss: 'fail.missTitle',
  };
  showPierToast(
    t(titleMap[reason] || 'fail.title'),
    t(textMap[reason] || 'fail.text'),
    { showRv: true, ms: 3400 },
  );
  refreshHud();
  gameplayStart();
}

function openFishDetail(fish, entry = null) {
  if (!fish) return;
  const overlay = $('fish-detail');
  if (!overlay) return;
  const journal = entry || save.journal?.[fish.id] || null;
  const locked = !journal;
  $('fish-detail-name').textContent = locked ? '???' : fishName(fish);
  const rarity = $('fish-detail-rarity');
  rarity.textContent = locked ? t('journal.locked') : t(`rarity.${fish.rarity}`);
  rarity.className = `catch-rarity ${locked ? '' : fish.rarity}`;
  const canvas = $('fish-detail-canvas');
  if (canvas) {
    if (locked) {
      drawFishCard(canvas, { color: '#2a3a48', accent: '#667', shape: 'slim', rarity: 'common' }, 240, 120);
      const ctx = canvas.getContext('2d');
      const tr = ctx.getTransform();
      const w = canvas.width / (tr.a || 1);
      const h = canvas.height / (tr.d || 1);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', w / 2, h / 2 + 16);
    } else {
      drawFishCard(canvas, fish, 240, 120);
    }
  }
  const meta = $('fish-detail-meta');
  if (locked) {
    meta.textContent = t('journal.locked');
  } else {
    const hints = fishHintLine(fish, getLang());
    const friendRec = bestFriendRecord(fish);
    const friendName = getLang() === 'en' ? friendRec.friend.nameEn : friendRec.friend.nameRu;
    const bits = [
      `${t('journal.count')}: ${journal.count}`,
      `${t('journal.best')}: ${journal.best}g`,
      `${t('catch.avg')}: ${avgWeight(fish)}g`,
      `${t('catch.world')}: ${worldRecordWeight(fish)}g`,
      `${t('catch.friendRec').replace('{name}', friendName)}: ${friendRec.weight}g`,
      hints.spots?.length ? `${t('journal.hintSpot')}: ${hints.spots.join(', ')}` : '',
      hints.baits?.length ? `${t('journal.hintBait')}: ${hints.baits.join(', ')}` : '',
      hints.tod?.length ? `${t('journal.hintTod')}: ${hints.tod.map((x) => t(`pier.tod.${x}`)).join(', ')}` : '',
      hints.weather?.length ? `${t('journal.hintWeather')}: ${hints.weather.join(', ')}` : '',
    ].filter(Boolean);
    meta.innerHTML = bits.map((b) => `<span class="detail-line">${b}</span>`).join('');
  }
  const favBtn = $('btn-fish-favorite');
  if (favBtn) {
    const isFav = save.favoriteFishId === fish.id;
    favBtn.classList.toggle('hidden', locked);
    favBtn.textContent = isFav ? t('fish.favoriteOn') : t('fish.favorite');
    favBtn.onclick = () => {
      if (locked) return;
      save.favoriteFishId = isFav ? null : fish.id;
      persist(true);
      openFishDetail(fish, journal);
      if (currentScreen === 'profile') renderProfile();
      sfxClick();
    };
  }
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeFishDetail() {
  const overlay = $('fish-detail');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
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
  const found = FISH.filter((f) => save.journal?.[f.id]).length;
  const head = document.createElement('div');
  head.className = 'collection-banner';
  head.innerHTML = `<strong>${t('journal.progress')}</strong><span>${found}/${FISH.length}</span>`;
  list.appendChild(head);

  FISH.filter((fish) => journalFilter === 'all' || fish.rarity === journalFilter).forEach((fish) => {
    const entry = save.journal[fish.id];
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `list-item list-btn journal-card${entry ? '' : ' locked'} rarity-${fish.rarity}`;
    const sw = document.createElement('div');
    sw.className = 'fish-thumb fish-thumb-lg';
    const c = document.createElement('canvas');
    sw.appendChild(c);
    if (entry) drawFishCard(c, fish, 96, 56);
    else {
      drawFishCard(c, { color: '#2a3a48', accent: '#556', shape: fish.shape || 'slim', rarity: 'common' }, 96, 56);
      const ctx = c.getContext('2d');
      const tr = ctx.getTransform();
      const cw = c.width / (tr.a || 1);
      const ch = c.height / (tr.d || 1);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', cw / 2, ch / 2 + 10);
    }
    const meta = document.createElement('div');
    meta.className = 'meta';
    if (entry) {
      const hints = fishHintLine(fish, getLang());
      const todLabels = (hints.tod || []).map((x) => t(`pier.tod.${x}`)).join(', ');
      meta.innerHTML = `
        <div class="journal-title-row"><strong>${fishName(fish)}</strong><em class="rarity-pill ${fish.rarity}">${t(`rarity.${fish.rarity}`)}</em></div>
        <span class="journal-stats">${t('journal.count')}: ${entry.count} · ${t('journal.best')}: ${entry.best}g</span>
        <span class="hint-line">${hints.spots?.length ? `${t('journal.hintSpot')}: ${hints.spots.join(', ')}` : ''}</span>
        <span class="hint-line">${hints.baits?.length ? `${t('journal.hintBait')}: ${hints.baits.join(', ')}` : ''}</span>
        <span class="hint-line">${todLabels ? `${t('journal.hintTod')}: ${todLabels}` : ''}</span>
        <span class="hint-line">${hints.weather?.length ? `${t('journal.hintWeather')}: ${hints.weather.join(', ')}` : ''}</span>
        <span class="hint-line">${t('catch.avg')}: ${avgWeight(fish)}g · ${t('journal.best')}: ${entry.best}g</span>`;
    } else {
      meta.innerHTML = `<strong>???</strong><span>${t('journal.locked')}</span><span class="hint-line">${t('journal.lockedHint')}</span>`;
    }
    row.append(sw, meta);
    row.addEventListener('click', () => { openFishDetail(fish, entry); sfxClick(); });
    list.appendChild(row);
  });
}

function renderAquarium() {
  const grid = $('tank-grid');
  grid.innerHTML = '';
  grid.className = 'tank-list tank-list-tall';
  const note = $('aquarium-note') || document.querySelector('#aquarium .panel-note');
  const filled = (save.aquarium || []).filter(Boolean).length;
  if (note) note.textContent = `${t('aquarium.note')} · ${filled}/${AQUARIUM_SLOTS}`;

  for (let i = 0; i < AQUARIUM_SLOTS; i++) {
    const slot = save.aquarium[i];
    const el = document.createElement('div');
    el.className = `tank-row${slot ? ' filled' : ' empty'}`;
    if (slot) {
      const fish = FISH.find((f) => f.id === slot.fishId);
      const art = document.createElement('div');
      art.className = 'tank-row-art';
      const c = document.createElement('canvas');
      art.appendChild(c);
      if (fish) drawFishCard(c, fish, 72, 40);
      const meta = document.createElement('div');
      meta.className = 'tank-row-meta';
      const cls = slot.catchClass ? t(`catch.class.${slot.catchClass}`) : '';
      meta.innerHTML = `<strong>${fish ? fishName(fish) : '—'}</strong><span>${slot.weight}g${cls ? ` · ${cls}` : ''}${fish ? ` · ${t('catch.avg')} ${avgWeight(fish)}g` : ''}</span>`;
      const actions = document.createElement('div');
      actions.className = 'tank-row-actions';
      const detailBtn = document.createElement('button');
      detailBtn.type = 'button';
      detailBtn.className = 'btn btn-soft tank-mini';
      detailBtn.textContent = 'i';
      detailBtn.title = t('aquarium.card');
      detailBtn.addEventListener('click', () => {
        if (fish) openFishDetail(fish, save.journal?.[fish.id]);
        sfxClick();
      });
      const sellBtn = document.createElement('button');
      sellBtn.type = 'button';
      sellBtn.className = 'btn btn-primary tank-mini';
      const coins = fish ? sellValue(fish, slot.weight) : 1;
      sellBtn.textContent = `+${coins}`;
      sellBtn.addEventListener('click', () => {
        save.coins += coins;
        save.aquarium[i] = null;
        persist(true);
        renderAquarium();
        refreshMenu();
        sfxClick();
      });
      const releaseBtn = document.createElement('button');
      releaseBtn.type = 'button';
      releaseBtn.className = 'btn btn-soft tank-mini';
      releaseBtn.textContent = '↩';
      releaseBtn.title = t('aquarium.release');
      releaseBtn.addEventListener('click', () => {
        save.aquarium[i] = null;
        persist(true);
        renderAquarium();
        sfxClick();
      });
      actions.append(detailBtn, sellBtn, releaseBtn);
      el.append(art, meta, actions);
    } else {
      el.innerHTML = `<span class="tank-row-empty">${t('aquarium.empty')} #${i + 1}</span>`;
    }
    grid.appendChild(el);
  }
}

function renderTrophies() {
  const grid = $('trophy-grid');
  if (!grid) return;
  if (!save.trophyWall) save.trophyWall = Array(TROPHY_SLOTS).fill(null);
  while (save.trophyWall.length < TROPHY_SLOTS) save.trophyWall.push(null);
  grid.innerHTML = '';
  grid.className = 'tank-list trophy-list tank-list-tall';
  for (let i = 0; i < TROPHY_SLOTS; i++) {
    const slot = save.trophyWall[i];
    const el = document.createElement('div');
    el.className = `tank-row trophy-row${slot ? ' filled' : ' empty'}`;
    if (slot) {
      const fish = FISH.find((f) => f.id === slot.fishId);
      const art = document.createElement('div');
      art.className = 'tank-row-art';
      const c = document.createElement('canvas');
      art.appendChild(c);
      if (fish) drawFishCard(c, fish, 72, 40);
      const meta = document.createElement('div');
      meta.className = 'tank-row-meta';
      const cls = slot.catchClass ? t(`catch.class.${slot.catchClass}`) : '';
      meta.innerHTML = `<strong>${fish ? fishName(fish) : '—'}</strong><span>${slot.weight}g${cls ? ` · ${cls}` : ''}</span>`;
      const actions = document.createElement('div');
      actions.className = 'tank-row-actions';
      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'btn btn-soft tank-mini';
      openBtn.textContent = 'i';
      openBtn.addEventListener('click', () => {
        if (fish) openFishDetail(fish, save.journal?.[fish.id]);
        sfxClick();
      });
      const rem = document.createElement('button');
      rem.type = 'button';
      rem.className = 'btn btn-soft tank-mini';
      rem.textContent = '×';
      rem.title = t('trophies.remove');
      rem.addEventListener('click', () => {
        save.trophyWall[i] = null;
        persist(true);
        renderTrophies();
        sfxClick();
      });
      actions.append(openBtn, rem);
      el.append(art, meta, actions);
    } else {
      el.innerHTML = `<span class="tank-row-empty">${t('trophies.empty')} · ${t('trophies.emptyHint')}</span>`;
    }
    grid.appendChild(el);
  }
}

function itemTitle(item) {
  return getLang() === 'en' ? item.nameEn : item.nameRu;
}

/** Human-readable stats for shop / inventory “info” sheets */
function itemInfoLines(kind, item) {
  const en = getLang() === 'en';
  const lines = [];
  if (!item) return lines;
  if (kind === 'rod') {
    lines.push(en
      ? `Style: ${rodKindLabel(item.kind)}. Cast reach: ${zoneLabel(item.maxZone, 'en')}.`
      : `Стиль: ${rodKindLabel(item.kind)}. Дальность: ${zoneLabel(item.maxZone, 'ru')}.`);
    lines.push(en
      ? `Hook window ×${item.hookWindow} · Line stock ${Math.round((item.line || 0.8) * 100)}% · Wait ×${item.waitMul} · Fight ×${item.fightMul}`
      : `Окно подсечки ×${item.hookWindow} · Запас лески ${Math.round((item.line || 0.8) * 100)}% · Ожидание ×${item.waitMul} · Вываживание ×${item.fightMul}`);
  } else if (kind === 'bait') {
    const fit = item.forKind === 'any' ? (en ? 'Any rod' : 'Любая снасть')
      : item.forKind === 'float' ? (en ? 'Float rods' : 'Поплавок')
        : item.forKind === 'spin' ? (en ? 'Spinning' : 'Спиннинг')
          : (en ? 'Feeder / bottom' : 'Донка');
    lines.push(en
      ? `Fits: ${fit}. Bite ×${item.biteMul} · Rare chance ×${item.rareMul}`
      : `Для: ${fit}. Клёв ×${item.biteMul} · Редкость ×${item.rareMul}`);
    lines.push(en
      ? 'Match preferred bait in the journal for much better odds.'
      : 'Совпадение с любимой наживкой в журнале сильно повышает шанс.');
  } else if (kind === 'hook') {
    lines.push(en
      ? `Hook-set ×${item.hookMul} · Size bias ×${item.sizeMul}`
      : `Подсечка ×${item.hookMul} · Крупнее рыба ×${item.sizeMul}`);
  } else if (kind === 'line') {
    lines.push(en
      ? `Strength ${Math.round((item.strength || 0.8) * 100)}% · Wear per fight ${(item.wearPerFight * 100).toFixed(1)}%`
      : `Прочность ${Math.round((item.strength || 0.8) * 100)}% · Износ за бой ${(item.wearPerFight * 100).toFixed(1)}%`);
  } else if (kind === 'chum') {
    lines.push(en
      ? `${item.casts} casts · Wait ×${item.waitMul} · Rare ×${item.rareMul}`
      : `${item.casts} заброса · Ожидание ×${item.waitMul} · Редкость ×${item.rareMul}`);
  } else if (kind === 'bobber') {
    lines.push(en ? 'Cosmetic float colour on the pier.' : 'Цвет поплавка на пирсе (косметика).');
  } else if (kind === 'net') {
    const from = Math.round(netScoopThreshold(item) * 100);
    lines.push(en
      ? `Landing net · help −${Math.round((item.help || 0) * 100)}% · scoop from ${from}%`
      : `Сачок · помощь −${Math.round((item.help || 0) * 100)}% · взять с ${from}%`);
  } else {
    lines.push(en ? 'See description in shop.' : 'См. описание в магазине.');
  }
  return lines;
}

function openItemInfo(kind, item) {
  let overlay = $('item-info');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'item-info';
    overlay.className = 'screen overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="modal sheet item-info-sheet">
        <h2 id="item-info-title"></h2>
        <div class="item-info-body" id="item-info-body"></div>
        <button type="button" class="btn btn-soft btn-wide" id="btn-item-info-close">${t('fish.close')}</button>
      </div>`;
    $('app')?.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeItemInfo();
    });
    overlay.querySelector('#btn-item-info-close')?.addEventListener('click', () => closeItemInfo());
  }
  $('item-info-title').textContent = itemTitle(item);
  const body = $('item-info-body');
  body.innerHTML = '';
  itemInfoLines(kind, item).forEach((line) => {
    const p = document.createElement('p');
    p.className = 'item-info-line';
    p.textContent = line;
    body.appendChild(p);
  });
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  sfxClick();
}

function closeItemInfo() {
  const overlay = $('item-info');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

function attachItemInfo(row, kind, item) {
  if (!row || !item) return;
  row.classList.add('has-info');
  row.title = t('shop.itemInfo');
  const infoBtn = document.createElement('button');
  infoBtn.type = 'button';
  infoBtn.className = 'btn btn-soft shop-info-btn';
  infoBtn.textContent = 'i';
  infoBtn.setAttribute('aria-label', t('shop.itemInfo'));
  infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openItemInfo(kind, item);
  });
  row.appendChild(infoBtn);
}

function shopIco(kind, id) {
  const el = document.createElement('div');
  el.className = `shop-ico tone-${kind}`;
  el.innerHTML = id ? itemIcon(kind, id) : shopIcon(kind);
  return el;
}

function appendShopRow(parent, { kind, id, title, meta, btn }) {
  const row = document.createElement('div');
  row.className = 'shop-item';
  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<strong>${title}</strong><span>${meta}</span>`;
  row.append(shopIco(kind, id), info, btn);
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
  ensureLoadouts(save);
  syncSaveFromEditLoadout(save);
  bindSheetTabs('shop-tabs', [
    ['rods', 'shop.tab.rods', 'rods'],
    ['baits', 'shop.tab.baits', 'baits'],
    ['gear', 'shop.tab.gear', 'gear'],
    ['chum', 'shop.tab.chum', 'chum'],
    ['extra', 'shop.tab.extra', 'extra'],
  ], 'shopPane', (pane) => {
    document.querySelectorAll('#shop [data-shop-pane]').forEach((el) => {
      el.classList.toggle('hidden', el.getAttribute('data-shop-pane') !== pane);
    });
  });
  decorateShopHeaders();
  $('shop-coins').textContent = String(save.coins);

  // Equip target: which rod slot receives shop purchases
  let rigBar = $('shop-rig-bar');
  if (!rigBar) {
    rigBar = document.createElement('div');
    rigBar.id = 'shop-rig-bar';
    rigBar.className = 'shop-rig-bar';
    const coins = $('shop-coins')?.closest('.coin-line');
    coins?.after(rigBar);
  }
  const slots = Math.max(2, Math.min(3, save.rodSlots || 2));
  rigBar.innerHTML = `<span class="shop-rig-lab">${t('shop.equipTo')}</span>`;
  for (let i = 0; i < slots; i++) {
    const L = save.loadouts[i] || save.loadouts[0];
    const r = getRod(L?.rodId || 'reed');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `shop-rig-chip${save.editLoadout === i ? ' on' : ''}`;
    btn.innerHTML = `<strong>#${i + 1}</strong><span>${(getLang() === 'en' ? r.nameEn : r.nameRu).split(' ')[0]}</span>`;
    btn.addEventListener('click', () => {
      writeEditLoadoutFromSave(save);
      save.editLoadout = i;
      syncSaveFromEditLoadout(save);
      persist(true);
      renderShop();
      sfxClick();
    });
    rigBar.appendChild(btn);
  }

  const rodsEl = $('shop-rods');
  rodsEl.innerHTML = '';
  const shopRank = anglerRank(save.xp);
  RODS.forEach((rod) => {
    const owned = save.ownedRods.includes(rod.id);
    const locked = !owned && (rod.unlockRank || 1) > shopRank;
    const equipped = save.rodId === rod.id;
    const row = document.createElement('div');
    row.className = `shop-item shop-card tone-${rod.kind}${equipped ? ' owned' : ''}${locked ? ' locked' : ''}`;
    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `<strong>${itemTitle(rod)}</strong>
      <span class="shop-meta-row">${t('shop.price')}: ${rod.price} · ${rodKindLabel(rod.kind)}</span>
      <span class="shop-meta-row">${t('shop.castRange')}: ${zoneLabel(rod.maxZone, getLang())}</span>
      <span class="shop-meta-row">${t('shop.lineCap')}: ${Math.round((rod.line || 0.8) * 100)}%</span>
      ${locked ? `<span class="shop-meta-row">${t('shop.needRank').replace('{n}', String(rod.unlockRank))}</span>` : ''}`;
    row.appendChild(shopIco('rod', rod.id));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    if (equipped) {
      btn.textContent = t('shop.equipped');
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = t('shop.equipSlot').replace('{n}', String((save.editLoadout || 0) + 1));
      btn.addEventListener('click', () => {
        save.rodId = rod.id;
        if (!baitFitsRod(getBait(save.baitId), rod)) {
          const bait = (save.ownedBaits || []).map(getBait).find((b) => baitFitsRod(b, rod));
          if (bait) save.baitId = bait.id;
        }
        writeEditLoadoutFromSave(save);
        persist(true);
        renderShop();
      });
    } else if (locked) {
      btn.textContent = `${t('hud.rank')} ${rod.unlockRank}`;
      btn.disabled = true;
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
    attachItemInfo(row, 'rod', rod);
    rodsEl.appendChild(row);
  });

  const baitsEl = $('shop-baits');
  baitsEl.innerHTML = '';
  ensureBaitStock(save);
  BAITS.forEach((bait) => {
    const free = isFreeBait(bait.id);
    const charges = baitCharges(save, bait.id);
    const owned = free || charges > 0 || (save.ownedBaits || []).includes(bait.id);
    const locked = !free && !owned && (bait.unlockRank || 1) > shopRank;
    const equipped = save.baitId === bait.id;
    const row = document.createElement('div');
    row.className = `shop-item shop-card${equipped ? ' owned' : ''}${locked ? ' locked' : ''}`;
    const info = document.createElement('div');
    info.className = 'info';
    const kind = bait.forKind && bait.forKind !== 'any' ? t(`tackle.kind.${bait.forKind}`) : t('shop.anyRod');
    const pack = bait.packSize || 15;
    const stockLab = free ? t('shop.baitFree') : `${t('shop.baitLeft')}: ${charges === Infinity ? '∞' : charges}`;
    info.innerHTML = `<strong>${itemTitle(bait)}</strong>
      <span class="shop-meta-row">${free ? t('shop.baitFree') : `${t('shop.price')}: ${bait.price} · ${t('shop.baitPack').replace('{n}', String(pack))}`}</span>
      <span class="shop-meta-row">${kind} · ${stockLab}</span>
      <span class="shop-meta-row">${t('shop.biteMul')}: ×${(bait.biteMul || 1).toFixed(2)} · ${t('shop.rareMul')}: ×${(bait.rareMul || 1).toFixed(2)}</span>
      ${locked ? `<span class="shop-meta-row">${t('shop.needRank').replace('{n}', String(bait.unlockRank))}</span>` : ''}`;
    row.appendChild(shopIco('bait', bait.id));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    if (locked) {
      btn.textContent = `${t('hud.rank')} ${bait.unlockRank}`;
      btn.disabled = true;
      row.append(info, btn);
      attachItemInfo(row, 'bait', bait);
      baitsEl.appendChild(row);
      return;
    }
    if (free) {
      if (equipped) {
        btn.textContent = t('shop.equipped');
        btn.disabled = true;
      } else {
        btn.textContent = t('shop.equipSlot').replace('{n}', String((save.editLoadout || 0) + 1));
        btn.addEventListener('click', () => {
          save.baitId = bait.id;
          writeEditLoadoutFromSave(save);
          persist(true);
          renderShop();
        });
      }
      row.append(info, btn);
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'shop-btn-stack';
      if (owned && charges > 0 && !equipped) {
        const eq = document.createElement('button');
        eq.type = 'button';
        eq.className = 'btn btn-primary';
        eq.textContent = t('shop.equipSlot').replace('{n}', String((save.editLoadout || 0) + 1));
        eq.addEventListener('click', () => {
          save.baitId = bait.id;
          writeEditLoadoutFromSave(save);
          persist(true);
          renderShop();
        });
        wrap.appendChild(eq);
      } else if (equipped) {
        const mark = document.createElement('button');
        mark.type = 'button';
        mark.className = 'btn btn-primary';
        mark.textContent = t('shop.equipped');
        mark.disabled = true;
        wrap.appendChild(mark);
      }
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'btn btn-soft';
      buy.textContent = `${t('shop.buy')} ${bait.price}`;
      buy.addEventListener('click', () => {
        if (save.coins < bait.price) return;
        save.coins -= bait.price;
        addBaitPack(save, bait.id, 1);
        if (!equipped) {
          save.baitId = bait.id;
          writeEditLoadoutFromSave(save);
        }
        persist(true);
        renderShop();
        refreshMenu();
      });
      wrap.appendChild(buy);
      row.append(info, wrap);
    }
    attachItemInfo(row, 'bait', bait);
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
      const locked = !owned && (hook.unlockRank || 1) > shopRank;
      const equipped = save.hookId === hook.id;
      const row = document.createElement('div');
      row.className = `shop-item${equipped ? ' owned' : ''}${locked ? ' locked' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${itemTitle(hook)}</strong><span>${hook.price}${locked ? ` · ${t('shop.needRank').replace('{n}', String(hook.unlockRank))}` : ''}</span>`;
      row.appendChild(shopIco('hook', hook.id));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (equipped) { btn.textContent = t('shop.equipped'); btn.disabled = true; }
      else if (owned) {
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => { save.hookId = hook.id; persist(true); renderShop(); });
      } else if (locked) {
        btn.textContent = `${t('hud.rank')} ${hook.unlockRank}`;
        btn.disabled = true;
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
      attachItemInfo(row, 'hook', hook);
      hooksEl.appendChild(row);
    });
  }

  const linesEl = $('shop-lines');
  if (linesEl) {
    linesEl.innerHTML = '';
    LINES.forEach((line) => {
      if (!save.ownedLines) save.ownedLines = ['line_thin'];
      const owned = save.ownedLines.includes(line.id);
      const locked = !owned && (line.unlockRank || 1) > shopRank;
      const equipped = save.lineId === line.id;
      const row = document.createElement('div');
      row.className = `shop-item${equipped ? ' owned' : ''}${locked ? ' locked' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${itemTitle(line)}</strong><span>${line.price}${locked ? ` · ${t('shop.needRank').replace('{n}', String(line.unlockRank))}` : ''}</span>`;
      row.appendChild(shopIco('line', line.id));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (equipped) { btn.textContent = t('shop.equipped'); btn.disabled = true; }
      else if (owned) {
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => { save.lineId = line.id; save.lineWear = 0; persist(true); renderShop(); });
      } else if (locked) {
        btn.textContent = `${t('hud.rank')} ${line.unlockRank}`;
        btn.disabled = true;
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
      attachItemInfo(row, 'line', line);
      linesEl.appendChild(row);
    });
    if ((save.lineWear || 0) > 0.05) {
      const row = document.createElement('div');
      row.className = 'shop-item';
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${t('shop.repairLine')}</strong><span>280</span>`;
      row.appendChild(shopIco('line'));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-soft';
      btn.textContent = `${t('shop.buy')} 280`;
      btn.addEventListener('click', () => {
        if (save.coins < 280) return;
        save.coins -= 280;
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
      row.appendChild(shopIco('chum', g.id));
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
      attachItemInfo(row, 'chum', g);
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
      row.append(shopIco('bobber', bob.id), sw, info, btn);
      attachItemInfo(row, 'bobber', bob);
      bobEl.appendChild(row);
    });
  }

  const netsEl = $('shop-nets');
  if (netsEl) {
    netsEl.innerHTML = '';
    if (!Array.isArray(save.ownedNets)) save.ownedNets = [];
    NETS.forEach((net) => {
      const owned = save.ownedNets.includes(net.id);
      const locked = !owned && (net.unlockRank || 1) > shopRank;
      const equipped = save.netId === net.id;
      const row = document.createElement('div');
      row.className = `shop-item shop-card${equipped ? ' owned' : ''}${locked ? ' locked' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      const from = Math.round(netScoopThreshold(net) * 100);
      info.innerHTML = `<strong>${itemTitle(net)}</strong>
        <span class="shop-meta-row">${t('shop.price')}: ${net.price} · T${net.tier}</span>
        <span class="shop-meta-row">${t('shop.netHelp')}: −${Math.round(net.help * 100)}% · ${t('shop.netFrom').replace('{n}', String(from))}</span>
        ${locked ? `<span class="shop-meta-row">${t('shop.needRank').replace('{n}', String(net.unlockRank))}</span>` : ''}`;
      row.appendChild(shopIco('net', net.id));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (equipped) {
        btn.textContent = t('shop.equipped');
        btn.disabled = true;
      } else if (owned) {
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => {
          save.netId = net.id;
          persist(true);
          renderShop();
        });
      } else if (locked) {
        btn.textContent = `${t('hud.rank')} ${net.unlockRank}`;
        btn.disabled = true;
      } else {
        btn.textContent = `${t('shop.buy')} ${net.price}`;
        btn.addEventListener('click', () => {
          if (save.coins < net.price) return;
          save.coins -= net.price;
          save.ownedNets.push(net.id);
          save.netId = net.id;
          persist(true);
          renderShop();
          refreshMenu();
        });
      }
      row.append(info, btn);
      attachItemInfo(row, 'net', net);
      netsEl.appendChild(row);
    });
  }


  // progression boosts
  const boostEl = $('shop-boosts');
  if (boostEl) {
    boostEl.innerHTML = '';
    const addBoost = (title, price, owned, onBuy) => {
      const row = document.createElement('div');
      row.className = `shop-item${owned ? ' owned' : ''}`;
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `<strong>${title}</strong><span>${price}</span>`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      if (owned) { btn.textContent = t('shop.owned'); btn.disabled = true; }
      else {
        btn.textContent = `${t('shop.buy')} ${price}`;
        btn.addEventListener('click', () => {
          if (save.coins < price) return;
          save.coins -= price;
          onBuy();
          persist(true);
          renderShop();
          refreshHud();
          sfxClick();
        });
      }
      row.append(shopIco('boosts'), info, btn);
      boostEl.appendChild(row);
    };
    addBoost(t('shop.rodSlot3'), 16500, (save.rodSlots || 2) >= 3, () => { save.rodSlots = 3; claimAchievements(); });
    addBoost(t('shop.biteHoldPack'), 3600, false, () => { save.biteHold = (save.biteHold || 0) + 5; });
    addBoost(t('shop.biteHold'), 900, false, () => { save.biteHold = (save.biteHold || 0) + 1; });
  }

  // Rod skin IAP hidden for now
  $('btn-iap-rod-skin')?.classList.add('hidden');
}


function bindSheetTabs(tabsId, items, storeKey, onSelect) {
  const host = $(tabsId);
  if (!host) return;
  if (!window.__quietTabs) window.__quietTabs = {};
  const cur = window.__quietTabs[storeKey] || items[0][0];
  host.innerHTML = '';
  items.forEach(([id, key, iconId]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sheet-tab${cur === id ? ' on' : ''}`;
    btn.innerHTML = `<span class="sheet-tab-ico" aria-hidden="true">${tabIcon(iconId || id)}</span><span class="sheet-tab-lab">${t(key)}</span>`;
    btn.addEventListener('click', () => {
      window.__quietTabs[storeKey] = id;
      bindSheetTabs(tabsId, items, storeKey, onSelect);
      onSelect(id);
      sfxClick();
    });
    host.appendChild(btn);
  });
  onSelect(cur);
}

function renderInventory() {
  const body = $('inventory-body');
  if (!body) return;
  ensureLoadouts(save);
  syncSaveFromEditLoadout(save);

  const rigBar = $('inv-rig-bar');
  if (rigBar) {
    const slots = Math.max(2, Math.min(3, save.rodSlots || 2));
    rigBar.innerHTML = `<span class="shop-rig-lab">${t('shop.equipTo')}</span>`;
    for (let i = 0; i < slots; i++) {
      const L = save.loadouts[i] || save.loadouts[0];
      const r = getRod(L?.rodId || 'reed');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `shop-rig-chip${save.editLoadout === i ? ' on' : ''}`;
      btn.innerHTML = `<strong>#${i + 1}</strong><span>${(getLang() === 'en' ? r.nameEn : r.nameRu).split(' ')[0]}</span>`;
      btn.addEventListener('click', () => {
        writeEditLoadoutFromSave(save);
        save.editLoadout = i;
        syncSaveFromEditLoadout(save);
        persist(true);
        renderInventory();
        sfxClick();
      });
      rigBar.appendChild(btn);
    }
  }

  const equipToSlot = (apply) => {
    apply();
    writeEditLoadoutFromSave(save);
    persist(true);
    renderInventory();
    refreshHud();
    sfxClick();
  };

  const mkEquipRow = (kind, item, icon, name, meta, equipped, onEquip) => {
    const row = document.createElement('div');
    row.className = `inventory-row inv-equip-row${equipped ? ' equipped' : ''}`;
    const infoBtn = document.createElement('button');
    infoBtn.type = 'button';
    infoBtn.className = 'inv-info-tag';
    infoBtn.textContent = 'i';
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openItemInfo(kind, item);
    });
    const equipBtn = document.createElement('button');
    equipBtn.type = 'button';
    equipBtn.className = 'btn btn-primary inv-equip-btn';
    if (equipped) {
      equipBtn.textContent = t('shop.equipped');
      equipBtn.disabled = true;
    } else if (onEquip) {
      equipBtn.textContent = t('shop.equipSlot').replace('{n}', String((save.editLoadout || 0) + 1));
      equipBtn.addEventListener('click', () => equipToSlot(onEquip));
    } else {
      equipBtn.textContent = '—';
      equipBtn.disabled = true;
    }
    row.innerHTML = `<span class="inv-ico">${icon}</span><div class="meta"><strong>${name}</strong><span>${meta}</span></div>`;
    row.append(infoBtn, equipBtn);
    return row;
  };

  const rods = (save.ownedRods || []).map((id) => {
    const r = getRod(id);
    return mkEquipRow('rod', r, itemIcon('rod', id), itemTitle(r), rodKindLabel(r.kind), save.rodId === id, () => {
      save.rodId = id;
      if (!baitFitsRod(getBait(save.baitId), r)) {
        const bait = (save.ownedBaits || []).map(getBait).find((b) => baitFitsRod(b, r));
        if (bait) save.baitId = bait.id;
      }
    });
  });
  const baits = (save.ownedBaits || [])
    .filter((id) => isFreeBait(id) || baitCharges(save, id) > 0)
    .map((id) => {
      const b = getBait(id);
      const ok = baitFitsRod(b, getRod(save.rodId));
      const left = isFreeBait(id) ? t('shop.baitFree') : `${t('shop.baitLeft')}: ${baitCharges(save, id)}`;
      return mkEquipRow(
        'bait',
        b,
        itemIcon('bait', id),
        itemTitle(b),
        `${left} · ×${b.biteMul}${ok ? '' : ` · ${t('shop.baitMismatch')}`}`,
        save.baitId === id,
        ok ? () => { save.baitId = id; } : null
      );
    });
  const gear = [];
  (save.ownedHooks || []).forEach((id) => {
    const h = getHook(id);
    gear.push(mkEquipRow('hook', h, itemIcon('hook', id), itemTitle(h), `×${h.hookMul}`, save.hookId === id, () => { save.hookId = id; }));
  });
  (save.ownedLines || []).forEach((id) => {
    const L = getLine(id);
    gear.push(mkEquipRow('line', L, itemIcon('line', id), itemTitle(L), `${Math.round(L.strength * 100)}%`, save.lineId === id, () => { save.lineId = id; }));
  });
  (save.ownedBobbers || []).forEach((id) => {
    const b = getBobber(id);
    gear.push(mkEquipRow('bobber', b, itemIcon('bobber', id), itemTitle(b), '', save.bobberId === id, () => { save.bobberId = id; }));
  });
  (save.ownedNets || []).forEach((id) => {
    const n = getNet(id);
    if (!n) return;
    gear.push(mkEquipRow('net', n, itemIcon('net', id), itemTitle(n), `−${Math.round(n.help * 100)}%`, save.netId === id, () => { save.netId = id; }));
  });
  Object.entries(save.ownedGroundbaits || {}).forEach(([id, n]) => {
    if (!n) return;
    const g = getGroundbait(id);
    if (g) {
      gear.push(mkEquipRow('chum', g, itemIcon('chum', id), itemTitle(g), `×${n}`, false, null));
    }
  });

  const panes = { rods, baits, gear };
  bindSheetTabs('inv-tabs', [
    ['rods', 'inv.tab.rods', 'rods'],
    ['baits', 'inv.tab.baits', 'baits'],
    ['gear', 'inv.tab.gear', 'gear'],
  ], 'invPane', (pane) => {
    body.innerHTML = '';
    const rows = panes[pane] || [];
    if (!rows.length) {
      body.innerHTML = `<p class="panel-note">${t('inventory.empty')}</p>`;
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'inventory-section';
    rows.forEach((r) => wrap.appendChild(r));
    body.appendChild(wrap);
  });
  decorateShopHeaders();
}

let browseTab = 'journal';

function setBrowseOpen(open) {
  const panel = $('pier-browse');
  const btn = $('btn-pier-browse');
  if (!panel || !btn) return;
  panel.classList.toggle('hidden', !open);
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  btn.classList.toggle('on', open);
  if (open) renderBrowse();
}

function renderBrowse() {
  const tabs = $('browse-tabs');
  const body = $('browse-body');
  if (!tabs || !body) return;
  const items = [
    ['journal', 'pier.browse.journal', 'journal'],
    ['friends', 'pier.browse.friends', 'friends'],
    ['goals', 'pier.browse.goals', 'goals'],
    ['tips', 'pier.browse.tips', 'tips'],
  ];
  tabs.innerHTML = '';
  items.forEach(([id, key, iconId]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `sheet-tab${browseTab === id ? ' on' : ''}`;
    b.innerHTML = `<span class="sheet-tab-ico" aria-hidden="true">${tabIcon(iconId)}</span><span class="sheet-tab-lab">${t(key)}</span>`;
    b.addEventListener('click', () => { browseTab = id; renderBrowse(); sfxClick(); });
    tabs.appendChild(b);
  });
  body.innerHTML = '';
  if (browseTab === 'journal') {
    const found = Object.keys(save.journal || {});
    if (!found.length) {
      body.innerHTML = `<p class="panel-note">${t('journal.locked')}</p>`;
    } else {
      found.slice(0, 14).forEach((id) => {
        const fish = FISH.find((f) => f.id === id);
        if (!fish) return;
        const entry = save.journal[id];
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'browse-row browse-fish';
        const c = document.createElement('canvas');
        c.className = 'browse-fish-art';
        drawFishCard(c, fish, 64, 36);
        const meta = document.createElement('div');
        meta.className = 'browse-meta';
        meta.innerHTML = `<strong>${fishName(fish)}</strong><span>${entry.count} · ${entry.best}g · ${t(`rarity.${fish.rarity}`)}</span>`;
        row.append(c, meta);
        row.addEventListener('click', () => { openFishDetail(fish, entry); sfxClick(); });
        body.appendChild(row);
      });
    }
  } else if (browseTab === 'friends') {
    const note = document.createElement('p');
    note.className = 'panel-note';
    note.textContent = t('pier.social.note');
    body.appendChild(note);
    pierActivityFeed(save, getLang()).forEach((line) => {
      const row = document.createElement('div');
      row.className = 'browse-row browse-social';
      row.innerHTML = `<strong>${line.name}</strong><span>${line.text}</span>`;
      body.appendChild(row);
    });
    const emotes = document.createElement('div');
    emotes.className = 'pier-social-emotes';
    COVE_EMOTES.forEach((e) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cove-emote';
      btn.textContent = getLang() === 'en' ? e.en : e.ru;
      btn.addEventListener('click', () => {
        save.covePing = getLang() === 'en' ? e.en : e.ru;
        persist();
        renderBrowse();
        sfxClick();
      });
      emotes.appendChild(btn);
    });
    body.appendChild(emotes);
    if (save.covePing) {
      const mine = document.createElement('div');
      mine.className = 'browse-row browse-social mine';
      mine.innerHTML = `<strong>${t('pier.social.you')}</strong><span>${save.covePing}</span>`;
      body.prepend(mine);
    }
  } else if (browseTab === 'goals') {
    ensureGoals(save);
    (save.goals || []).forEach((g) => {
      const row = document.createElement('div');
      row.className = `browse-row browse-goal${g.done ? ' done' : ''}`;
      row.innerHTML = `<span class="browse-ico" aria-hidden="true">${tabIcon('goals')}</span><span>${goalLabel(g)}</span>`;
      body.appendChild(row);
    });
    const q = currentQuest(save);
    if (q) {
      const row = document.createElement('div');
      row.className = 'browse-row quest';
      row.innerHTML = `<span class="browse-ico" aria-hidden="true">${tabIcon('goals')}</span><div class="browse-meta"><strong>${t('quest.current')}</strong><span>${getLang() === 'en' ? q.nameEn : q.nameRu}</span></div>`;
      body.appendChild(row);
    }
  } else {
    const tips = getLang() === 'en' ? MENU_TIPS_EN : MENU_TIPS_RU;
    tips.forEach((tip) => {
      const row = document.createElement('div');
      row.className = 'browse-row browse-tip';
      row.innerHTML = `<span class="browse-ico" aria-hidden="true">${tabIcon('tips')}</span><span>${tip}</span>`;
      body.appendChild(row);
    });
  }
}

function renderSpots() {
  const list = $('spots-list');
  list.innerHTML = '';
  const rank = anglerRank(save.xp);
  if (!save.flags) save.flags = {};
  SPOTS.forEach((spot) => {
    const needsAds = !!spot.unlockAds;
    const adsDone = save.flags.hotcoveAds || 0;
    const adUnlocked = !needsAds || !!save.flags.hotcoveUnlocked;
    const rankOk = rank >= (spot.unlockRank || 1);
    const unlocked = needsAds ? adUnlocked : rankOk;
    const selected = save.spotId === spot.id;
    const row = document.createElement('div');
    row.className = `list-item spot-row spot-card${selected ? ' selected' : ''}${unlocked ? '' : ' locked'}`;
    const thumb = document.createElement('div');
    thumb.className = 'spot-thumb';
    const c = document.createElement('canvas');
    c.width = 112;
    c.height = 84;
    thumb.appendChild(c);
    drawSpotThumb(c, spot.id, Date.now() / 1000);
    if (!unlocked) thumb.classList.add('dim');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = getLang() === 'en' ? spot.nameEn : spot.nameRu;
    const desc = getLang() === 'en' ? spot.descEn : spot.descRu;
    const residents = fishAtSpot(spot.id)
      .filter((f) => (f.unlockRank || 1) <= Math.max(rank + 1, spot.unlockRank || 1))
      .slice(0, 8);
    const fishNames = residents.map((f) => {
      const known = save.journal?.[f.id];
      return known ? fishName(f) : '???';
    }).join(', ');
    let status = unlocked
      ? `${t('spots.rare')}: ×${spot.rareMul} · ${t('spots.wait')}: ×${spot.waitMul || 1}`
      : `${t('spots.needRank')} ${spot.unlockRank}`;
    if (needsAds && !unlocked) {
      const left = Math.max(0, (spot.unlockAds || 5) - adsDone);
      status = t('spots.adsLeft').replace('{n}', String(left));
    }
    const caughtHere = save.spotsCaught?.[spot.id]
      ? t('spots.visited')
      : t('spots.notYet');
    meta.innerHTML = `
      <strong><span class="meta-ico pin" aria-hidden="true">⌖</span> ${title}</strong>
      <span class="spot-desc">${desc || ''}</span>
      <span class="spot-meta">${status}</span>
      <span class="spot-meta">${t('spots.zone')}: ${zoneLabel(spot.zoneBonus || 0, getLang())}</span>
      <span class="spot-fish">${t('spots.fishHere')}: ${fishNames || '—'}</span>
      <span class="spot-meta">${caughtHere}</span>`;
    const actions = document.createElement('div');
    actions.className = 'spot-actions';
    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.className = `btn btn-soft spot-pin${save.pinnedSpotId === spot.id ? ' on' : ''}`;
    pinBtn.textContent = save.pinnedSpotId === spot.id ? t('spots.pinned') : t('spots.pin');
    pinBtn.disabled = !unlocked;
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!unlocked) return;
      save.pinnedSpotId = save.pinnedSpotId === spot.id ? null : spot.id;
      persist(true);
      renderSpots();
      if (currentScreen === 'profile') renderProfile();
      sfxClick();
    });
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${selected ? 'btn-soft' : 'btn-primary'}`;
    if (needsAds && !unlocked) {
      btn.textContent = t('spots.watchAd');
      btn.addEventListener('click', async () => {
        await runRv(() => {
          save.flags.hotcoveAds = (save.flags.hotcoveAds || 0) + 1;
          if (save.flags.hotcoveAds >= (spot.unlockAds || 5)) {
            save.flags.hotcoveUnlocked = true;
            save.spotId = spot.id;
            scene?.setSpot?.(spot.id);
            claimAchievements();
          }
          persist(true);
          renderSpots();
          refreshMenu();
          sfxClick();
        });
      });
    } else if (!unlocked) {
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
    actions.append(pinBtn, btn);
    row.append(thumb, meta, actions);
    list.appendChild(row);
  });
}

function achievementTone(id) {
  if (id.includes('combo') || id.includes('perfect')) return 'fire';
  if (id.includes('collector') || id === 'tank_full' || id.includes('spots') || id === 'hotcove_open') return 'lake';
  if (id.includes('legend') || id.includes('prize') || id.includes('big_') || id === 'epic_first') return 'gold';
  if (id.includes('rank') || id.includes('rich')) return 'moss';
  return 'coral';
}

let achFilter = 'all';

function renderAchievements() {
  const list = $('achievements-list');
  list.innerHTML = '';
  if (!save.achievements) save.achievements = {};
  const rank = anglerRank(save.xp);
  const doneCount = ACHIEVEMENTS.filter((a) => save.achievements[a.id]?.done).length;

  const filters = $('ach-filters');
  if (filters) {
    filters.innerHTML = '';
    [
      ['all', 'achievements.filterAll'],
      ['done', 'achievements.filterDone'],
      ['locked', 'achievements.filterLocked'],
    ].forEach(([id, key]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-chip${achFilter === id ? ' on' : ''}`;
      btn.textContent = t(key);
      btn.addEventListener('click', () => { achFilter = id; renderAchievements(); sfxClick(); });
      filters.appendChild(btn);
    });
  }

  const progress = $('ach-progress');
  if (progress) {
    const pct = Math.round((doneCount / ACHIEVEMENTS.length) * 100);
    progress.innerHTML = `<div class="ach-progress-bar"><i style="width:${pct}%"></i></div><span>${doneCount}/${ACHIEVEMENTS.length}</span>`;
  }

  // Badge strip of unlocked
  const strip = document.createElement('div');
  strip.className = 'ach-badge-strip';
  ACHIEVEMENTS.filter((a) => save.achievements[a.id]?.done).slice(0, 16).forEach((a) => {
    const b = document.createElement('div');
    b.className = `achieve-ico lit tone-${achievementTone(a.id)}`;
    b.title = getLang() === 'en' ? a.nameEn : a.nameRu;
    b.innerHTML = achievementIcon(a.id);
    strip.appendChild(b);
  });
  if (strip.childNodes.length) list.appendChild(strip);

  ACHIEVEMENTS.forEach((a) => {
    const done = !!save.achievements[a.id]?.done;
    const ready = !done && a.check(save, FISH.length, rank);
    if (achFilter === 'done' && !done) return;
    if (achFilter === 'locked' && done) return;
    const row = document.createElement('div');
    row.className = `achieve-row${done ? ' done' : ''}${ready ? ' ready' : ''}`;
    const ico = document.createElement('div');
    ico.className = `achieve-ico tone-${achievementTone(a.id)}${done ? ' lit' : ''}`;
    ico.innerHTML = achievementIcon(a.id);
    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = getLang() === 'en' ? a.nameEn : a.nameRu;
    const desc = getLang() === 'en' ? a.descEn : a.descRu;
    const status = done ? t('achievements.done') : ready ? t('achievements.ready') : t('achievements.locked');
    const rewardBits = [`+${a.reward}`];
    if (a.xp) rewardBits.push(`+${a.xp} XP`);
    if (a.item?.biteHold) rewardBits.push(`hold×${a.item.biteHold}`);
    meta.innerHTML = `<div class="ach-title-row"><strong>${name}</strong><em class="ach-cat">${t(`achievements.cat.${a.cat || 'meta'}`)}</em></div><span class="ach-desc">${desc}</span><span class="ach-meta">${rewardBits.join(' · ')} · ${status}</span>`;
    row.append(ico, meta);
    list.appendChild(row);
  });
  claimAchievements();
  persist();
}


function toggleQuestPanel() {
  const dock = $('quest-dock');
  const panel = $('quest-panel');
  const btn = $('btn-quest-toggle');
  if (!btn) return;
  const target = dock || panel;
  if (!target) return;
  target.classList.toggle('collapsed');
  panel?.classList.toggle('collapsed', target.classList.contains('collapsed'));
  const collapsed = target.classList.contains('collapsed');
  btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  sfxClick();
}

function renderProfile() {
  const rank = anglerRank(save.xp);
  const found = discoveredCount(save);
  const ach = Object.keys(save.achievements || {}).filter((k) => save.achievements[k]?.done).length;
  if ($('profile-note')) $('profile-note').textContent = t('profile.note');
  const stats = $('profile-stats');
  if (stats) {
    const cells = [
      ['profile.rank', String(rank), 'goals'],
      ['profile.caught', String(save.totalCaught || 0), 'rods'],
      ['profile.species', `${found}/${FISH.length}`, 'journal'],
      ['profile.heaviest', `${save.heaviest || 0}g`, 'baits'],
      ['profile.combo', `×${save.bestCombo || 0}`, 'boosts'],
      ['profile.casts', String(save.castsTotal || 0), 'gear'],
      ['profile.achievements', String(ach), 'goals'],
      ['profile.perfect', String(save.perfectHooks || 0), 'tips'],
    ];
    stats.innerHTML = cells.map(([k, v, ico]) =>
      `<div class="profile-stat"><span class="profile-stat-ico">${tabIcon(ico)}</span><div><span>${t(k)}</span><strong>${v}</strong></div></div>`
    ).join('');
  }

  const showcase = $('profile-showcase');
  if (showcase) {
    showcase.innerHTML = '';
    const pinSpot = save.pinnedSpotId ? getSpot(save.pinnedSpotId) : null;
    const favFish = save.favoriteFishId ? FISH.find((f) => f.id === save.favoriteFishId) : null;
    const card = document.createElement('div');
    card.className = 'profile-card-grid';
    if (pinSpot) {
      const el = document.createElement('div');
      el.className = 'profile-card';
      const c = document.createElement('canvas');
      c.width = 120;
      c.height = 80;
      drawSpotThumb(c, pinSpot.id, Date.now() / 1000);
      el.innerHTML = `<span class="profile-card-lab">${t('profile.pinnedSpot')}</span>`;
      el.appendChild(c);
      const name = document.createElement('strong');
      name.textContent = getLang() === 'en' ? pinSpot.nameEn : pinSpot.nameRu;
      el.appendChild(name);
      card.appendChild(el);
    } else {
      const el = document.createElement('div');
      el.className = 'profile-card empty';
      el.innerHTML = `<span class="profile-card-lab">${t('profile.pinnedSpot')}</span><p>${t('profile.pinHint')}</p>`;
      card.appendChild(el);
    }
    if (favFish && save.journal?.[favFish.id]) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'profile-card';
      const c = document.createElement('canvas');
      drawFishCard(c, favFish, 160, 84);
      el.innerHTML = `<span class="profile-card-lab">${t('profile.favoriteFish')}</span>`;
      el.appendChild(c);
      const name = document.createElement('strong');
      name.textContent = fishName(favFish);
      el.appendChild(name);
      el.addEventListener('click', () => openFishDetail(favFish, save.journal[favFish.id]));
      card.appendChild(el);
    } else {
      const el = document.createElement('div');
      el.className = 'profile-card empty';
      el.innerHTML = `<span class="profile-card-lab">${t('profile.favoriteFish')}</span><p>${t('profile.favHint')}</p>`;
      card.appendChild(el);
    }
    showcase.appendChild(card);

    const recent = document.createElement('div');
    recent.className = 'profile-recent';
    recent.innerHTML = `<h3 class="shop-h3">${t('profile.recent')}</h3>`;
    const row = document.createElement('div');
    row.className = 'profile-recent-row';
    const top = Object.entries(save.journal || {})
      .map(([id, e]) => ({ fish: FISH.find((f) => f.id === id), e }))
      .filter((x) => x.fish)
      .sort((a, b) => (b.e.best || 0) - (a.e.best || 0))
      .slice(0, 4);
    if (!top.length) {
      recent.innerHTML += `<p class="panel-note">${t('records.empty')}</p>`;
    } else {
      top.forEach(({ fish, e }) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'profile-mini-fish';
        const c = document.createElement('canvas');
        drawFishCard(c, fish, 148, 78);
        b.appendChild(c);
        const lab = document.createElement('span');
        lab.textContent = `${fishName(fish)} · ${e.best}g`;
        b.appendChild(lab);
        b.addEventListener('click', () => { openFishDetail(fish, e); sfxClick(); });
        row.appendChild(b);
      });
      recent.appendChild(row);
    }
    showcase.appendChild(recent);

    const badges = document.createElement('div');
    badges.className = 'profile-badges';
    badges.innerHTML = `<h3 class="shop-h3">${t('profile.badges')}</h3>`;
    const shelf = document.createElement('div');
    shelf.className = 'profile-badge-shelf';
    const done = ACHIEVEMENTS.filter((a) => save.achievements?.[a.id]?.done).slice(0, 8);
    if (!done.length) {
      badges.innerHTML += `<p class="panel-note">${t('achievements.locked')}</p>`;
    } else {
      done.forEach((a) => {
        const el = document.createElement('div');
        el.className = 'profile-badge';
        el.innerHTML = `<div class="achieve-ico tone-${achievementTone(a.id)} lit">${achievementIcon(a.id)}</div><span>${getLang() === 'en' ? a.nameEn : a.nameRu}</span>`;
        shelf.appendChild(el);
      });
      badges.appendChild(shelf);
    }
    showcase.appendChild(badges);
  }

  const notes = $('profile-notes');
  if (notes) {
    const list = [];
    if ((save.totalCaught || 0) < 5) list.push(t('profile.note.early'));
    if (found >= 8) list.push(t('profile.note.collector'));
    if ((save.bestCombo || 0) >= 4 || (save.heaviest || 0) >= 800) list.push(t('profile.note.fighter'));
    if ((save.todIndex || 0) % 4 >= 2) list.push(t('profile.note.night'));
    if (save.caughtLegend) list.push(t('profile.note.legend'));
    if (!list.length) list.push(t('profile.note.early'));
    notes.className = 'profile-notes chips';
    notes.innerHTML = list.map((n) => `<li>${n}</li>`).join('');
  }
}

function renderSettings() {
  const soundBtn = $('btn-sound-toggle');
  soundBtn.textContent = save.soundOn ? 'ON' : 'OFF';
  soundBtn.classList.toggle('on', !!save.soundOn);
  $('btn-lang-ru').classList.toggle('on', getLang() === 'ru');
  $('btn-lang-en').classList.toggle('on', getLang() === 'en');
  const mc = $('btn-multicast-toggle');
  if (mc) {
    mc.textContent = save.multiCast ? 'ON' : 'OFF';
    mc.classList.toggle('on', !!save.multiCast);
  }
}

function renderCoveBoard() {
  const feed = $('cove-feed');
  const emotes = $('cove-emotes');
  if (!feed || !emotes) return;
  feed.innerHTML = '';
  coveFeed(save, getLang()).forEach((line) => {
    const row = document.createElement('div');
    row.className = 'cove-line';
    row.textContent = line;
    feed.appendChild(row);
  });
  if (save.covePing) {
    const mine = document.createElement('div');
    mine.className = 'cove-line mine';
    mine.textContent = save.covePing;
    feed.prepend(mine);
  }
  emotes.innerHTML = '';
  COVE_EMOTES.forEach((e) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cove-emote';
    btn.textContent = getLang() === 'en' ? e.en : e.ru;
    btn.addEventListener('click', () => {
      save.covePing = getLang() === 'en' ? e.en : e.ru;
      persist();
      renderCoveBoard();
      sfxClick();
    });
    emotes.appendChild(btn);
  });
}

function renderFriends() {
  const list = $('friends-list');
  const detail = $('friend-detail');
  if (!list) return;
  list.classList.remove('hidden');
  detail?.classList.add('hidden');
  renderCoveBoard();
  list.innerHTML = '';
  FRIENDS.forEach((f) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'friend-row';
    const name = getLang() === 'en' ? f.nameEn : f.nameRu;
    const note = getLang() === 'en' ? f.noteEn : f.noteRu;
    row.innerHTML = `<div class="friend-ava">${name.slice(0, 1)}</div><div class="meta"><strong>${name}</strong><span>${note}</span><span>${t('friends.rank')} ${f.rank} · ${t('friends.caught')} ${f.totalCaught}</span></div>`;
    row.addEventListener('click', () => {
      sfxClick();
      showFriendDetail(f.id);
    });
    list.appendChild(row);
  });
}

function showFriendDetail(id) {
  const f = getFriend(id);
  const list = $('friends-list');
  const detail = $('friend-detail');
  if (!detail) return;
  list?.classList.add('hidden');
  detail.classList.remove('hidden');
  const name = getLang() === 'en' ? f.nameEn : f.nameRu;
  const note = getLang() === 'en' ? f.noteEn : f.noteRu;
  const top = getLang() === 'en' ? f.topFishEn : f.topFishRu;
  const spot = getLang() === 'en' ? f.spotEn : f.spotRu;
  const reply = friendReply(id, getLang());
  detail.innerHTML = `
    <h3>${name}</h3>
    <p>${note}</p>
    <div class="friend-meta">
      <div>${t('friends.rank')}: <strong>${f.rank}</strong></div>
      <div>${t('friends.caught')}: <strong>${f.totalCaught}</strong></div>
      <div>${t('friends.heaviest')}: <strong>${f.heaviest}g</strong></div>
      <div>${t('friends.combo')}: <strong>×${f.bestCombo}</strong></div>
      <div>${t('friends.species')}: <strong>${f.species}</strong></div>
      <div>${t('friends.achievements')}: <strong>${f.achievements}</strong></div>
      <div>${t('friends.top')}: <strong>${top}</strong></div>
      <div>${t('friends.spot')}: <strong>${spot}</strong></div>
    </div>
    <div class="friend-chat">
      <h4>${t('cove.friendChat')}</h4>
      <p class="cove-line">${reply}</p>
      <div class="cove-emotes" id="friend-emotes"></div>
    </div>
    <button type="button" class="btn btn-soft btn-wide" id="btn-friend-back">${t('friends.back')}</button>
  `;
  const box = detail.querySelector('#friend-emotes');
  COVE_EMOTES.slice(0, 4).forEach((e) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cove-emote';
    btn.textContent = getLang() === 'en' ? e.en : e.ru;
    btn.addEventListener('click', () => {
      const bubble = detail.querySelector('.friend-chat .cove-line');
      if (bubble) bubble.textContent = `${t('cove.you')}: ${getLang() === 'en' ? e.en : e.ru} → ${friendReply(id, getLang())}`;
      sfxClick();
    });
    box?.appendChild(btn);
  });
  detail.querySelector('#btn-friend-back')?.addEventListener('click', () => {
    sfxClick();
    renderFriends();
  });
}

function decorateShopHeaders() {
  document.querySelectorAll('.shop-h3 .shop-head-ico').forEach((el) => {
    if (el.dataset.ready) return;
    const tone = [...el.classList].find((c) => c.startsWith('tone-'))?.replace('tone-', '') || 'rod';
    el.innerHTML = (tone === 'boosts' || tone === 'skin') ? tabIcon('boosts') : shopIcon(tone);
    el.dataset.ready = '1';
  });
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
    row.classList.add('list-btn');
    row.tabIndex = 0;
    row.addEventListener('click', () => { openFishDetail(fish, save.journal?.[fish.id]); sfxClick(); });
    list.appendChild(row);
  });
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
  $('btn-menu-collection')?.addEventListener('click', () => { sfxClick(); toggleMenuPanel('menu-collection-panel'); });
  $('btn-menu-quests')?.addEventListener('click', () => { sfxClick(); toggleMenuPanel('menu-quests-panel'); });
  $('btn-menu-more')?.addEventListener('click', () => { sfxClick(); toggleMenuPanel('menu-more-panel'); });
  $('btn-menu-mobile')?.addEventListener('click', () => { sfxClick(); toggleMenuPanel('menu-more-panel'); });
  $('btn-side-nav-toggle')?.addEventListener('click', () => {
    const nav = $('pier-side-nav');
    const btn = $('btn-side-nav-toggle');
    if (!nav || !btn) return;
    const open = nav.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    sfxClick();
  });
  $('btn-meta-collapse')?.addEventListener('click', () => {
    const panels = $('pier-wear-center');
    const btn = $('btn-meta-collapse');
    if (!panels || !btn) return;
    const collapsed = panels.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    btn.classList.toggle('is-collapsed', collapsed);
    sfxClick();
  });
  $('btn-tutorial-next')?.addEventListener('click', () => advanceTutorial());
  $('btn-fish-detail-close')?.addEventListener('click', () => { closeFishDetail(); sfxClick(); });
  $('fish-detail')?.addEventListener('click', (e) => {
    if (e.target?.id === 'fish-detail') closeFishDetail();
  });
  document.querySelectorAll('.side-nav-btn[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screen = btn.getAttribute('data-screen');
      if (!screen) return;
      fishing?.setPaused(true);
      fishing?.stop();
      activePier = false;
      fromPierNav = true;
      gameplayStop();
      showScreen(screen);
      sfxClick();
    });
  });
  $('side-quests')?.addEventListener('click', () => {
    const dock = $('quest-dock');
    const panel = $('quest-panel');
    const btn = $('btn-quest-toggle');
    const open = dock?.classList.contains('collapsed');
    dock?.classList.toggle('collapsed', !open);
    panel?.classList.toggle('collapsed', !open);
    btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
    sfxClick();
  });
  $('btn-journal').addEventListener('click', () => { sfxClick(); showScreen('journal'); });
  $('btn-aquarium').addEventListener('click', () => { sfxClick(); showScreen('aquarium'); });
  $('btn-trophies')?.addEventListener('click', () => { sfxClick(); showScreen('trophies'); });
  $('btn-shop').addEventListener('click', () => { sfxClick(); showScreen('shop'); });
  $('btn-settings').addEventListener('click', () => { sfxClick(); showScreen('settings'); });
  $('btn-spots').addEventListener('click', () => { sfxClick(); showScreen('spots'); });
  $('btn-spots-quick')?.addEventListener('click', () => { sfxClick(); showScreen('spots'); });
  $('btn-achievements').addEventListener('click', () => { sfxClick(); showScreen('achievements'); });
  $('btn-records').addEventListener('click', () => { sfxClick(); showScreen('records'); });

  $('btn-profile')?.addEventListener('click', () => { fromPierNav = false; sfxClick(); showScreen('profile'); });
  $('btn-friends')?.addEventListener('click', () => { fromPierNav = false; sfxClick(); showScreen('friends'); });
  $('btn-inventory')?.addEventListener('click', () => { fromPierNav = false; sfxClick(); showScreen('inventory'); });
  $('btn-profile-back')?.addEventListener('click', () => { if (fromPierNav) { fromPierNav = false; openPier(); } else showScreen('menu'); });
  $('btn-friends-back')?.addEventListener('click', () => { if (fromPierNav) { fromPierNav = false; openPier(); } else showScreen('menu'); });
  $('btn-inventory-back')?.addEventListener('click', () => { if (fromPierNav) { fromPierNav = false; openPier(); } else showScreen('menu'); });
  // From pier side-nav, back should return to pier
  $('btn-quest-toggle')?.addEventListener('click', () => toggleQuestPanel());
  $('btn-pier-browse')?.addEventListener('click', () => {
    const open = $('pier-browse')?.classList.contains('hidden');
    setBrowseOpen(!!open);
    sfxClick();
  });
  $('btn-browse-close')?.addEventListener('click', () => { setBrowseOpen(false); sfxClick(); });
  $('btn-rig-settings')?.addEventListener('click', () => {
    const panel = $('rig-choice');
    const btn = $('btn-rig-settings');
    if (!panel || !btn) return;
    const open = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    sfxClick();
  });
  $('btn-rig-shop')?.addEventListener('click', () => {
    $('rig-choice')?.classList.add('hidden');
    $('btn-rig-settings')?.setAttribute('aria-expanded', 'false');
    fromPierNav = true;
    sfxClick();
    showScreen('shop');
  });
  $('btn-rig-inventory')?.addEventListener('click', () => {
    $('rig-choice')?.classList.add('hidden');
    $('btn-rig-settings')?.setAttribute('aria-expanded', 'false');
    fromPierNav = true;
    sfxClick();
    showScreen('inventory');
  });

  $('btn-journal-back').addEventListener('click', () => showScreen('menu'));
  $('btn-aquarium-back').addEventListener('click', () => showScreen('menu'));
  $('btn-trophies-back')?.addEventListener('click', () => showScreen('menu'));
  $('btn-shop-back').addEventListener('click', () => { if (fromPierNav) { fromPierNav = false; openPier(); } else showScreen('menu'); });
  $('btn-settings-back').addEventListener('click', () => showScreen('menu'));
  $('btn-spots-back').addEventListener('click', () => { if (fromPierNav) { fromPierNav = false; openPier(); } else showScreen('menu'); });
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
    if (!fishing.canStartCast()) return;
    castBtn.setPointerCapture?.(e.pointerId);
    fishing.startPower();
  });
  const endCast = (e) => {
    e.preventDefault();
    if (fishing.getPhase() !== 'power') return;
    fishing.releaseCast();
  };
  castBtn.addEventListener('pointerup', endCast);
  castBtn.addEventListener('pointercancel', endCast);

  $('btn-hook').addEventListener('click', () => fishing.tryHook());
  $('btn-hold-bite')?.addEventListener('click', () => {
    if (fishing.holdBite()) {
      persist(true);
      const btn = $('btn-hold-bite');
      const n = save.biteHold || 0;
      if (btn) btn.textContent = `${t('pier.holdBite')} (${n})`;
      sfxClick();
    }
  });
  const reel = $('btn-reel');
  reel.addEventListener('pointerdown', (e) => { e.preventDefault(); fishing.setReel(true); });
  const endReel = () => fishing.setReel(false);
  reel.addEventListener('pointerup', endReel);
  reel.addEventListener('pointerleave', endReel);
  reel.addEventListener('pointercancel', endReel);
  $('btn-net-scoop')?.addEventListener('click', () => {
    if (fishing?.tryScoop?.()) sfxClick();
  });

  $('game-canvas').addEventListener('pointerdown', (e) => {
    if (!(fishing?.getPhase() === 'idle' || fishing?.canStartCast?.())) return;
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
      addBaitPack(save, 'worm', 1);
      save.baitId = 'worm';
      writeEditLoadoutFromSave(save);
      persist(true);
      renderShop();
      refreshHud();
    });
  });

  $('btn-sound-toggle').addEventListener('click', () => {
    save.soundOn = !save.soundOn;
    applySoundPref();
    persist(true);
    renderSettings();
  });
  $('btn-multicast-toggle')?.addEventListener('click', () => {
    save.multiCast = !save.multiCast;
    persist(true);
    renderSettings();
    refreshHud();
    sfxClick();
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
    if (currentScreen === 'menu') drawMenuBackdrop($('menu-canvas'));
  });
}

async function boot() {
  if (layout === 'desktop') document.body.classList.add('shot-desktop');

  try {
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
    if (!save.trophyWall) save.trophyWall = Array(TROPHY_SLOTS).fill(null);
    if (!save.quests) save.quests = { index: 0, done: {} };
    if (!save.flags) save.flags = {};
    if (!save.rodSlots) save.rodSlots = 2;
    if (save.biteHold == null) save.biteHold = 0;
    if (!save.spotsCaught) save.spotsCaught = {};
    ensureLoadouts(save);
    if (touchDailyStreak()) syncQuestProgress();
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
        tackleBar: $('tackle-bar') || $('gear-strip'),
        chumBtn: $('btn-chum'),
      },
    });

    bindUi();
    preloadFishPhotos();
    document.addEventListener('quietcove:loadout', () => {
    persist(true);
    refreshHud();
  });

  document.addEventListener('quietcove:fishpic', () => {
      if (currentScreen === 'aquarium') renderAquarium();
      if (currentScreen === 'trophies') renderTrophies();
      if (currentScreen === 'journal') renderJournal();
      if (currentScreen === 'catch' && pendingCatch?.fish) {
        drawFishArt($('catch-fish-canvas'), pendingCatch.fish);
      }
    });
    await syncPurchases();
  } catch (err) {
    console.error('Quiet Cove boot failed', err);
    const sub = $('boot')?.querySelector('.boot-sub');
    if (sub) sub.textContent = getLang() === 'en' ? 'Loading error — tap to retry' : 'Ошибка загрузки — нажмите, чтобы повторить';
    $('boot')?.addEventListener('click', () => location.reload(), { once: true });
    try { loadingReady(); } catch { /* ignore */ }
    return;
  }

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
