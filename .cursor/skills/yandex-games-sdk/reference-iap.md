# Инап-покупки (payments)

Доки: [sdk-purchases](https://yandex.ru/dev/games/doc/ru/sdk/sdk-purchases.md), [требования 1.13](https://yandex.ru/dev/games/doc/ru/requirements/1/13.md), [консоль](https://yandex.ru/dev/games/doc/ru/console/purchases.md).

## Правила

- Платежи только через SDK (п. 1.4); без внешних магазинов.
- Товары в игре = активные товары в Консоли (п. 1.13.6).
- Цена и валюта с каталога SDK (`price`, иконка валюты) — не хардкодить «₽» как единственный вариант (п. 1.13.2, 1.13.4).
- Описание/картинка покупки в UI = оффер в консоли (п. 1.13.5).
- Расходуемые: `consumePurchase` после начисления (п. 1.13.1).
- Нерасходуемые (например `remove_ads`): не consume; синхронизировать через `getPurchases` при старте.
- Прогресс покупок — в облаке (п. 1.13.3). На ТВ инапы запрещены (п. 1.6.3.4).

## Поток

```typescript
const payments = await ysdk.getPayments(); // или ysdk.payments
const catalog = await payments.getCatalog();
const owned = await payments.getPurchases();
await payments.purchase({ id: PRODUCT_ID });
// consumable: await payments.consumePurchase(purchaseToken);
```

Клиент: `YaGames.init()` без `signed: true`. Серверная проверка подписи — только если платежи на бэкенде.

## UX

- Обрабатывать отмену окна оплаты отдельно от ошибки.
- После успеха — `getPurchases` + cloud save.
- Кнопка «отключить рекламу»: после владения скрыть/заменить; FS больше не звать.
