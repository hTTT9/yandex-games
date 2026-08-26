---
name: yandex-games-sdk
description: >-
  Integrates Yandex Games SDK for HTML5/TypeScript games: connect /sdk.js,
  YaGames.init, LoadingAPI.ready, GameplayAPI start/stop, environment, pause
  audio on ads, player cloud data, fullscreen/rewarded ads, in-app purchases,
  leaderboards. Use when working on Yandex Games, YaGames, ysdk, LoadingAPI,
  GameplayAPI, showFullscreenAdv, showRewardedVideo, getPlayer, setData,
  payments, leaderboards, or monetization via Yandex Games SDK.
---

# Yandex Games SDK (HTML5)

Источник: [документация](https://yandex.ru/dev/games/doc/ru/), индекс [llms.txt](https://yandex.ru/dev/games/doc/ru/llms.txt).
Типы: `@types/ysdk` (если TypeScript).

Стек любой: vanilla JS или Vite/TS — порядок init одинаковый. Возраст и тон контента — скилл `yandex-games-age-content`.

## Обязательный порядок старта

1. Подключить SDK: относительный `/sdk.js` (архив на сервере Яндекса) **до** `YaGames.init()`.
2. `const ysdk = await YaGames.init()` (клиентские платежи: без `signed` / `signed: false`).
3. Сразу прочитать `ysdk.environment.i18n.lang` и применить локаль (**до** Ready) — см. скилл `yandex-games-i18n`.
4. При необходимости: `getPlayer()`, `getPayments()`, leaderboards.
5. Когда UI готов к взаимодействию и **нет** экрана загрузки: `ysdk.features.LoadingAPI?.ready()`.
6. Геймплей: `GameplayAPI.start()` / `stop()` по правилам ниже.

На хостинге Яндекса путь скрипта: `/sdk.js`. На своём домене (iframe) — абсолютный URL из доки.

## GameplayAPI

| Вызов | Когда |
|--------|--------|
| `start()` | Старт/возобновление уровня, закрытие меню, снятие паузы, после рекламы, возврат во вкладку |
| `stop()` | Конец уровня / поражение, меню, пауза, **перед** FS/RV рекламой, уход со вкладки |

После `stop` при возобновлении снова вызвать `start`.

## Звук и фокус (п. 1.3, 4.7)

- При потере фокуса / `visibilitychange` / событиях `game_api_pause` — остановить звук.
- Перед FS/RV: `GameplayAPI.stop()` + пауза аудио; в `onClose` — resume аудио (если вкладка видима) + при необходимости `start()`.

## Модули

- Сохранения: [reference-saves.md](reference-saves.md)
- Реклама: [reference-ads.md](reference-ads.md)
- Инапы: [reference-iap.md](reference-iap.md)
- Лидерборды: [reference-leaderboards.md](reference-leaderboards.md)

## Каркас обёртки (TypeScript)

```typescript
export async function initYandexSdk(): Promise<SDK | null> {
  await loadSdkScript(); // /sdk.js, fallback mock для локалки
  try {
    const ysdk = await window.YaGames!.init();
    initI18n(ysdk.environment.i18n.lang); // до Ready
    await initPlayer(ysdk);
    await initPayments(ysdk);
    ysdk.features.LoadingAPI?.ready();
    return ysdk;
  } catch {
    initI18n('ru');
    return null;
  }
}
```

Локально без `/sdk.js`: mock `YaGames.init` с `environment.i18n.lang`, пустыми adv/payments и `localStorage` вместо cloud.

## Антипаттерны

- `LoadingAPI.ready()` на экране загрузки или до применения языка
- Язык из `navigator.language` вместо SDK
- Платежи/реклама вне SDK
- `setInterval(() => showFullscreenAdv())` — риск фрода и отказа
- Награда RV без `onRewarded` (только по `onClose`)
- Лидерборд без таблицы в консоли + необработанный 404 в draft
