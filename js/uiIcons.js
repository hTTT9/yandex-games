/** Compact SVG icons for shop rows and achievements */

const svg = (paths, view = '0 0 24 24') =>
  `<svg viewBox="${view}" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export function shopIcon(kind) {
  const map = {
    rod: svg('<path d="M4 16c5-2 8 3 12 1"/><path d="M16 12l5-8"/><circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>'),
    bait: svg('<path d="M12 3c3 4 6 6 6 10a6 6 0 11-12 0c0-4 3-6 6-10z"/>'),
    hook: svg('<path d="M12 3v10"/><path d="M12 13a4 4 0 104 4"/>'),
    line: svg('<path d="M5 7c4 0 4 4 8 4s4 4 6 4"/><path d="M5 12c3 0 3 3 6 3s4 3 8 3"/>'),
    chum: svg('<path d="M8 10h8l-1 9H9L8 10z"/><path d="M10 10V8a2 2 0 014 0v2"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/>'),
    bg: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 14l4-3 3 2 4-4 5 5"/>'),
    bobber: svg('<circle cx="12" cy="10" r="5"/><path d="M12 15v5"/><path d="M9 10h6"/>'),
    skin: svg('<path d="M6 18c2-6 4-10 6-14 2 4 4 8 6 14"/><path d="M8 14h8"/>'),
  };
  return map[kind] || map.rod;
}

export function achievementIcon(id) {
  const map = {
    first_catch: svg('<path d="M4 15c5-2 8 3 12 1"/><path d="M14 12l5-7"/><circle cx="8" cy="16" r="2" fill="currentColor" stroke="none"/>'),
    combo3: svg('<path d="M8 17l2-10 2 6 2-4 2 8"/>'),
    combo7: svg('<path d="M5 17l3-12 3 8 3-5 3 9"/><path d="M7 17h12"/>'),
    collector5: svg('<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 8h7M9 12h5"/>'),
    collector12: svg('<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 8h7M9 12h7M9 16h4"/>'),
    collectorAll: svg('<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M9 9l2 2 4-4"/>'),
    big_one: svg('<path d="M4 14c3-4 7-4 10 0s7 4 8 0"/><circle cx="8" cy="13" r="1.5" fill="currentColor" stroke="none"/>'),
    legend: svg('<path d="M12 3l2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3z"/>'),
    rank5: svg('<path d="M12 3l2 6h6l-5 4 2 6-5-3.5L7 19l2-6-5-4h6z"/>'),
    tank_full: svg('<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M7 14c2-2 4 2 6 0s3-3 5-1"/>'),
  };
  return map[id] || svg('<circle cx="12" cy="9" r="5"/><path d="M8 21h8"/>');
}

export const MENU_TIPS_RU = [
  'Горячая точка + прикормка — шанс на редкую выше.',
  'Не зажимайте «Тянуть»: пульсируйте в зелёной зоне.',
  'Износ лески растёт — меняйте леску в магазине.',
  'Вечер и дождь усиливают клёв хищника.',
  'Спиннинг клюёт быстрее, но окно подсечки короче.',
];

export const MENU_TIPS_EN = [
  'Hotspot + chum boosts rare odds.',
  'Pulse Pull — don’t hold the reel forever.',
  'Line wear adds up — replace it in the shop.',
  'Evening rain favors predators.',
  'Spin bites faster, but the hook window is tighter.',
];
