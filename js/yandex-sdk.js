let ysdk = null;
let player = null;
let payments = null;

function installMock() {
  if (window.YaGames) return;
  window.YaGames = {
    init: async () => ({
      environment: {
        // Local draft default: Russian (Yandex SDK overrides in production)
        i18n: { lang: 'ru' },
      },
      features: {
        LoadingAPI: { ready() {} },
        GameplayAPI: { start() {}, stop() {} },
      },
      adv: {
        showFullscreenAdv({ callbacks } = {}) {
          callbacks?.onClose?.(true);
        },
        showRewardedVideo({ callbacks } = {}) {
          callbacks?.onRewarded?.();
          callbacks?.onClose?.(true);
        },
      },
      getPlayer: async () => ({
        getData: async () => ({}),
        setData: async () => {},
      }),
      getPayments: async () => ({
        getCatalog: async () => [
          {
            id: 'quiet_cove_rod_skin',
            title: 'Rod skin',
            description: 'Cosmetic rod skin',
            price: '49 ₽',
            priceValue: '49',
            priceCurrencyCode: 'RUB',
          },
        ],
        getPurchases: async () => [],
        purchase: async () => ({ productID: 'quiet_cove_rod_skin', purchaseToken: 'mock' }),
        consumePurchase: async () => {},
      }),
      on: () => {},
    }),
  };
}

export async function initYandexSdk() {
  if (!window.YaGames) {
    installMock();
  }
  try {
    ysdk = await window.YaGames.init();
  } catch {
    installMock();
    ysdk = await window.YaGames.init();
  }

  try {
    player = await ysdk.getPlayer();
  } catch {
    player = null;
  }

  try {
    payments = await ysdk.getPayments({ signed: false });
  } catch {
    try {
      payments = await ysdk.getPayments?.();
    } catch {
      payments = null;
    }
  }

  return ysdk;
}

export function getYsdk() {
  return ysdk;
}

export function getPlayer() {
  return player;
}

export function getPayments() {
  return payments;
}

export function loadingReady() {
  ysdk?.features?.LoadingAPI?.ready?.();
}

export function gameplayStart() {
  ysdk?.features?.GameplayAPI?.start?.();
}

export function gameplayStop() {
  ysdk?.features?.GameplayAPI?.stop?.();
}

export function showFullscreenAdv() {
  return new Promise((resolve) => {
    if (!ysdk?.adv?.showFullscreenAdv) {
      resolve(false);
      return;
    }
    gameplayStop();
    ysdk.adv.showFullscreenAdv({
      callbacks: {
        onClose: () => resolve(true),
        onError: () => resolve(false),
      },
    });
  });
}

export function showRewardedVideo() {
  return new Promise((resolve) => {
    if (!ysdk?.adv?.showRewardedVideo) {
      resolve(false);
      return;
    }
    let rewarded = false;
    gameplayStop();
    ysdk.adv.showRewardedVideo({
      callbacks: {
        onRewarded: () => {
          rewarded = true;
        },
        onClose: () => resolve(rewarded),
        onError: () => resolve(false),
      },
    });
  });
}
