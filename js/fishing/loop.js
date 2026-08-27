import {
  baitFitsRod,
  biteActivity,
  biteWaitRange,
  catchClass,
  effectiveLineLimit,
  fightPull,
  getBait,
  getBobber,
  getGroundbait,
  getHook,
  getLine,
  getNet,
  getRod,
  getSpot,
  isSweetCast,
  netScoopThreshold,
  pickFish,
  rollWeight,
  sellValue,
  zoneFromPower,
} from '../data/fish.js?v=0.5.20.0';
import { anglerRank, consumeBaitCharge } from '../save.js';
import { sfxBite, sfxCast, sfxCatch, sfxFail, sfxSplash } from '../audio.js';

export function createFishingController({ scene, getSave, getTod, isLucky, onCatch, onFail, onHint, onCastDone, ui }) {
  let raf = 0;
  let last = 0;
  let running = false;
  let paused = false;

  /** @type {Array<object>} */
  let lines = [];
  let lineSeq = 1;
  let phase = 'idle';
  let holding = false;
  let powerLine = null;

  const els = ui;

  function maxSlots() {
    const save = getSave();
    // Default ON; settings can force single-rod focus
    if (save.multiCast === false) return 1;
    return Math.max(1, Math.min(3, Number(save.rodSlots) || 2));
  }

  function waitHint(rod) {
    if (rod?.kind === 'spin') return 'pier.hintSpin';
    if (rod?.kind === 'bottom') return 'pier.hintBottom';
    return 'pier.hintWait';
  }

  function liveLines() {
    return lines.filter((l) => l.phase !== 'done');
  }

  function focusLine() {
    return liveLines().find((l) => l.phase === 'fight')
      || liveLines().find((l) => l.phase === 'bite')
      || liveLines().find((l) => l.phase === 'power' || l.phase === 'castfly')
      || liveLines().find((l) => l.phase === 'wait')
      || null;
  }

  function canStartCast() {
    if (paused) return false;
    if (liveLines().some((l) => l.phase === 'fight' || l.phase === 'power' || l.phase === 'castfly' || l.phase === 'bite')) {
      return false;
    }
    return liveLines().filter((l) => l.phase === 'wait').length < maxSlots();
  }

  function syncSceneFloats() {
    const focus = focusLine();
    const extras = [];
    const rodLines = [];
    for (const l of liveLines()) {
      const rodVis = {
        x: l.floatX,
        y: l.floatY,
        biteDip: l.biteDip || 0,
        color: l.bobberColor,
        rodId: l.rod?.id || 'reed',
        rodKind: l.rod?.kind || 'float',
        loadoutIndex: l.loadoutIndex || 0,
        phase: l.phase,
        waitTimer: l.waitTimer || 0,
        biteWindow: l.biteWindow || 0,
      };
      if (l.phase === 'wait' || l.phase === 'bite' || l.phase === 'castfly' || l.phase === 'fight' || l.phase === 'power') {
        rodLines.push(rodVis);
      }
      if (focus && l.id === focus.id) continue;
      if (l.phase === 'wait' || l.phase === 'bite' || l.phase === 'castfly') {
        extras.push({
          x: l.floatX,
          y: l.floatY,
          biteDip: l.biteDip || 0,
          color: l.bobberColor,
          rodKind: l.rod?.kind || 'float',
        });
      }
    }
    scene.state.extraFloats = extras;
    scene.state.rodLines = rodLines;
    scene.state.occupiedHotspots = [...occupiedHotspotIndexes()];
    if (focus) {
      scene.state.floatX = focus.floatX;
      scene.state.floatY = focus.floatY;
      scene.state.biteDip = focus.biteDip || 0;
      scene.state.fishPullX = focus.fishPullX || 0;
      scene.state.fishPullY = focus.fishPullY || 0;
      if (focus.bobberColor) scene.setBobberColor?.(focus.bobberColor);
      if (focus.rod) {
        scene.setRodId?.(focus.rod.id);
        scene.setRodKind?.(focus.rod.kind);
      }
    } else {
      scene.state.biteDip = 0;
      scene.state.fishPullX = 0;
      scene.state.fishPullY = 0;
      scene.state.extraFloats = [];
      scene.state.rodLines = [];
    }
  }

  function setPhaseFromLines() {
    const focus = focusLine();
    const p = focus?.phase || 'idle';
    phase = p;
    scene.state.phase = p === 'power' ? 'power' : p;
    document.getElementById('pier')?.classList.toggle('busy', p !== 'idle');

    const showCast = canStartCast();
    els.castBtn.classList.toggle('hidden', !showCast);
    // Hook only on real bite — during wait show cast for 2nd/3rd rod
    const hookRow = document.getElementById('hook-row');
    const showHook = p === 'bite';
    els.hookBtn.classList.toggle('hidden', !showHook);
    hookRow?.classList.toggle('hidden', !showHook);
    document.getElementById('pier')?.classList.toggle('multi-cast', showCast && liveLines().some((l) => l.phase === 'wait'));
    const holdBtn = document.getElementById('btn-hold-bite');
    if (holdBtn) {
      const holds = getSave().biteHold || 0;
      holdBtn.classList.toggle('hidden', p !== 'bite' || holds < 1);
      holdBtn.disabled = holds < 1;
      holdBtn.dataset.count = String(holds);
    }
    els.castUi.classList.toggle('hidden', p !== 'power');
    els.fightUi.classList.toggle('hidden', p !== 'fight');
    if (p !== 'fight') {
      const netBtn = document.getElementById('btn-net-scoop');
      if (netBtn) {
        netBtn.classList.add('hidden');
        netBtn.disabled = true;
      }
    } else {
      syncNetButton(focus);
    }
    if (els.tackleBar) els.tackleBar.classList.toggle('hidden', !(p === 'idle' || (p === 'wait' && showCast)));
    if (els.chumBtn) els.chumBtn.classList.toggle('hidden', p !== 'idle');
    // gear-strip lives outside tackleBar sometimes
    document.getElementById('gear-strip')?.classList.toggle('hidden', !(p === 'idle' || (p === 'wait' && showCast)));

    if (p === 'idle') onHint('pier.hintCast');
    else if (p === 'wait' && showCast) onHint('pier.hintCast2');
    else if (p === 'wait') onHint(waitHint(focus?.rod));
    else if (p === 'bite') {
      const n = (focus?.loadoutIndex ?? 0) + 1;
      onHint('pier.hintBiteRod');
      const hintEl = document.getElementById('pier-hint');
      if (hintEl) {
        const en = (document.documentElement.lang || 'ru').startsWith('en');
        hintEl.textContent = en
          ? `Bite on rod #${n} — hook now!`
          : `Поклёвка на удочке #${n} — подсекай!`;
      }
    }
    else if (p === 'fight') {
      const n = (focus?.loadoutIndex ?? 0) + 1;
      const hintEl = document.getElementById('pier-hint');
      if (hintEl) {
        const en = (document.documentElement.lang || 'ru').startsWith('en');
        hintEl.textContent = en
          ? `Fighting on rod #${n} — keep tension in the green`
          : `Вываживание на удочке #${n} — держи зелёную зону`;
      }
    }
    else if (p === 'power' || p === 'castfly') onHint('pier.hintCast');

    // Close browse during fight / bite to keep focus
    if (p === 'fight' || p === 'bite') {
      document.getElementById('pier-browse')?.classList.add('hidden');
    }

    syncSceneFloats();
    updateLinesStrip();
    updateRodBanners();
  }

  function occupiedHotspotIndexes() {
    const used = new Set();
    for (const l of liveLines()) {
      if (l.hotspotIndex >= 0 && (l.phase === 'wait' || l.phase === 'bite' || l.phase === 'castfly' || l.phase === 'fight')) {
        used.add(l.hotspotIndex);
      }
    }
    return used;
  }

  function pickCastTarget(power) {
    const spots = scene.state.hotspots || [];
    const used = occupiedHotspotIndexes();
    let idx = scene.state.selectedHotspot;
    if (idx >= 0 && used.has(idx)) idx = -1;
    if (idx < 0) {
      for (let i = 0; i < spots.length; i++) {
        if (!used.has(i)) { idx = i; break; }
      }
    }
    const hs = idx >= 0 ? spots[idx] : null;
    const to = { x: 0, y: 0, hotspotIndex: idx };
    if (hs) {
      to.x = hs.x + (Math.random() - 0.5) * 0.035;
      to.y = hs.y + (Math.random() - 0.5) * 0.025;
    } else {
      to.x = 0.35 + power * 0.45;
      to.y = 0.54 - power * 0.04;
      // nudge away from other floats
      for (const l of liveLines()) {
        if (l.phase === 'wait' || l.phase === 'bite') {
          if (Math.abs(l.floatX - to.x) < 0.06) to.x = Math.min(0.82, to.x + 0.1);
        }
      }
    }
    to.y = Math.max(0.50, Math.min(0.64, to.y));
    to.x = Math.max(0.22, Math.min(0.82, to.x));
    return to;
  }

  function updateLinesStrip() {
    const el = document.getElementById('lines-strip');
    if (!el) return;
    const live = liveLines().filter((l) =>
      l.phase === 'wait' || l.phase === 'bite' || l.phase === 'castfly' || l.phase === 'fight' || l.phase === 'power');
    el.innerHTML = '';
    if (!live.length) {
      el.classList.add('empty');
      return;
    }
    el.classList.remove('empty');
    const en = (document.documentElement.lang || 'ru').startsWith('en');
    const retrievable = live.filter((l) => l.phase === 'wait' || l.phase === 'castfly' || l.phase === 'bite');
    if (retrievable.length >= 2) {
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'lc-retrieve-all';
      allBtn.textContent = en ? 'Reel all' : 'Вытащить все';
      allBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        retrieveAll();
      });
      el.appendChild(allBtn);
    }
    live.forEach((l) => {
      const card = document.createElement('div');
      card.className = `line-card phase-${l.phase}`;
      const rodName = ((en ? l.rod?.nameEn : l.rod?.nameRu) || l.rod?.id || 'rod').split(' ')[0];
      const baitName = ((en ? l.bait?.nameEn : l.bait?.nameRu) || '').split(' ')[0];
      let timer = '—';
      if (l.phase === 'wait') {
        const elapsed = Math.max(0, l.waitTimer || 0);
        const m = Math.floor(elapsed / 60);
        const s = Math.floor(elapsed % 60);
        timer = m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
      } else if (l.phase === 'bite') {
        timer = `${Math.max(0, l.biteWindow || 0).toFixed(1)}s`;
      } else if (l.phase === 'fight') {
        timer = `${Math.round((l.progress || 0) * 100)}%`;
      } else if (l.phase === 'castfly' || l.phase === 'power') {
        timer = '…';
      }
      const kind = l.rod?.kind === 'spin' ? 'S' : l.rod?.kind === 'bottom' ? 'D' : 'U';
      const canPull = l.phase === 'wait' || l.phase === 'castfly' || l.phase === 'bite';
      card.innerHTML = `<span class="lc-idx">#${(l.loadoutIndex || 0) + 1}</span><span class="lc-kind">${kind}</span><span class="lc-gear">${rodName} · ${baitName}</span><span class="lc-timer">${timer}</span>${canPull ? `<button type="button" class="lc-retrieve" data-line="${l.id}">${en ? 'Reel' : 'Вытащить'}</button>` : ''}`;
      const btn = card.querySelector('.lc-retrieve');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          retrieveLine(l.id);
        });
      }
      el.appendChild(card);
    });
  }

  function retrieveLine(lineId) {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return false;
    if (line.phase === 'fight' || line.phase === 'power') return false;
    if (line.phase !== 'wait' && line.phase !== 'castfly' && line.phase !== 'bite') return false;
    line.phase = 'done';
    lines = lines.filter((l) => l.id !== line.id);
    if (powerLine && powerLine.id === line.id) {
      powerLine = null;
      holding = false;
    }
    scene.setFightFish?.(null);
    scene.setFightMystery?.(null);
    if (!liveLines().length) resetIdleFloat();
    else {
      for (const other of liveLines()) {
        if (other.paused) other.paused = false;
      }
    }
    setPhaseFromLines();
    onHint?.('pier.retrieved');
    return true;
  }

  function retrieveAll() {
    const targets = liveLines().filter((l) => l.phase === 'wait' || l.phase === 'castfly' || l.phase === 'bite');
    if (!targets.length) return 0;
    for (const line of targets) {
      line.phase = 'done';
    }
    lines = lines.filter((l) => l.phase !== 'done');
    powerLine = null;
    holding = false;
    scene.setFightFish?.(null);
    scene.setFightMystery?.(null);
    if (!liveLines().length) resetIdleFloat();
    else {
      for (const other of liveLines()) {
        if (other.paused) other.paused = false;
      }
    }
    setPhaseFromLines();
    onHint?.('pier.retrieved');
    return targets.length;
  }

  function resetIdleFloat() {
    const hs = scene.state.selectedHotspot >= 0
      ? scene.state.hotspots[scene.state.selectedHotspot]
      : null;
    if (hs) {
      scene.state.floatX = hs.x;
      scene.state.floatY = hs.y;
    } else {
      scene.state.floatX = 0.55;
      scene.state.floatY = 0.55;
    }
    scene.state.biteDip = 0;
    scene.state.fishPullX = 0;
    scene.state.fishPullY = 0;
    scene.state.extraFloats = [];
  }

  function nextLoadoutIndex(save) {
    const slots = maxSlots();
    const used = new Set(liveLines().map((l) => l.loadoutIndex ?? 0));
    const pref = Math.max(0, Math.min(slots - 1, save.editLoadout ?? 0));
    if (!used.has(pref)) return pref;
    for (let i = 0; i < slots; i++) {
      if (!used.has(i)) return i;
    }
    return pref;
  }

  function rodBannerText(line, en) {
    if (!line) return '';
    const n = (line.loadoutIndex ?? 0) + 1;
    const rodName = ((en ? line.rod?.nameEn : line.rod?.nameRu) || line.rod?.id || 'rod');
    const baitName = ((en ? line.bait?.nameEn : line.bait?.nameRu) || '').split(' ')[0];
    const lineName = ((en ? line.lineItem?.nameEn : line.lineItem?.nameRu) || '').split(' ')[0];
    const hookName = ((en ? line.hook?.nameEn : line.hook?.nameRu) || '').replace(/^Крючок\s*/i, '').replace(/^Hook\s*/i, '');
    if (en) return `#${n} · ${rodName} · ${baitName}${lineName ? ` · ${lineName}` : ''}${hookName ? ` · ${hookName}` : ''}`;
    return `#${n} · ${rodName} · ${baitName}${lineName ? ` · ${lineName}` : ''}${hookName ? ` · ${hookName}` : ''}`;
  }

  function updateRodBanners() {
    const en = (document.documentElement.lang || 'ru').startsWith('en');
    const fightEl = document.getElementById('fight-rod-info');
    const hookEl = document.getElementById('hook-rod-info');
    const castEl = document.getElementById('cast-rod-info');
    const picker = document.getElementById('cast-loadout-picker');
    if (fightEl) {
      const fight = liveLines().find((l) => l.phase === 'fight');
      fightEl.textContent = fight ? rodBannerText(fight, en) : '';
      fightEl.classList.toggle('hidden', !fight);
    }
    if (hookEl) {
      const bite = liveLines().find((l) => l.phase === 'bite');
      hookEl.textContent = bite ? rodBannerText(bite, en) : '';
      hookEl.classList.toggle('hidden', !bite);
    }
    const save = getSave();
    const showCast = canStartCast();
    if (picker) {
      picker.innerHTML = '';
      picker.classList.toggle('hidden', !showCast);
      if (showCast) {
        const slots = maxSlots();
        const used = new Set(liveLines().map((l) => l.loadoutIndex ?? 0));
        for (let i = 0; i < slots; i++) {
          if (used.has(i)) continue;
          const gear = gearFromLoadout(save, i);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `cast-pick${(save.editLoadout ?? 0) === i ? ' on' : ''}`;
          const rodName = ((en ? gear.rod?.nameEn : gear.rod?.nameRu) || '').split(' ')[0];
          const baitName = ((en ? gear.bait?.nameEn : gear.bait?.nameRu) || '').split(' ')[0];
          btn.innerHTML = `<strong>#${i + 1}</strong><span>${rodName} · ${baitName}</span>`;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            save.editLoadout = i;
            // sync top-level from chosen loadout for HUD (do NOT call onCastDone — that advances weather/tod)
            const L = save.loadouts?.[i];
            if (L) {
              save.rodId = L.rodId;
              save.baitId = L.baitId;
              save.hookId = L.hookId;
              save.lineId = L.lineId;
              save.bobberId = L.bobberId;
            }
            scene.setRodId?.(save.rodId);
            scene.setRodKind?.(getRod(save.rodId).kind);
            scene.setBobberColor?.(getBobber(save.bobberId).color);
            updateRodBanners();
            document.dispatchEvent(new CustomEvent('quietcove:loadout', { detail: { index: i } }));
          });
          picker.appendChild(btn);
        }
      }
    }
    if (castEl) {
      if (showCast) {
        const idx = nextLoadoutIndex(save);
        const gear = gearFromLoadout(save, idx);
        const fake = { loadoutIndex: idx, rod: gear.rod, bait: gear.bait, hook: gear.hook, lineItem: gear.lineItem };
        castEl.textContent = en
          ? `Next cast: rod #${idx + 1}`
          : `Следующий заброс: удочка #${idx + 1}`;
        const sub = document.getElementById('cast-rod-sub');
        if (sub) sub.textContent = rodBannerText(fake, en);
      }
      castEl.classList.toggle('hidden', !showCast);
      document.getElementById('cast-rod-sub')?.classList.toggle('hidden', !showCast);
    }
    const castLabel = document.getElementById('cast-label-text');
    if (castLabel && showCast) {
      const idx = nextLoadoutIndex(getSave());
      castLabel.textContent = en ? `Cast #${idx + 1}` : `Забросить #${idx + 1}`;
    } else if (castLabel) {
      castLabel.textContent = en ? 'Cast' : 'Забросить';
    }
  }

  function gearFromLoadout(save, idx) {
    const list = save.loadouts;
    const L = (list && list[idx]) || {
      rodId: save.rodId,
      baitId: save.baitId,
      hookId: save.hookId,
      lineId: save.lineId,
      bobberId: save.bobberId,
    };
    return {
      rod: getRod(L.rodId),
      bait: getBait(L.baitId),
      hook: getHook(L.hookId),
      lineItem: getLine(L.lineId),
      bobber: getBobber(L.bobberId),
      loadoutIndex: idx,
    };
  }

  function startPower() {
    if (!canStartCast()) return;
    holding = true;
    const save = getSave();
    const idx = nextLoadoutIndex(save);
    const gear = gearFromLoadout(save, idx);
    const line = {
      id: lineSeq++,
      phase: 'power',
      power: 0.1,
      powerDir: 1,
      floatX: 0.84,
      floatY: 0.72,
      biteDip: 0,
      fishPullX: 0,
      fishPullY: 0,
      bobberColor: gear.bobber.color,
      rod: gear.rod,
      bait: gear.bait,
      hook: gear.hook,
      lineItem: gear.lineItem,
      loadoutIndex: idx,
      hotspotIndex: -1,
    };
    powerLine = line;
    lines.push(line);
    scene.setRodKind?.(gear.rod.kind);
    scene.setRodId?.(gear.rod.id);
    scene.setBobberColor?.(gear.bobber.color);
    setPhaseFromLines();
    import('../audio.js').then((m) => m.resumeAudio());
  }

  function consumeChum(save) {
    if (!save.activeChum || save.activeChum.left <= 0) return null;
    const g = getGroundbait(save.activeChum.id);
    save.activeChum.left -= 1;
    if (save.activeChum.left <= 0) save.activeChum = null;
    return g;
  }

  function releaseCast() {
    const line = powerLine;
    if (!line || line.phase !== 'power') return;
    holding = false;
    powerLine = null;
    const save = getSave();
    let rod = line.rod || getRod(save.rodId);
    let hook = line.hook || getHook(save.hookId);
    let lineItem = line.lineItem || getLine(save.lineId);
    let bait = line.bait || getBait(save.baitId);
    if (!baitFitsRod(bait, rod)) {
      const owned = save.ownedBaits || ['bread'];
      const alt = owned.map(getBait).find((b) => baitFitsRod(b, rod));
      if (alt) bait = alt;
    }
    // Consumable baits: spend a charge (bread is free forever)
    const usedBaitId = consumeBaitCharge(save, bait?.id || 'bread');
    bait = getBait(usedBaitId) || getBait('bread');
    line.bait = bait;
    const spot = getSpot(save.spotId);
    const bobber = getBobber((save.loadouts?.[line.loadoutIndex]?.bobberId) || save.bobberId);
    scene.setBobberColor?.(bobber.color);
    scene.setRodKind?.(rod.kind);
    scene.setRodId?.(rod.id);
    const sweet = isSweetCast(line.power);
    const zone = zoneFromPower(line.power, rod.maxZone, spot.zoneBonus || 0);

    const to = pickCastTarget(line.power);
    line.hotspotIndex = to.hotspotIndex;
    scene.state.selectedHotspot = -1;

    line.castFly = {
      fromX: line.loadoutIndex === 1 ? 0.78 : 0.84,
      fromY: 0.72,
      toX: to.x,
      toY: to.y,
      t: 0,
      dur: 0.62 + Math.random() * 0.12,
    };
    line.floatX = line.castFly.fromX;
    line.floatY = line.castFly.fromY;
    line.phase = 'castfly';
    line.sweet = sweet;
    line.zone = zone;
    line.rod = rod;
    line.bait = bait;
    line.spot = spot;
    line.hook = hook;
    line.lineItem = lineItem;
    line.lineLimit = effectiveLineLimit(rod, lineItem, save.lineWear || 0);
    line.bobberColor = bobber.color;
    line.biteDip = 0;
    scene.state.splash = 0;
    scene.state.castBend = 1;
    sfxCast();

    const chum = consumeChum(save);
    const tod = getTod();
    const activity = biteActivity(save.weatherId || 'cloudy', tod);
    const onHotspot = line.hotspotIndex >= 0;

    line.pendingFish = pickFish(zone, bait, rod, {
      tod,
      hotspot: onHotspot,
      lucky: isLucky(),
      spotId: spot.id,
      spotRareMul: (spot.rareMul || 1) * (chum?.rareMul || 1),
      weatherId: save.weatherId || 'cloudy',
      chumRareMul: chum?.rareMul || 1,
      rank: anglerRank(save.xp),
    });
    line.biteStyle = line.pendingFish.bite || 'nibble';
    const range = biteWaitRange(line.biteStyle, rod, spot, bait, {
      activity,
      chumWaitMul: chum?.waitMul || 1,
    });
    let waitMax = range.min + Math.random() * (range.max - range.min);
    if (isLucky()) waitMax *= 0.92;
    line.waitMax = waitMax;
    line.waitTimer = 0;
    line.nextNibble = 1.4 + Math.random() * 2.2;
    line.nibblePhase = 0;
    line.inBite = false;
    line.biteWindow = 0;
    line.perfectHook = false;
    onCastDone?.();
    setPhaseFromLines();
  }

  function applyNibbleVisual(line, kind) {
    if (kind === 'soft') line.biteDip = 0.22;
    if (kind === 'double') {
      line.biteDip = 0.4;
      setTimeout(() => { if (line.phase === 'wait') line.biteDip = 0.55; }, 180);
    }
    if (kind === 'drag') line.biteDip = 0.65;
  }

  function triggerBite(line) {
    line.inBite = true;
    const hookMul = line.hook?.hookMul || 1;
    const base = line.rod.hookWindow * (line.sweet ? 1.12 : 1) * hookMul;
    const styleMul = line.biteStyle === 'aggressive' ? 0.95
      : line.biteStyle === 'shy' ? 1.28
        : line.biteStyle === 'long' ? 1.18 : 1.05;
    // Touch-first timing: enough time to notice the rod signal and move a finger
    // to the action button, while rod/hook upgrades still improve the window.
    line.biteWindowMax = Math.max(3, base * styleMul * 3.2);
    line.biteWindow = line.biteWindowMax;
    line.biteDip = line.biteStyle === 'aggressive' ? 1.2 : 1;
    line.phase = 'bite';
    if (els.hookBtn) els.hookBtn.style.setProperty('--hook', '1');
    sfxBite();
    scene.shake?.(0.85);
    setPhaseFromLines();
  }

  function holdBite() {
    const line = liveLines().find((l) => l.phase === 'bite');
    if (!line || line.heldOnce) return false;
    const save = getSave();
    if ((save.biteHold || 0) < 1) return false;
    save.biteHold -= 1;
    line.biteWindow += 2.8;
    line.biteWindowMax += 2.8;
    line.heldOnce = true;
    setPhaseFromLines();
    return true;
  }

  function tryHook() {
    const biteLine = liveLines().find((l) => l.phase === 'bite');
    if (!biteLine) return;
    const early = biteLine.biteWindow / biteLine.biteWindowMax;
    biteLine.perfectHook = early > 0.62;
    startFight(biteLine);
  }

  function startFight(line) {
    const fish = line.pendingFish;
    const sizeMul = line.hook?.sizeMul || 1;
    const save = getSave();
    const weight = rollWeight(fish, sizeMul, { rank: anglerRank(save.xp) });
    const cls = catchClass(fish, weight);
    // No species spoiler — anonymous silhouette sized by catch class
    scene.setFightFish?.(null);
    scene.setFightColor?.('#1a3038');
    scene.setFightMystery?.({
  sizeMul: cls === 'prize' || cls === 'trophy' ? 1.45 : cls === 'large' ? 1.22 : cls === 'tiny' ? 0.72 : 1,
      catchClass: cls,
    });
    line.fish = fish;
    line.weight = weight;
    line.catchClass = cls;
    line.progress = 0.28;
    line.fightElapsed = 0;
    line.fishPos = 0.5;
    line.fishTarget = 0.5;
    line.controlPos = 0.5;
    line.controlVelocity = 0;
    line.pullTimer = 0.5;
    line.reelHeld = false;
    line.surge = 0;
    line.inBite = false;
    line.phase = 'fight';
    for (const other of liveLines()) {
      if (other.id !== line.id && other.phase === 'wait') other.paused = true;
    }
    setPhaseFromLines();
  }

  function removeLine(line, reason) {
    line.phase = 'done';
    lines = lines.filter((l) => l.id !== line.id);
    if (reason) {
      sfxFail();
      scene.setFightFish?.(null);
      scene.setFightMystery?.(null);
      onFail(reason);
    }
    if (!liveLines().length) resetIdleFloat();
    else {
      for (const other of liveLines()) {
        if (other.paused) other.paused = false;
      }
    }
    setPhaseFromLines();
  }

  function fail(line, reason) {
    removeLine(line, reason);
  }

  function succeed(line) {
    const save = getSave();
    const { fish, weight } = line;
    let coins = sellValue(fish, weight);
    if (line.sweet) coins = Math.round(coins * 1.2);
    if (line.perfectHook) coins = Math.round(coins * 1.15);
    if (isLucky()) coins = Math.round(coins * 1.5);
    const wear = (line.lineItem?.wearPerFight || 0.03) * 0.65;
    save.lineWear = Math.min(0.7, (save.lineWear || 0) + wear);
    sfxCatch();
    scene.setFightFish?.(null);
    scene.setFightMystery?.(null);
    line.phase = 'done';
    lines = lines.filter((l) => l.id !== line.id);
    for (const other of liveLines()) {
      if (other.paused) other.paused = false;
    }
    if (!liveLines().length) resetIdleFloat();
    setPhaseFromLines();
    onCatch({
      fish,
      weight,
      coins,
      zone: line.zone,
      sweet: line.sweet,
      lucky: isLucky(),
      perfectHook: line.perfectHook,
      catchClass: line.catchClass,
      rodKind: line.rod.kind,
    });
  }

  function updateCastFly(line, dt) {
    const fly = line.castFly;
    if (!fly) return;
    fly.t += dt;
    const u = Math.min(1, fly.t / fly.dur);
    const ease = 1 - (1 - u) * (1 - u);
    const arc = Math.sin(u * Math.PI) * 0.14;
    line.floatX = fly.fromX + (fly.toX - fly.fromX) * ease;
    line.floatY = fly.fromY + (fly.toY - fly.fromY) * ease - arc;
    scene.state.castBend = 1 - u * 0.85;
    if (u >= 1) {
      line.floatX = fly.toX;
      line.floatY = fly.toY;
      scene.state.splash = 1;
      scene.state.castBend = 0.15;
      line.castFly = null;
      line.phase = 'wait';
      sfxSplash();
      scene.shake?.(0.45);
      setPhaseFromLines();
    }
  }

  function updateWait(line, dt) {
    if (line.paused) return;
    line.waitTimer += dt;
    line.nextNibble -= dt;
    if (line.nextNibble <= 0 && line.waitTimer < line.waitMax - 1.2) {
      line.nibblePhase += 1;
      if (line.biteStyle === 'nibble') {
        applyNibbleVisual(line, line.nibblePhase % 2 === 0 ? 'soft' : 'double');
        line.nextNibble = 1.6 + Math.random() * 2.4;
      } else if (line.biteStyle === 'shy') {
        applyNibbleVisual(line, 'soft');
        line.nextNibble = 2.4 + Math.random() * 3.2;
      } else if (line.biteStyle === 'aggressive') {
        applyNibbleVisual(line, Math.random() > 0.5 ? 'double' : 'drag');
        line.nextNibble = 1.0 + Math.random() * 1.8;
      } else {
        applyNibbleVisual(line, Math.random() > 0.6 ? 'drag' : 'soft');
        line.nextNibble = 2.8 + Math.random() * 3.8;
      }
    } else {
      line.biteDip = Math.max(0, (line.biteDip || 0) - dt * 0.9);
    }

    if (line.rod.kind === 'spin') {
      line.floatX = Math.max(0.28, line.floatX - dt * 0.015);
    }

    if (line.waitTimer >= line.waitMax) {
      // If another line is fighting, extend wait a bit
      if (liveLines().some((l) => l.phase === 'fight' || l.phase === 'bite')) {
        line.waitMax += 2.5;
        return;
      }
      triggerBite(line);
    }
  }

  function updateFight(line, dt) {
    const fish = line.fish;
    const fightMul = line.rod.fightMul || 1;
    const lineLimit = Math.max(0.7, line.lineLimit || line.rod.line || 0.8);
    const pull = fightPull(fish, line.weight || fish.minW, lineLimit);
    const save = getSave();
    const rank = anglerRank(save.xp);
    const hard = 1 + Math.min(0.4, (rank - 1) * 0.035)
      + (fish.rarity === 'legend' ? 0.12 : fish.rarity === 'epic' ? 0.08 : fish.rarity === 'rare' ? 0.04 : 0);
    line.fightElapsed += dt;

    // Palworld-like loop: fish marker moves independently; hold moves the
    // green control zone right, release lets it travel left.
    line.pullTimer -= dt;
    line.surge = Math.max(0, (line.surge || 0) - dt);
    if (line.pullTimer <= 0) {
      line.pullTimer = 0.34 + Math.random() * (0.72 + (1 - pull) * 0.38);
      line.fishTarget = 0.08 + Math.random() * 0.84;
      if (Math.random() < 0.14 + pull * 0.26 * hard) {
        line.surge = 0.2 + pull * 0.22;
        line.fishTarget = Math.random() > 0.5 ? 0.92 : 0.08;
        scene.shake?.(0.32 + pull * 0.28);
      }
    }

    const fishSpeed = (1.25 + pull * 1.9) * hard * (line.surge > 0 ? 1.35 : 1);
    line.fishPos += (line.fishTarget - line.fishPos) * Math.min(1, dt * fishSpeed);

    const desiredVelocity = line.reelHeld ? 0.62 : -0.62;
    line.controlVelocity += (desiredVelocity - line.controlVelocity) * Math.min(1, dt * 8);
    line.controlPos += line.controlVelocity * dt;

    const hookMul = line.hook?.hookMul || 1;
    const rodHelp = Math.max(0, (line.rod.hookWindow || 0.75) - 0.65);
    const zoneWidth = Math.max(0.22, Math.min(0.42, (0.22 + rodHelp * 0.34) * hookMul));
    const halfZone = zoneWidth / 2;
    if (line.controlPos < halfZone) {
      line.controlPos = halfZone;
      line.controlVelocity = Math.max(0, line.controlVelocity * -0.2);
    } else if (line.controlPos > 1 - halfZone) {
      line.controlPos = 1 - halfZone;
      line.controlVelocity = Math.min(0, line.controlVelocity * -0.2);
    }

    line.fishPullX = (line.fishPos - 0.5) * 2.1;
    line.fishPullY = Math.sin(scene.state.time * (4 + pull * 4)) * (0.3 + pull * 0.22);

    const gMin = line.controlPos - halfZone;
    const gMax = line.controlPos + halfZone;
    const inGreen = line.fishPos >= gMin && line.fishPos <= gMax;
    const progressRate = (0.155 + (1 - pull) * 0.06) * fightMul / Math.max(1, hard * 0.8);
    if (inGreen) {
      line.progress += dt * progressRate;
    } else {
      const lineHelp = Math.max(0.72, Math.min(1, line.lineItem?.strength || 0.8));
      line.progress = Math.max(0, line.progress - dt * (0.09 + pull * 0.048) * hard / lineHelp);
    }

    const needle = Math.max(0, Math.min(1, line.fishPos));
    els.fightNeedle.style.left = `${needle * 100}%`;
    if (els.fightProgress) {
      els.fightProgress.style.width = `${Math.max(0, Math.min(100, line.progress * 100))}%`;
    }
    if (els.fightGreen) {
      els.fightGreen.style.left = `${gMin * 100}%`;
      els.fightGreen.style.width = `${(gMax - gMin) * 100}%`;
    }
    syncNetButton(line);

    if (line.fightElapsed > 1.5 && line.progress <= 0) {
      fail(line, 'escape');
      return;
    }
    if (line.progress >= 1) succeed(line);
  }

  function equippedNet() {
    const save = getSave();
    if (!save.netId) return null;
    return getNet(save.netId);
  }

  function syncNetButton(line) {
    const btn = document.getElementById('btn-net-scoop');
    if (!btn) return;
    const net = equippedNet();
    const fighting = line?.phase === 'fight';
    if (!fighting || !net) {
      btn.classList.add('hidden');
      btn.disabled = true;
      return;
    }
    const need = netScoopThreshold(net);
    const ready = (line.progress || 0) >= need;
    btn.classList.remove('hidden');
    btn.disabled = !ready;
    btn.classList.toggle('ready', ready);
    const pct = Math.round(net.help * 100);
    const en = (document.documentElement.lang || 'ru').startsWith('en');
    btn.textContent = ready
      ? (en ? `Net · finish (-${pct}%)` : `Сачок · взять (-${pct}%)`)
      : (en ? `Net from ${Math.round(need * 100)}%` : `Сачок с ${Math.round(need * 100)}%`);
  }

  function tryScoop() {
    const line = liveLines().find((l) => l.phase === 'fight');
    if (!line) return false;
    const net = equippedNet();
    if (!net) return false;
    if ((line.progress || 0) < netScoopThreshold(net)) return false;
    succeed(line);
    return true;
  }

  function tick(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    if (!paused) {
      for (const line of [...liveLines()]) {
        if (line.phase === 'power' && holding && line === powerLine) {
          line.power += line.powerDir * dt * 1.1;
          if (line.power >= 1) { line.power = 1; line.powerDir = -1; }
          if (line.power <= 0.05) { line.power = 0.05; line.powerDir = 1; }
          scene.state.power = line.power;
          scene.state.castBend = line.power;
          els.castFill.style.width = `${Math.round(line.power * 100)}%`;
        }
        if (line.phase === 'castfly') updateCastFly(line, dt);
        if (line.phase === 'wait') updateWait(line, dt);
        if (line.phase === 'bite') {
          line.biteWindow -= dt;
          const left = Math.max(0, line.biteWindow / Math.max(0.001, line.biteWindowMax));
          if (els.hookBtn) els.hookBtn.style.setProperty('--hook', String(left));
          const pulse = line.biteStyle === 'aggressive' ? 26 : 14;
          line.biteDip = 0.75 + Math.sin(scene.state.time * pulse) * 0.22;
          if (line.biteWindow <= 0) fail(line, 'miss');
        }
        if (line.phase === 'fight') updateFight(line, dt);
      }
      syncSceneFloats();
      if (liveLines().some((l) => l.phase === 'wait' || l.phase === 'bite' || l.phase === 'fight')) {
        updateLinesStrip();
      }
      scene.frame(dt);
    } else {
      scene.frame(0);
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    paused = false;
    last = performance.now();
    lines = [];
    powerLine = null;
    holding = false;
    scene.resize();
    scene.seedHotspots();
    const save = getSave();
    const bobber = getBobber(save.bobberId);
    const rod = getRod(save.rodId);
    scene.setBobberColor?.(bobber.color);
    scene.setRodKind?.(rod.kind);
    resetIdleFloat();
    setPhaseFromLines();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  return {
    start,
    stop,
    setPaused(v) { paused = v; },
    startPower,
    releaseCast,
    tryHook,
    holdBite,
    tryScoop,
    canStartCast,
    retrieveLine,
    retrieveAll,
    setReel(held) {
      const fight = liveLines().find((l) => l.phase === 'fight');
      if (fight) fight.reelHeld = held;
    },
    isBusy() { return phase !== 'idle'; },
    getPhase: () => phase,
    lineCount: () => liveLines().length,
    maxSlots,
    usedLoadoutIndexes: () => liveLines().map((l) => l.loadoutIndex ?? 0),
    nextCastLoadoutIndex: () => nextLoadoutIndex(getSave()),
    refreshCastUi: () => { updateRodBanners(); updateLinesStrip(); },
  };
}
