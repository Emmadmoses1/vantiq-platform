const telegram = {
  haptic: (style = 'light') => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    } catch (e) {
      // Not in Telegram WebApp context — silently ignore
    }
  },
};

export default telegram;
