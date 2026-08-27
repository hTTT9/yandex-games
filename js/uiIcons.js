/** Unique SVG icons for shop, gear strip, tabs, spots */

const svg = (paths, view = '0 0 24 24', attrs = '') =>
  `<svg viewBox="${view}" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${paths}</svg>`;

const ROD_ICONS = {
  reed: '<path d="M5 18c4-3 7 2 12 0"/><path d="M15 12l5-8"/><path d="M7 16l1-4"/><circle cx="7" cy="18" r="1.8" fill="currentColor" stroke="none"/>',
  pine: '<path d="M4 17c5-2 8 3 12 1"/><path d="M15 12l4-7"/><path d="M10 10l-1 3M12 8l-1 3"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
  cedar: '<path d="M4 17c5-1 9 2 13 0"/><path d="M16 11l4-7"/><path d="M9 9h3M10 12h2"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
  bamboo: '<path d="M5 18c4-2 8 2 12 0"/><path d="M15 12l5-8"/><path d="M8 14h2M10 11h2M12 8h2"/><circle cx="7" cy="18" r="1.8" fill="currentColor" stroke="none"/>',
  match: '<path d="M4 17c6-1 9 2 14 0"/><path d="M16 10l5-7"/><circle cx="10" cy="12" r="1.2"/><circle cx="13" cy="9" r="1.2"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
  carbon: '<path d="M4 17c6-2 10 2 14 0"/><path d="M16 10l5-7"/><path d="M8 14l8-6"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
  telescopic: '<path d="M5 18c4-2 8 1 12-1"/><path d="M15 12l5-8"/><path d="M9 15h3M11 12h3M13 9h3"/><circle cx="7" cy="18" r="1.8" fill="currentColor" stroke="none"/>',
  spin_light: '<path d="M5 16c5-3 8 1 12-1"/><path d="M15 11l4-6"/><circle cx="17" cy="6" r="2.2"/><circle cx="7" cy="16" r="2" fill="currentColor" stroke="none"/>',
  spin_mid: '<path d="M4 16c6-2 9 2 13 0"/><path d="M15 11l5-7"/><circle cx="18" cy="5" r="2.5"/><path d="M17 5h2"/><circle cx="7" cy="16" r="2" fill="currentColor" stroke="none"/>',
  spin_heavy: '<path d="M3 17c6-2 10 2 15 0"/><path d="M15 11l5-6"/><circle cx="18" cy="5" r="3"/><path d="M16 5h4M18 3v4"/><circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
  spin_ultra: '<path d="M5 16c4-3 8 1 11-1"/><path d="M14 11l4-6"/><circle cx="16.5" cy="6" r="1.8"/><path d="M7 14c1-2 2-3 3-3"/><circle cx="7" cy="16" r="1.8" fill="currentColor" stroke="none"/>',
  feeder_light: '<path d="M4 17c5-1 9 1 13 0"/><path d="M14 12l3-5"/><rect x="15" y="5" width="5" height="4" rx="1"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
  feeder_carp: '<path d="M3 17c6-1 10 2 15 0"/><path d="M14 12l4-5"/><rect x="15" y="4" width="6" height="5" rx="1"/><path d="M16 6h4"/><circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
  feeder_method: '<path d="M3 17c6 0 11 2 15 0"/><path d="M14 12l3-4"/><path d="M15 5h5l-1 4h-3z"/><circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
  fly_light: '<path d="M5 17c4-3 8 1 11-1"/><path d="M14 11l3-5"/><path d="M16 5c2 0 3 2 2 3l-3-1"/><circle cx="7" cy="17" r="1.8" fill="currentColor" stroke="none"/>',
  boat_troll: '<path d="M3 17c7-1 11 2 16 0"/><path d="M15 11l5-6"/><circle cx="18" cy="5" r="2.8"/><path d="M5 14h4"/><circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
  carbon_pro: '<path d="M4 17c6-2 10 2 14 0"/><path d="M16 10l5-7"/><path d="M8 14l8-6M10 12h6"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
  spin_legend: '<path d="M3 17c6-2 10 2 15 0"/><path d="M15 11l5-6"/><circle cx="18" cy="5" r="3"/><path d="M12 3l1 2 2 .3-1.5 1.4.4 2L12 7.5 9.1 8.7l.4-2L8 5.3l2-.3L12 3z"/><circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
  feeder_pro: '<path d="M3 17c6 0 11 2 15 0"/><path d="M14 12l3-4"/><path d="M15 5h5l-1 4h-3z"/><path d="M16 7h3"/><circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none"/>',
  night_match: '<path d="M4 17c6-1 9 2 14 0"/><path d="M16 10l5-7"/><path d="M14 6a3 3 0 11-4-2"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>',
};

const BAIT_ICONS = {
  bread: '<circle cx="12" cy="13" r="6"/><path d="M9 12h6M10 15h4"/>',
  worm: '<path d="M6 14c2-4 4-2 6-5s3 1 5 4"/><circle cx="7" cy="14" r="1.2" fill="currentColor" stroke="none"/>',
  bloodworm: '<path d="M5 15c3-5 5-2 7-6s4 0 6 5"/><path d="M8 12l1 2M12 9l1 2"/>',
  dough: '<ellipse cx="12" cy="13" rx="7" ry="5"/><path d="M9 12c1 1 2 1 3 0s2-1 3 0"/>',
  maggot: '<ellipse cx="12" cy="12" rx="3" ry="7"/><path d="M12 6v1"/>',
  cheese: '<path d="M4 14l8-8 8 8v4H4z"/><circle cx="10" cy="15" r="1"/><circle cx="14" cy="16" r="1"/>',
  corn: '<ellipse cx="12" cy="13" rx="4" ry="7"/><path d="M10 10h4M10 13h4M10 16h4"/>',
  squid: '<path d="M8 8c2-3 6-3 8 0 1 2 0 5-2 7l-2 3-2-3c-2-2-3-5-2-7z"/><path d="M10 16l-1 4M14 16l1 4M12 17v4"/>',
  livebait: '<path d="M4 14c3-4 7-4 10 0s7 4 8 0"/><circle cx="8" cy="13" r="1.5" fill="currentColor" stroke="none"/>',
  nightcrawler: '<path d="M5 15c3-5 5-2 7-6s4 0 6 5"/><path d="M14 8a3 3 0 11-2-2"/>',
  halo: '<circle cx="12" cy="13" r="5"/><circle cx="12" cy="13" r="8" opacity=".5"/><path d="M12 5v2"/>',
  pellet: '<circle cx="9" cy="12" r="3"/><circle cx="15" cy="12" r="3"/><circle cx="12" cy="16" r="2.5"/>',
  boilie: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.5"/>',
  shine: '<path d="M12 4l2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1z"/>',
  spinner: '<circle cx="12" cy="12" r="3"/><path d="M12 5v3M12 16v3M5 12h3M16 12h3"/><path d="M8 8l2 2M14 14l2 2M16 8l-2 2M10 14l-2 2"/>',
  minnow: '<path d="M4 12c4-4 8-4 12 0s4 5 4 5l-4-1c-3 2-7 2-10-1"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>',
  frog: '<circle cx="9" cy="10" r="3"/><circle cx="15" cy="10" r="3"/><ellipse cx="12" cy="15" rx="5" ry="3"/><path d="M7 17l-2 3M17 17l2 3"/>',
  pearl: '<circle cx="12" cy="12" r="6"/><path d="M9 11c1-2 5-2 6 0"/>',
};

const HOOK_ICONS = {
  hook_s: '<path d="M12 3v9"/><path d="M12 12a3.2 3.2 0 103.2 3.2"/>',
  hook_m: '<path d="M12 3v10"/><path d="M12 13a4 4 0 104 4"/>',
  hook_l: '<path d="M12 2v11"/><path d="M12 13a5 5 0 105 5"/><path d="M10 4h4"/>',
  hook_pro: '<path d="M8 5c4 0 7 3 7 7 0 5-4 8-7 10-3-2-7-5-7-10 0-4 3-7 7-7z"/><path d="M12 9v4M10 11h4"/>',
  hook_night: '<path d="M8 5c4 0 7 3 7 7 0 5-4 8-7 10-3-2-7-5-7-10 0-4 3-7 7-7z"/><path d="M14 7a3 3 0 11-3-2"/>',
  hook_xl: '<path d="M12 2v11"/><path d="M12 13a5.5 5.5 0 105.5 5.5"/><path d="M9 5h6"/><circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none"/>',
  hook_circle: '<path d="M12 3v8"/><circle cx="12" cy="16" r="5"/><path d="M12 11v2"/>',
  hook_barbless: '<path d="M12 3v10"/><path d="M12 13a4 4 0 104 4"/><path d="M15 16l2-1"/>',
};

const LINE_ICONS = {
  line_thin: '<path d="M4 8c5 0 5 4 10 4s5 4 6 4"/><path d="M4 14c4 0 4 3 8 3"/>',
  line_mid: '<path d="M4 7c5 0 5 4 10 4s5 5 6 5"/><path d="M4 13c5 0 5 4 10 4"/><path d="M4 18c3 0 3 2 6 2"/>',
  line_thick: '<path d="M3 7c6 0 6 5 12 5s5 5 6 5" stroke-width="2.6"/><path d="M3 14c5 0 5 4 10 4" stroke-width="2.4"/>',
  line_pro: '<path d="M4 18c4-6 8-6 12-12"/><path d="M14 8l3-3M16 6l2 2"/><path d="M8 14h4"/>',
  line_night: '<path d="M4 18c4-6 8-6 12-12"/><path d="M14 7a3 3 0 11-2-2"/>',
  line_braid: '<path d="M4 8c3 2 5-2 8 0s5-2 8 0"/><path d="M4 13c3 2 5-2 8 0s5-2 8 0"/><path d="M4 18c3 2 5-2 8 0"/>',
  line_fluoro: '<path d="M4 9c5 0 5 3 10 3s5 3 6 3"/><path d="M6 15c4 0 4 2 8 2"/><circle cx="18" cy="7" r="2"/>',
};

const CHUM_ICONS = {
  chum_mix: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M10 14h4"/>',
  chum_sweet: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M12 13l1 2-1 2-1-2z"/>',
  chum_fish: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M10 15c1-1 3-1 4 0"/>',
  chum_garlic: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><circle cx="12" cy="15" r="2"/>',
  chum_spicy: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M12 13v5M10 15h4"/>',
  chum_honey: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M10 14c1 2 3 2 4 0"/>',
  chum_hemp: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M12 13v5M10 14l4 2M10 17l4-2"/>',
  chum_anise: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M12 14l2 1-2 1-2-1z"/>',
  chum_blood: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M12 13c2 2 0 5 0 5s-2-3 0-5z"/>',
  chum_carp: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><ellipse cx="12" cy="15" rx="3" ry="2"/>',
  chum_predator: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M9 15l3-2 3 2-3 2z"/>',
  chum_night: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M14 14a3 3 0 11-4-2.5"/>',
  chum_vanilla: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><path d="M10 15h4M11 13v4"/>',
  chum_cocoa: '<path d="M8 9h8l-1 10H9L8 9z"/><path d="M10 9V7a2 2 0 014 0v2"/><circle cx="11" cy="15" r="1"/><circle cx="14" cy="15" r="1"/>',
};

const BOBBER_ICONS = {
  classic: '<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M9 10h6"/>',
  amber: '<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M10 8l2 2 2-2"/>',
  mint: '<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M12 7v6"/>',
  violet: '<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M9 9l3 3 3-3"/>',
  neon: '<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M8 10h8"/><circle cx="12" cy="10" r="2"/>',
  nightglow: '<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M14 8a3 3 0 01-3 4"/>',
};

const TAB_ICONS = {
  rods: ROD_ICONS.reed,
  baits: BAIT_ICONS.worm,
  gear: HOOK_ICONS.hook_m,
  chum: CHUM_ICONS.chum_mix,
  extra: '<path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="8"/>',
  boosts: '<path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z"/>',
  journal: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 8h7M9 12h5"/>',
  goals: '<path d="M12 3l2 6h6l-5 4 2 6-5-3.5L7 19l2-6-5-4h6z"/>',
  tips: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 014 10c-.8.8-1.2 1.6-1.4 2.5H9.4C9.2 14.6 8.8 13.8 8 13a6 6 0 014-10z"/>',
  friends: '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.5"/><path d="M3 19c1-3 3-4.5 6-4.5S14 16 15 19"/>',
};

export function shopIcon(kind) {
  const map = {
    rod: ROD_ICONS.reed,
    bait: BAIT_ICONS.worm,
    hook: HOOK_ICONS.hook_m,
    line: LINE_ICONS.line_thin,
    chum: CHUM_ICONS.chum_mix,
    bg: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 14l4-3 3 2 4-4 5 5"/>',
    bobber: BOBBER_ICONS.classic,
    net: '<ellipse cx="12" cy="14" rx="7" ry="5"/><path d="M12 4v5M9 14h6M10 12v4M14 12v4"/><path d="M5 14c2 3 5 4 7 4s5-1 7-4"/>',
    skin: '<path d="M6 18c2-6 4-10 6-14 2 4 4 8 6 14"/><path d="M8 14h8"/>',
    boosts: TAB_ICONS.boosts,
  };
  return svg(map[kind] || map.rod);
}

export function itemIcon(kind, id) {
  let paths = null;
  if (kind === 'rod') paths = ROD_ICONS[id] || ROD_ICONS.reed;
  else if (kind === 'bait') paths = BAIT_ICONS[id] || BAIT_ICONS.worm;
  else if (kind === 'hook') paths = HOOK_ICONS[id] || HOOK_ICONS.hook_m;
  else if (kind === 'line') paths = LINE_ICONS[id] || LINE_ICONS.line_thin;
  else if (kind === 'chum') paths = CHUM_ICONS[id] || CHUM_ICONS.chum_mix;
  else if (kind === 'bobber') paths = BOBBER_ICONS[id] || BOBBER_ICONS.classic;
  else if (kind === 'net') paths = '<ellipse cx="12" cy="14" rx="7" ry="5"/><path d="M12 4v5M9 14h6M10 12v4M14 12v4"/><path d="M5 14c2 3 5 4 7 4s5-1 7-4"/>';
  else return shopIcon(kind);
  return svg(paths);
}

export function tabIcon(id) {
  return svg(TAB_ICONS[id] || TAB_ICONS.extra);
}

export function loadoutIcon(n) {
  // Clear rod glyph + slot badge (no cryptic circled digits)
  return svg(
    `<path d="M4 19l13-13"/><path d="M3 18c2.2 2.2 4.2 1.4 4.8-.6"/><path d="M6.5 21h3.5"/><path d="M17 6c2.4 1.1 3.6 3.4 2.8 5.6"/><path d="M19.8 11.6v3.2a1.9 1.9 0 11-1.9 1.9"/><circle cx="18" cy="19" r="4" fill="rgba(0,0,0,0.25)" stroke="currentColor"/><path d="${
      n === 2
        ? 'M16.6 18.2c.5-.8 2.6-.9 2.6.3 0 1.1-2.4 1.3-2.4 2.5h3'
        : n === 3
          ? 'M16.7 17.6c.6-.7 2.5-.5 2.5.7 0 .7-1.2.9-1.2.9s1.6.1 1.6 1.1c0 1.1-1.8 1.2-2.6.4'
          : 'M18 16.8v4.2M16.8 21h2.4'
    }" stroke-width="1.7"/>`
  );
}

export function achievementIcon(id) {
  const map = {
    first_catch: ROD_ICONS.reed,
    catch10: '<path d="M8 17l2-10 2 6 2-4 2 8"/>',
    catch25: '<path d="M5 17l3-12 3 8 3-5 3 9"/><path d="M7 17h12"/>',
    catch50: '<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>',
    catch100: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
    catch200: '<path d="M4 12h16M12 4v16"/><circle cx="12" cy="12" r="9"/>',
    combo3: '<path d="M8 17l2-10 2 6 2-4 2 8"/>',
    combo5: '<path d="M5 17l3-12 3 8 3-5 3 9"/><path d="M7 17h12"/>',
    combo7: '<path d="M5 17l3-12 3 8 3-5 3 9"/><path d="M7 17h12"/>',
    combo10: '<path d="M4 18l4-14 3 8 3-6 4 12"/><path d="M6 18h12"/>',
    combo15: '<path d="M3 18l4-14 3 9 3-7 3 8 4-10"/><path d="M5 18h14"/>',
    collector5: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 8h7M9 12h5"/>',
    collector12: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 8h7M9 12h7M9 16h4"/>',
    collector20: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 8h7M9 12h7M9 16h7"/>',
    collector35: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 9l2 2 4-4"/>',
    collector50: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 9l2 2 4-4M9 15h7"/>',
    collectorAll: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 9l2 2 4-4"/>',
    big_one: '<path d="M4 14c3-4 7-4 10 0s7 4 8 0"/><circle cx="8" cy="13" r="1.5" fill="currentColor" stroke="none"/>',
    big_1500: '<path d="M3 15c4-5 8-5 12 0s7 4 8-1"/><circle cx="7" cy="14" r="1.5" fill="currentColor" stroke="none"/>',
    big_2000: '<path d="M2 16c5-6 9-6 14 0s7 3 8-2"/><circle cx="7" cy="15" r="1.6" fill="currentColor" stroke="none"/>',
    prize_first: '<path d="M12 3l2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3z"/>',
    prize_5: '<path d="M8 3l1.5 3L13 7l-2.5 2.2.6 3.3L8 11l-3.1 1.5.6-3.3L3 7l3.5-1L8 3z"/><path d="M16 8l1.2 2.4 2.6.4-1.9 1.8.5 2.6L16 14l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4L16 8z"/>',
    legend: '<path d="M12 3l2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3z"/>',
    legend3: '<path d="M12 2l1.8 3.6L18 6.2l-2.8 2.7.7 3.9L12 11.2 8.1 12.8l.7-3.9L6 6.2l4.2-.6L12 2z"/><path d="M7 16l1 2 2 .3-1.5 1.4.4 2L7 20.5 4.1 21.7l.4-2L3 18.3l2-.3L7 16z"/><path d="M17 16l1 2 2 .3-1.5 1.4.4 2L17 20.5l-2.9 1.2.4-2-1.5-1.4 2-.3L17 16z"/>',
    epic_first: '<path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z"/>',
    rank3: '<path d="M12 3l2 6h6l-5 4 2 6-5-3.5L7 19l2-6-5-4h6z"/>',
    rank5: '<path d="M12 3l2 6h6l-5 4 2 6-5-3.5L7 19l2-6-5-4h6z"/>',
    rank8: '<path d="M12 2l2.4 5 5.6.5-4.2 3.8 1.3 5.4L12 14.2 7 16.7l1.2-5.4L4 7.5l5.6-.5L12 2z"/>',
    rank12: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    rank40: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
    rank50: '<path d="M12 2l2.4 5 5.6.5-4.2 3.8 1.3 5.4L12 14.2 7 16.7l1.2-5.4L4 7.5l5.6-.5L12 2z"/>',
    catch750: '<circle cx="12" cy="12" r="9"/><path d="M7 12h10M9 9h6M9 15h6"/>',
    tank_full: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M7 14c2-2 4 2 6 0s3-3 5-1"/>',
    trophy_wall: '<path d="M8 4h8v3a4 4 0 01-8 0V4z"/><path d="M6 4h2M16 4h2M12 11v5M9 20h6"/>',
    trophy_full: '<path d="M7 3h10v4a5 5 0 01-10 0V3z"/><path d="M5 3h2M17 3h2M12 12v4M8 20h8"/>',
    casts25: '<path d="M4 15c5-2 8 3 12 1"/><path d="M16 12l5-8"/>',
    casts100: '<path d="M3 16c6-3 9 3 14 1"/><path d="M15 11l6-8"/><path d="M5 20h12"/>',
    casts250: '<path d="M2 17c7-4 10 3 16 0"/><path d="M14 10l7-7"/><circle cx="6" cy="19" r="1.5"/>',
    perfect5: '<path d="M12 3v10"/><path d="M12 13a4 4 0 104 4"/>',
    perfect20: '<path d="M12 2v11"/><path d="M12 13a5 5 0 105 5"/><path d="M9 7h6"/>',
    perfect50: '<path d="M12 2v11"/><path d="M12 13a5 5 0 105 5"/><path d="M8 6h8M10 9h4"/>',
    hotcove_open: '<path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    multi_rod: '<path d="M4 16c4-2 6 2 10 0"/><path d="M8 14c4-2 6 2 10 0"/><path d="M14 10l4-6"/>',
    spots4: '<path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/>',
    spots8: '<path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/><path d="M9 10h6"/>',
    spots12: '<path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/><path d="M9 10h6M12 7v6"/>',
    night_owl: '<path d="M16 14a6 6 0 11-8.5-5.4A7 7 0 0016 14z"/>',
    rain_catch: '<path d="M8 14h8a4 4 0 00-8-3.5A3.5 3.5 0 008 14z"/><path d="M9 18l1 3M12 17l1 4M15 18l1 3"/>',
    chum_user: CHUM_ICONS.chum_mix || '<circle cx="12" cy="12" r="6"/>',
    rich200: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 10h4.5a2 2 0 010 4H9"/>',
    rich800: '<circle cx="12" cy="12" r="8"/><path d="M9 9h4a2.5 2.5 0 010 5H9M9 14h5"/>',
    rich2000: '<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M8 11h8M8 15h5"/>',
    friend_ping: '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.5"/><path d="M3 19c1-3 3-4.5 6-4.5S14 16 15 19"/>',
  };
  return svg(map[id] || '<circle cx="12" cy="9" r="5"/><path d="M8 21h8"/>');
}

export const MENU_TIPS_RU = [
  'Горячая точка + прикормка — шанс на редкую выше.',
  'Не зажимайте «Тянуть»: пульсируйте в зелёной зоне.',
  'Износ лески растёт — меняйте леску в магазине.',
  'Вечер и дождь усиливают клёв хищника.',
  'Спиннинг клюёт быстрее, но окно подсечки короче.',
  'Наживка + место + время + погода — смотрите карточку рыбы.',
  '«Рекордная» — редкий крупный экземпляр, заметно тяжелее среднего.',
  'Ежедневная серия даёт бонус монет — заходите каждый день.',
  'В обзоре на пирсе есть лента друзей (готовые фразы).',
  'Закрепите любимое место в профиле — видно с первого взгляда.',
  'Откройте карточку рыбы в журнале — там подсказки по местам и наживке.',
];

export const MENU_TIPS_EN = [
  'Hotspot + chum boosts rare odds.',
  'Pulse Pull — don’t hold the reel forever.',
  'Line wear adds up — replace it in the shop.',
  'Evening rain favors predators.',
  'Spin bites faster, but the hook window is tighter.',
  '“Record” size — a rare heavy specimen, well above average.',
  'Daily streak grants coin bonuses — drop by every day.',
  'Pin a favorite spot on your profile.',
  'Open a fish card in the journal for spot and bait hints.',
];
