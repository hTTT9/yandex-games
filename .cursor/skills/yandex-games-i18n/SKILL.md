---
name: yandex-games-i18n
description: >-
  Implements Yandex Games language autodetection (requirement 2.14) via
  environment.i18n.lang at startup, fallback languages (be/kk/uk/uz→ru, else en),
  and RU/EN UI localization. Use when adding i18n, localization, translations,
  environment.i18n.lang, пункт 2.14, or debug I18N indicator for Yandex Games.
---

# Локализация Яндекс Игр (п. 2.14)

Доки: [2.14](https://yandex.ru/dev/games/doc/ru/requirements/2/14.md), [языки и домены](https://yandex.ru/dev/games/doc/ru/concepts/languages-and-domains.md).

## Жёсткие правила

1. Язык брать **только** из `ysdk.environment.i18n.lang` после `YaGames.init()`.
2. Применять **на старте**, до `LoadingAPI.ready()` и до геймплея (не после «Играть»).
3. Обязательно даже для одноязычной игры.
4. В черновике «Игра переведена на» = реальные языки UI; модерация проверит все заявленные.
5. Индикатор debug «I18N is used» должен стать зелёным на старте.

## Резерв (если язык не поддержан игрой)

| SDK lang | Fallback |
|----------|----------|
| `be`, `kk`, `uk`, `uz` | `ru` |
| остальные неподдерживаемые | `en` |

Рекомендуемый минимум для трафика: **ru + en** (ещё часто tr).

## Паттерн кода

```typescript
type LangCode = 'ru' | 'en';

function resolveLang(sdkLang: string): LangCode {
  const code = (sdkLang || 'ru').toLowerCase().slice(0, 2);
  if (code === 'ru' || code === 'en') return code;
  if (['be', 'kk', 'uk', 'uz'].includes(code)) return 'ru';
  return 'en';
}

export function initI18n(sdkLang: string): LangCode {
  const lang = resolveLang(sdkLang);
  document.documentElement.lang = lang;
  return lang;
}

export type LocText = { ru: string; en: string };
export function L(text: LocText): string {
  return text[getLang()] ?? text.ru;
}
```

Все пользовательские строки (меню, навыки, события, офферы) — через словарь / `LocText`. AI-описания в консоли переводят **только карточку**, не UI игры.

## Ручной выбор языка (опционально)

Допустим; автоопределение всё равно обязательно. Меню языка — иконками/флагами без знания текущего языка (рекомендация 6.9).

## Проверка

Debug-панель → SDK mocks → переключить Ru/En; полный reload; индикатор 文 зелёный на старте. См. скилл `yandex-games-test-debug`.
