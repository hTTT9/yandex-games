---
name: yandex-games-ui-layout
description: >-
  Layout and responsive UI for Yandex Games HTML5: mobile phone frame vs
  desktop 16:9, safe areas, flex/grid collapse bugs, canvas HiDPI, touch vs
  mouse, no browser scroll. Use when fixing desktop stretch, empty mini-game
  stages, room/dock layouts, safe-area, or mobile/desktop screenshots.
---

# UI и вёрстка под Яндекс Игры

Платформа крутит игру в iframe: телефон (портрет) и десктоп (часто широкий кадр). Стек и стиль игры — любые; правила ниже — про **оболочку и баги вёрстки**.

Доки: п. 1.6, 1.10 в [требованиях](https://yandex.ru/dev/games/doc/ru/concepts/requirements.md).

## Два viewport’а

| Режим | Цель | Практика |
|--------|------|----------|
| Mobile / портрет | Одна колонка, палец | `#app` с `max-width` ~420–480px по центру **или** full-bleed под заявленную ориентацию |
| Desktop / широкий | Не растягивать mobile-UI на весь 1920 | Ограничить ширину приложения (~900–1200px) **или** отдельный 2-колоночный layout; табы/кнопки — `auto`/`flex`, не `1fr` на всю ширину |

Заявленные в черновике платформы и ориентация = то, что реально работает.

## Обязательный UX платформы

- Нет браузерного скролла страницы и swipe-to-refresh на игровом поле (п. 1.10).
- Нет системного longtap-меню на canvas/кнопках (`contextmenu` prevent; inputs — исключение).
- Safe-area: `env(safe-area-inset-*)` для notch/home indicator.
- `100dvh` / flex-колонка `min-height: 0` у цепочки скролла, иначе внутренние панели «ломают» высоту.

## Частые баги (ловят на десктопе и в draft)

### 1. Flex-потомок с `margin: auto` и нулевой шириной

Пустой `position: relative` stage (баблы, падающие объекты) с `margin-left/right: auto` и без `width: 100%` в column-flex **схлопывается в 0px**. Игра «ничего не делает», хотя логика жива.

**Фикс:** `width: 100%; max-width: …; align-self: center;` (не полагаться на auto-margins для пустого flex-item).

### 2. Сетка мини-игры растягивается в «столбики»

`grid` + `flex: 1` + `height: 100%` у ячеек на высоком экране → вытянутые pills.

**Фикс:** у доски `aspect-ratio` (1/1, 4/3, …), `width: min(100%, Npx)`, `flex: 0 1 auto`, у ячеек `aspect-ratio: 1`.

### 3. Canvas мыльный на desktop

Фиксированные `canvas.width/height` без DPR.

**Фикс:** логический размер W×H + `devicePixelRatio` (cap ~2–2.5) + `ctx.setTransform(dpr,…)`; координаты указателя из `getBoundingClientRect`.

### 4. Табы «резиной» на всю ширину

`grid-template-columns: 1fr 1fr 1fr` на широком `#app` → тонкие растянутые кнопки.

**Фикс на wide:** `display: flex; flex-wrap; justify-content: center;` + `width: auto; min-width: …`.

## Управление

- Mobile-first: pointer events; для десктопа не требовать раскладку клавиатуры (п. 1.6).
- Если есть drag и tap — порог движения (~8–10px), иначе клик срабатывает дважды.
- Capture pointer на drag/catch-корзине.

## Скрины

- Mobile превью: 9:16. Desktop: **ровно 16:9** (часто 1920×1080 или 1280×720).
- Если UI уже́е кадра — letterbox цветом фона игры, не обрезать важные контролы.
- Желателен режим съёмки (`?shot=…&layout=mobile|desktop`) без SDK-шума.

## Антипаттерны

- Один mobile-layout на весь desktop без max-width / без desktop-ветки.
- Декор «пустыми» полями внизу экрана вместо dock/панели действий.
- Полагаться на emoji как единственные иконки матч-3 (на части клиентов «?»); лучше символы/SVG.
