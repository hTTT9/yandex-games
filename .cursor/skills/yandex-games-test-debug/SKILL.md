---
name: yandex-games-test-debug
description: >-
  Tests Yandex Games locally and with console debug panel: local launch,
  draft mode, loader IT/IF, I18N indicator, SDK mocks, triage of platform
  console noise (_crpd MIME, adblocker, leaderboard 404). Use when debugging
  YaGames, debug-mode=16, local server, verifying LoadingAPI, i18n, ads, or
  mysterious empty mini-games before moderation.
---

# Тест и debug-панель Яндекс Игр

Доки: [локальный запуск](https://yandex.ru/dev/games/doc/ru/concepts/local-launch.md), [debug-панель](https://yandex.ru/dev/games/doc/ru/console/debug-panel.md), [режим черновика](https://yandex.ru/dev/games/doc/ru/console/draft-mode.md), [тестирование](https://yandex.ru/dev/games/doc/ru/console/test-game.md).

Вёрстка mobile/desktop при багах UI — скилл `yandex-games-ui-layout`.

## Локальная разработка

1. Dev + mock SDK, если `/sdk.js` нет (lang из `?lang=en` или mock).
2. Prod-сборка локально с `base: './'` (Vite) или static server для vanilla.
3. Для проверки на платформе: [local-launch](https://yandex.ru/dev/games/doc/ru/concepts/local-launch.md) или загрузка архива в черновик.

Реальная реклама — в prod/черновике платформы, не в чистом localhost без SDK.

## Debug-панель

Включение:

- Консоль → «Открыть с debug-панелью», или
- `?debug-mode=16` в URL: `https://yandex.ru/games/app/ID?debug-mode=16`

### Лоадер SDK

| Код | Значение |
|-----|----------|
| `W` | Ждёт init |
| `IT` | Лоадер ок |
| `IF` | Старый/неверный способ подключения — исправить по доке |

### I18N (п. 2.14)

- «I18N is used» (зелёный) — на **старте**, не после кнопки Play.
- SDK mocks → выбор языка → новая вкладка; проверить весь заявленный UI.

### Прочее

- SDK mocks: игрок / платежи / реклама.
- Performance / Game Ready — вкладка Performance в DevTools.

## Шум консоли vs баги игры

Не чинить в коде игры то, что даёт **площадка / браузер**:

| Сообщение | Что это | Действие |
|-----------|---------|----------|
| `Refused to execute script` … `yandex.ru/games/_crpd/…` MIME `application/octet-stream` | Служебный скрипт хоста с неверным Content-Type | Игнор; не ваш архив |
| `net::ERR_BLOCKED_BY_CLIENT` на `ads` / `adriver` / `yandex.ru/ads` | Adblock | Игнор при разработке |
| Leaderboard `404` в draft | Нет таблицы в консоли | Создать LB **или** тихо глотать 404 (`reference-leaderboards`) |
| Пустой мини-гейм / «ничего не происходит», логика жива | Часто нулевая ширина stage на desktop | `yandex-games-ui-layout` |

Свои ошибки: uncaught в вашем `js`/`src`, красный лоадер `IF`, Ready до i18n.

## Мини-чеклист перед модерацией

1. Лоадер `IT`, init без ошибок **вашего** кода.
2. I18N зелёный на старте; mock всех языков черновика.
3. FS в логической паузе; RV по кнопке; звук паузится.
4. F5 сохраняет прогресс; cloud-флаг согласован.
5. Mobile + desktop (заявленные), ориентация = черновик.
6. Нет браузерного скролла и longtap-меню на игровом поле.
7. Desktop: UI не «размазан» и не схлопнут (см. ui-layout).
