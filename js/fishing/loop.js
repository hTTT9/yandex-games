import {
  baitFitsRod,
  biteActivity,
  biteWaitRange,
  catchClass,
  effectiveLineLimit,
  getBait,
  getBobber,
  getGroundbait,
  getHook,
  getLine,
  getRod,
  getSpot,
  isSweetCast,
  pickFish,
  rollWeight,
  sellValue,
  zoneFromPower,
} from '../data/fish.js';
import { sfxBite, sfxCast, sfxCatch, sfxFail, sfxSplash } from '../audio.js';

export function createFishingController({ scene, getSave, getTod, isLucky, onCatch, onFail, onHint, onCastDone, ui }) {
  let raf = 0;
  let last = 0;
  let running = false;
  let paused = false;

  let phase = 'idle';
  let power = 0;
  let powerDir = 1;
  let holding = false;
  let waitTimer = 0;
  let nextNibble = 0;
  let biteWindow = 0;
  let biteWindowMax = 0.85;
  let inBite = false;
  let fight = null;
  let pendingFish = null;
  let zone = 0;
  let sweet = false;
  let perfectHook = false;
  let biteStyle = 'nibble';
  let nibblePhase = 0;
  let castFly = null;
  let willBite = true;

  const FIGHT_GREEN_MIN = 0.42;
  const FIGHT_GREEN_MAX = 0.58;

  const els = ui;

  function waitHint(rod) {
    if (rod?.kind === 'spin') return 'pier.hintSpin';
    if (rod?.kind === 'bottom') return 'pier.hintBottom';
    return 'pier.hintWait';
  }

  function setPhase(p) {
    phase = p;
    scene.state.phase = p === 'power' ? 'power' : p;
    document.getElementById('pier')?.classList.toggle('busy', p !== 'idle');
    els.castBtn.classList.toggle('hidden', p !== 'idle');
    els.hookBtn.classList.toggle('hidden', p !== 'wait' && p !== 'bite');
    els.castUi.classList.toggle('hidden', p !== 'power');
    els.fightUi.classList.toggle('hidden', p !== 'fight');
    if (els.tackleBar) els.tackleBar.classList.toggle('hidden', p !== 'idle');
    if (els.chumBtn) els.chumBtn.classList.toggle('hidden', p !== 'idle');
    if (p === 'idle') onHint('pier.hintCast');
    if (p === 'wait') onHint(waitHint(fight?.rod));
    if (p === 'bite') onHint('pier.hintBite');
    if (p === 'fight') onHint('pier.hintFight');
    if (p === 'power') onHint('pier.hintCast');
    if (p === 'castfly') onHint('pier.hintCast');
  }

  function resetFloat(targetPower) {
    const p = targetPower ?? 0.45;
    const hs = scene.state.selectedHotspot >= 0
      ? scene.state.hotspots[scene.state.selectedHotspot]
      : null;
    if (hs) {
      scene.state.floatX = hs.x + (Math.random() - 0.5) * 0.04;
      scene.state.floatY = hs.y + (Math.random() - 0.5) * 0.03;
    } else {
      scene.state.floatX = 0.35 + p * 0.5;
      scene.state.floatY = 0.55 - p * 0.12;
    }
    scene.state.biteDip = 0;
    scene.state.fishPullX = 0;
    scene.state.fishPullY = 0;
  }

  function startPower() {
    if (phase !== 'idle' || paused) return;
    holding = true;
    power = 0.1;
    powerDir = 1;
    setPhase('power');
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
    if (phase !== 'power') return;
    holding = false;
    const save = getSave();
    const rod = getRod(save.rodId);
    const hook = getHook(save.hookId);
    const lineItem = getLine(save.lineId);
    let bait = getBait(save.baitId);
    if (!baitFitsRod(bait, rod)) {
      const owned = save.ownedBaits || ['bread'];
      const alt = owned.map(getBait).find((b) => baitFitsRod(b, rod));
      if (alt) {
        bait = alt;
        save.baitId = alt.id;
      }
    }
    const spot = getSpot(save.spotId);
    const bobber = getBobber(save.bobberId);
    scene.setBobberColor?.(bobber.color);
    scene.setRodKind?.(rod.kind);
    sweet = isSweetCast(power);
    zone = zoneFromPower(power, rod.maxZone, spot.zoneBonus || 0);

    const to = { x: 0, y: 0 };
    {
      const hs = scene.state.selectedHotspot >= 0
        ? scene.state.hotspots[scene.state.selectedHotspot]
        : null;
      if (hs) {
        to.x = hs.x + (Math.random() - 0.5) * 0.04;
        to.y = hs.y + (Math.random() - 0.5) * 0.03;
      } else {
        to.x = 0.35 + power * 0.45;
        to.y = 0.54 - power * 0.04;
      }
    }
    to.y = Math.max(0.50, Math.min(0.64, to.y));
    to.x = Math.max(0.22, Math.min(0.82, to.x));
    castFly = {
      fromX: 0.84,
      fromY: 0.72,
      toX: to.x,
      toY: to.y,
      t: 0,
      dur: 0.62 + Math.random() * 0.12,
    };
    scene.state.floatX = castFly.fromX;
    scene.state.floatY = castFly.fromY;
    scene.state.biteDip = 0;
    scene.state.fishPullX = 0;
    scene.state.fishPullY = 0;
    scene.state.splash = 0;
    scene.state.castBend = 1;
    sfxCast();

    const chum = consumeChum(save);
    const tod = getTod();
    const activity = biteActivity(save.weatherId || 'cloudy', tod);
    const onHotspot = scene.state.selectedHotspot >= 0;
    // Real bite is not guaranteed — patience + empty casts like classic fishing
    let biteChance = 0.28 + activity * 0.22;
    if (onHotspot) biteChance += 0.1;
    if (chum) biteChance += 0.08;
    if (sweet) biteChance += 0.05;
    biteChance *= Math.min(1.15, bait.biteMul || 1);
    if (rod.kind === 'spin') biteChance *= 0.85;
    if (rod.kind === 'bottom') biteChance *= 1.05;
    biteChance = Math.max(0.22, Math.min(0.62, biteChance));
    willBite = Math.random() < biteChance;
    if (isLucky() && !willBite) willBite = Math.random() < 0.35;

    pendingFish = pickFish(zone, bait, rod, {
      tod,
      hotspot: onHotspot,
      lucky: isLucky(),
      spotId: spot.id,
      spotRareMul: (spot.rareMul || 1) * (chum?.rareMul || 1),
      weatherId: save.weatherId || 'cloudy',
      chumRareMul: chum?.rareMul || 1,
    });
    biteStyle = pendingFish.bite || 'nibble';
    const range = biteWaitRange(biteStyle, rod, spot, bait, {
      activity,
      chumWaitMul: chum?.waitMul || 1,
    });
    let waitMax = range.min + Math.random() * (range.max - range.min);
    if (!willBite) waitMax *= 0.55 + Math.random() * 0.35;
    if (isLucky()) waitMax *= 0.92;
    fight = {
      waitMax,
      rod,
      bait,
      spot,
      hook,
      lineItem,
      lineLimit: effectiveLineLimit(rod, lineItem, save.lineWear || 0),
    };
    waitTimer = 0;
    nextNibble = 1.2 + Math.random() * 2;
    nibblePhase = 0;
    inBite = false;
    biteWindow = 0;
    perfectHook = false;
    onCastDone?.();
    setPhase('castfly');
  }

  function applyNibbleVisual(kind) {
    if (kind === 'soft') scene.state.biteDip = 0.22;
    if (kind === 'double') {
      scene.state.biteDip = 0.4;
      setTimeout(() => { if (phase === 'wait') scene.state.biteDip = 0.55; }, 180);
    }
    if (kind === 'drag') scene.state.biteDip = 0.65;
  }

  function triggerBite() {
    inBite = true;
    const hookMul = fight.hook?.hookMul || 1;
    const base = fight.rod.hookWindow * (sweet ? 1.12 : 1) * hookMul;
    const styleMul = biteStyle === 'aggressive' ? 0.95 : biteStyle === 'shy' ? 1.28 : biteStyle === 'long' ? 1.18 : 1.05;
    biteWindowMax = Math.max(1.05, base * styleMul);
    biteWindow = biteWindowMax;
    scene.state.biteDip = biteStyle === 'aggressive' ? 1.2 : 1;
    if (els.hookBtn) els.hookBtn.style.setProperty('--hook', '1');
    sfxBite();
    scene.shake?.(0.85);
    setPhase('bite');
  }

  function tryHook() {
    if (phase !== 'bite' && phase !== 'wait') return;
    if (phase === 'wait' || !inBite) {
      fail('miss');
      return;
    }
    const early = biteWindow / biteWindowMax;
    perfectHook = early > 0.62;
    startFight();
  }

  function startFight() {
    const fish = pendingFish;
    const sizeMul = fight.hook?.sizeMul || 1;
    const weight = rollWeight(fish, sizeMul);
    scene.setFightColor?.(fish.color || '#3d6b7a');
    scene.setFightFish?.(fish);
    if (els.fightGreen) {
      els.fightGreen.style.left = `${FIGHT_GREEN_MIN * 100}%`;
      els.fightGreen.style.width = `${(FIGHT_GREEN_MAX - FIGHT_GREEN_MIN) * 100}%`;
    }
    fight = {
      ...fight,
      fish,
      weight,
      catchClass: catchClass(fish, weight),
      tension: 0.5,
      progress: 0,
      pullTimer: 0,
      pullDir: Math.random() > 0.5 ? 1 : -1,
      reelHeld: false,
      slack: 0,
      surge: 0,
    };
    inBite = false;
    setPhase('fight');
  }

  function updateCastFly(dt) {
    if (!castFly) return;
    castFly.t += dt;
    const u = Math.min(1, castFly.t / castFly.dur);
    const ease = 1 - (1 - u) * (1 - u);
    const arc = Math.sin(u * Math.PI) * 0.14;
    scene.state.floatX = castFly.fromX + (castFly.toX - castFly.fromX) * ease;
    scene.state.floatY = castFly.fromY + (castFly.toY - castFly.fromY) * ease - arc;
    scene.state.castBend = 1 - u * 0.85;
    if (u >= 1) {
      scene.state.floatX = castFly.toX;
      scene.state.floatY = castFly.toY;
      scene.state.splash = 1;
      scene.state.castBend = 0.15;
      castFly = null;
      sfxSplash();
      scene.shake?.(0.45);
      setPhase('wait');
    }
  }

  function fail(reason) {
    sfxFail();
    scene.setFightFish?.(null);
    setPhase('idle');
    resetFloat(0.4);
    onFail(reason);
  }

  function succeed() {
    const save = getSave();
    const { fish, weight } = fight;
    let coins = sellValue(fish, weight);
    if (sweet) coins = Math.round(coins * 1.2);
    if (perfectHook) coins = Math.round(coins * 1.15);
    if (isLucky()) coins = Math.round(coins * 1.5);
    // line wear
    const wear = fight.lineItem?.wearPerFight || 0.03;
    save.lineWear = Math.min(0.85, (save.lineWear || 0) + wear);
    sfxCatch();
    scene.setFightFish?.(null);
    setPhase('idle');
    resetFloat(0.4);
    onCatch({
      fish,
      weight,
      coins,
      zone,
      sweet,
      lucky: isLucky(),
      perfectHook,
      catchClass: fight.catchClass,
      rodKind: fight.rod.kind,
    });
  }

  function updateFight(dt) {
    const f = fight;
    const fish = f.fish;
    const fightMul = f.rod.fightMul || 1;
    const pull = Math.min(0.98, fish.pull * 1.38);

    f.pullTimer -= dt;
    f.surge = Math.max(0, (f.surge || 0) - dt);
    if (f.pullTimer <= 0) {
      f.pullTimer = 0.28 + Math.random() * (0.55 + (1 - pull) * 0.35);
      f.pullDir = Math.random() > 0.42 ? 1 : -1;
      // Sudden thrash — easy to snap if holding hard
      if (Math.random() < 0.28 + pull * 0.35) {
        f.surge = 0.22 + pull * 0.28;
        f.pullDir = 1;
        scene.shake?.(0.55 + pull * 0.4);
      }
    }

    let target = 0.5 + f.pullDir * pull * 0.5;
    if (f.surge > 0) target += 0.22 + pull * 0.18;
    if (f.reelHeld) target -= 0.2 + (1 - pull) * 0.06;
    else target += 0.14 + pull * 0.08;
    f.tension += (target - f.tension) * Math.min(1, dt * (3.4 + pull));

    scene.state.fishPullX = (f.tension - 0.5) * 2.4;
    scene.state.fishPullY = Math.sin(scene.state.time * (4 + pull * 4)) * (0.35 + pull * 0.25);

    const inGreen = f.tension >= FIGHT_GREEN_MIN && f.tension <= FIGHT_GREEN_MAX;
    const progressRate = (0.045 + (1 - pull) * 0.04) * fightMul;
    if (inGreen) {
      f.progress += dt * progressRate;
      f.slack = 0;
    } else {
      f.progress = Math.max(0, f.progress - dt * (0.06 + pull * 0.04));
      if (f.tension < FIGHT_GREEN_MIN) f.slack = (f.slack || 0) + dt;
      else f.slack = 0;
    }

    const needle = Math.max(0, Math.min(1, f.tension));
    els.fightNeedle.style.left = `${needle * 100}%`;
    if (els.fightProgress) {
      els.fightProgress.style.width = `${Math.max(0, Math.min(100, f.progress * 100))}%`;
    }

    const limit = f.lineLimit || f.rod.line;
    const overSoft = limit * (0.82 - (f.catchClass === 'trophy' ? 0.06 : 0));
    if (f.tension > overSoft && Math.random() < dt * (0.55 + pull * 0.9)) {
      fail('snap');
      return;
    }
    if (f.tension > limit) {
      fail('snap');
      return;
    }
    if (f.tension < 0.12 || (f.slack || 0) > 0.7) {
      fail('escape');
      return;
    }
    if (f.progress >= 1) succeed();
  }

  function updateWait(dt) {
    waitTimer += dt;
    nextNibble -= dt;
    if (nextNibble <= 0 && waitTimer < fight.waitMax - 1.2) {
      nibblePhase += 1;
      if (biteStyle === 'nibble') {
        applyNibbleVisual(nibblePhase % 2 === 0 ? 'soft' : 'double');
        nextNibble = 1.4 + Math.random() * 2.2;
      } else if (biteStyle === 'shy') {
        applyNibbleVisual('soft');
        nextNibble = 2.2 + Math.random() * 3;
      } else if (biteStyle === 'aggressive') {
        applyNibbleVisual(Math.random() > 0.5 ? 'double' : 'drag');
        nextNibble = 0.9 + Math.random() * 1.6;
      } else {
        applyNibbleVisual(Math.random() > 0.6 ? 'drag' : 'soft');
        nextNibble = 2.5 + Math.random() * 3.5;
      }
    } else {
      scene.state.biteDip = Math.max(0, scene.state.biteDip - dt * 0.9);
    }

    if (fight.rod.kind === 'spin') {
      scene.state.floatX = Math.max(0.28, scene.state.floatX - dt * 0.015);
    }

    if (waitTimer >= fight.waitMax) {
      if (!willBite) {
        fail('empty');
        return;
      }
      triggerBite();
    }
  }

  function tick(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    if (!paused) {
      if (phase === 'power' && holding) {
        power += powerDir * dt * 1.1;
        if (power >= 1) { power = 1; powerDir = -1; }
        if (power <= 0.05) { power = 0.05; powerDir = 1; }
        scene.state.power = power;
        scene.state.castBend = power;
        els.castFill.style.width = `${Math.round(power * 100)}%`;
      }
      if (phase === 'castfly') updateCastFly(dt);
      if (phase === 'wait') updateWait(dt);
      if (phase === 'bite') {
        biteWindow -= dt;
        const left = Math.max(0, biteWindow / Math.max(0.001, biteWindowMax));
        if (els.hookBtn) els.hookBtn.style.setProperty('--hook', String(left));
        const pulse = biteStyle === 'aggressive' ? 26 : 14;
        scene.state.biteDip = 0.75 + Math.sin(scene.state.time * pulse) * 0.22;
        if (biteWindow <= 0) fail('miss');
      }
      if (phase === 'fight') updateFight(dt);
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
    scene.resize();
    scene.seedHotspots();
    const save = getSave();
    const bobber = getBobber(save.bobberId);
    const rod = getRod(save.rodId);
    scene.setBobberColor?.(bobber.color);
    scene.setRodKind?.(rod.kind);
    resetFloat(0.4);
    setPhase('idle');
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
    setReel(held) { if (fight) fight.reelHeld = held; },
    isBusy() { return phase !== 'idle'; },
    getPhase: () => phase,
  };
}
