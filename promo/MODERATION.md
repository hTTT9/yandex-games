# Moderation checklist — Quiet Cove / Тихая заводь
# See also .cursor/skills/yandex-games-moderation/SKILL.md

## Must
- [x] /sdk.js + YaGames.init (mock locally)
- [x] i18n from environment.i18n.lang before LoadingAPI.ready
- [x] LoadingAPI.ready when UI interactive
- [x] GameplayAPI start on pier / stop on menu, pause, ads, hidden tab
- [x] localStorage + player setData/getData
- [x] Mute audio on ads / visibility hidden
- [x] contextmenu prevented (no inputs that need it)
- [x] Portrait phone frame, no page scroll
- [x] Age 6+: soft tone, no blood/horror/public UGC
- [x] RV only via buttons; reward in onRewarded path
- [x] FS gated: not first 90s, cooldown 3 min
- [x] IAP cosmetic only (rod skin); F2P complete
- [x] ZIP: dist/quiet-cove.zip without promo/

## Before submit
- [ ] Play in draft debug panel
- [ ] Fill console from promo/CONSOLE.txt
- [ ] Screenshots via ?shot=pier|menu|catch|journal|shop&layout=mobile|desktop
- [ ] Enable cloud saves flag in console
- [ ] Register IAP product quiet_cove_rod_skin if selling
