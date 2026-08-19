const tg = () => window.Telegram?.WebApp;

const telegram = {
  init: () => {
    try {
      tg()?.ready();
      tg()?.expand();
    } catch (e) {}
  },

  getUser: () => {
    try {
      return tg()?.initDataUnsafe?.user || null;
    } catch (e) {
      return null;
    }
  },

  haptic: (style = 'light') => {
    try {
      tg()?.HapticFeedback?.impactOccurred(style);
    } catch (e) {}
  },

  showAlert: (message) => {
    try {
      if (tg()?.showAlert) { tg().showAlert(message); return; }
    } catch (e) {}
    alert(message);
  },

  showConfirm: (message) => {
    return new Promise((resolve) => {
      try {
        if (tg()?.showConfirm) { tg().showConfirm(message, (ok) => resolve(ok)); return; }
      } catch (e) {}
      resolve(window.confirm(message));
    });
  },

  close: () => {
    try { tg()?.close(); } catch (e) {}
  },

  openLink: (url) => {
    try {
      if (tg()?.openLink) { tg().openLink(url); return; }
    } catch (e) {}
    window.open(url, '_blank');
  },
};

export default telegram;
