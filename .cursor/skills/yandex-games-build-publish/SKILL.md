---
name: yandex-games-build-publish
description: >-
  Builds and packages HTML5 Yandex Games (vanilla or Vite/TypeScript): base
  './', ZIP with index.html at root, latin paths, size under 100MB, exclude
  promo/skills. Use when building, zipping, uploading game archive, vite
  config for Yandex Games, or preparing upload zip.
---

# Сборка и выгрузка HTML5 на Яндекс Игры

Доки: п. 1.21–1.22 в [требованиях](https://yandex.ru/dev/games/doc/ru/concepts/requirements.md).

## Вариант A — Vite / TypeScript

```typescript
// vite.config.ts
export default defineConfig({
  base: './', // относительные пути в архиве на хостинге Яндекса
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // опционально: предсказуемые файлы в assets/
  },
});
```

```bash
npm run build
cd dist && zip -r -X ../dist/game-upload.zip . && cd ..
# проверить: unzip -l dist/game-upload.zip | head  → index.html в корне
```

## Вариант B — vanilla (без сборщика)

В ZIP только рантайм:

```bash
mkdir -p dist
zip -r -X dist/game-upload.zip index.html css js assets
# при необходимости: vendor/, fonts/ внутри разрешённых папок с латиницей
```

## Правила архива

1. Корень ZIP = игровые файлы (`index.html` первым уровнем), не обёртка-папка с одним `dist` внутри.
2. Имена файлов/папок: **латиница**, без пробелов.
3. Распакованный размер ≤ **100 МБ**.
4. SDK в рантайме: `/sdk.js` (платформа подставит); свой sdk в архив не обязателен.
5. **Не класть:** `promo/`, `skills/`, `.git/`, `node_modules/`, README, исходники вне бандла, `__pycache__`, черновики консоли.

## Перед заливкой в Консоль

1. Сборка без ошибок (tsc / ручной прогон).
2. Preview или локальный сервер — игра открывается.
3. ZIP соответствует правилам выше.
4. Чеклист `yandex-games-moderation` + тексты/медиа `yandex-games-draft-promo`.
5. В консоли: загрузить архив → заполнить черновик → тест с debug-панелью → на модерацию.

## Не делать

- `base: '/'` для архива на Яндексе (ломает ассеты).
- Кириллица в путях бандла.
- Класть `node_modules` / исходники / `promo` в upload zip.
