---
name: yandex-games-bootstrap
description: >-
  Starts a new Yandex Games HTML5 project: brief (age, genre, platforms),
  stack choice (vanilla or Vite/TS), folder layout, skills map, draft version
  0.x.0.0. Use when creating a new game, scaffolding repo, or asking which
  Yandex Games skill to open first.
---

# Старт нового проекта (Яндекс Игры)

Универсальный порядок для **любого** жанра и возраста. Не копировать визуал/лор прошлых игр издателя — только схему SDK/сборки.

## 1. Бриф (до кода)

Зафиксировать письменно:

| Поле | Пример значений |
|------|------------------|
| Возраст | 0+ / 6+ / 12+ / 16+ / 18+ → скилл `yandex-games-age-content` |
| Жанр / петля | runner, puzzle, sim, … — любой |
| Платформы | mobile, desktop, (TV редко) |
| Ориентация | портрет / альбом / любая |
| Языки UI | минимум ru+en, если не оговорено иначе |
| Монетизация | FS / RV / IAP / без (с комментарием) |
| Сохранения | local + cloud? |
| Уникальное название | не как у витрины Яндекса |

## 2. Карта скиллов

| Задача | Скилл |
|--------|--------|
| Возраст и запреты | `yandex-games-age-content` |
| SDK, ads, saves, IAP | `yandex-games-sdk` (+ reference-*) |
| Язык 2.14 | `yandex-games-i18n` |
| Вёрстка mobile/desktop | `yandex-games-ui-layout` |
| Сборка ZIP | `yandex-games-build-publish` |
| Черновик и медиа | `yandex-games-draft-promo` |
| Тест / debug / шум консоли | `yandex-games-test-debug` |
| Перед модерацией | `yandex-games-moderation` |

## 3. Стек

Пока пользователь не сказал иначе:

- **Простая казуалка / один архив:** vanilla `index.html` + `css/` + `js/` + `assets/` (без сборщика).
- **Сложнее / TS:** Vite + TypeScript, `base: './'` — см. `yandex-games-build-publish`.

Общее: `<script src="/sdk.js"></script>` до init; UI-язык из SDK до `LoadingAPI.ready`.

## 4. Каркас репозитория

```
index.html | src/     # код игры
promo/                # тексты, скрины, обложки — НЕ в upload zip
dist/                 # сборка / zip для консоли
skills/               # опционально: локальные скиллы агента, не продукт
```

Версия черновика до первой публикации: `0.x.0.0`.

## 5. Не делать на старте

- Тащить персонажей, рецепты, тексты, тон другой своей игры в каталоге.
- Ставить возраст «на глаз» после готового арта.
- Класть `promo/`, README, skills в ZIP для консоли.
