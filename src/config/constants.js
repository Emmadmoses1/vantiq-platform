module.exports = {
  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    STARTER: {
      id: 'starter',
      name: 'Starter',
      basePrice: 50,
      features: [
        'Up to 10 signals per month',
        'Basic market analysis',
        'Email support',
        'Crypto, Forex access',
      ],
      signalLimit: 10,
      markets: ['crypto', 'forex'],
      popular: false,
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      basePrice: 100,
      features: [
        'Up to 30 signals per month',
        'Advanced technical analysis',
        'Priority support',
        'All markets access',
        'Real-time notifications',
      ],
      signalLimit: 30,
      markets: ['crypto', 'forex', 'gold', 'indices'],
      popular: true,
    },
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      basePrice: 200,
      features: [
        'Unlimited signals',
        'Premium market insights',
        'Dedicated support',
        'All markets + commodities',
        'Custom watchlists',
        'Early signal access',
      ],
      signalLimit: -1, // unlimited
      markets: ['crypto', 'forex', 'gold', 'indices', 'commodities'],
      popular: false,
    },
    ELITE: {
      id: 'elite',
      name: 'Elite',
      basePrice: 500,
      features: [
        'Unlimited premium signals',
        'Institutional-grade analysis',
        '24/7 priority support',
        'All markets access',
        'Personal account manager',
        'Exclusive market reports',
        'API access',
      ],
      signalLimit: -1,
      markets: ['crypto', 'forex', 'gold', 'indices', 'commodities', 'stocks'],
      popular: false,
    },
    VIP: {
      id: 'vip',
      name: 'VIP',
      basePrice: 1000,
      features: [
        'Unlimited VIP signals',
        'Proprietary analysis models',
        'Dedicated 24/7 concierge',
        'All markets + pre-IPO',
        'Custom signal requests',
        'Private strategy sessions',
        'Full API access',
        'White-label options',
      ],
      signalLimit: -1,
      markets: ['all'],
      popular: false,
    },
  },

  // Billing Periods with Discounts
  BILLING_PERIODS: {
    MONTHLY: { id: 'monthly', name: 'Monthly', months: 1, discount: 0 },
    QUARTERLY: { id: 'quarterly', name: '3 Months', months: 3, discount: 0.1 }, // 10% off
    SEMIANNUAL: { id: 'semiannual', name: '6 Months', months: 6, discount: 0.15 }, // 15% off
    YEARLY: { id: 'yearly', name: 'Yearly', months: 12, discount: 0.25 }, // 25% off
  },

  // Signal Statuses
  SIGNAL_STATUS: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    PUBLISHED: 'published',
    ACTIVE: 'active',
    TP1_HIT: 'tp1_hit',
    TP2_HIT: 'tp2_hit',
    TP3_HIT: 'tp3_hit',
    STOP_LOSS_HIT: 'stop_loss_hit',
    CANCELLED: 'cancelled',
    CLOSED: 'closed',
  },

  // Payment Statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    DETECTED: 'detected',
    CONFIRMING: 'confirming',
    CONFIRMED: 'confirmed',
    EXPIRED: 'expired',
    FAILED: 'failed',
    REJECTED: 'rejected',
    REFUNDED: 'refunded',
  },

  // Supported Cryptocurrencies
  SUPPORTED_CRYPTO: {
    USDT_TRC20: {
      symbol: 'USDT',
      name: 'Tether',
      network: 'TRC20',
      networkName: 'Tron',
      decimals: 6,
      confirmations: 19,
      addressEnv: 'PAYMENT_USDT_TRC20_ADDRESS',
    },
    USDT_ERC20: {
      symbol: 'USDT',
      name: 'Tether',
      network: 'ERC20',
      networkName: 'Ethereum',
      decimals: 6,
      confirmations: 12,
      addressEnv: 'PAYMENT_USDT_ERC20_ADDRESS',
    },
    USDT_BEP20: {
      symbol: 'USDT',
      name: 'Tether',
      network: 'BEP20',
      networkName: 'BSC',
      decimals: 18,
      confirmations: 15,
      addressEnv: 'PAYMENT_USDT_BEP20_ADDRESS',
    },
    BTC: {
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'BTC',
      networkName: 'Bitcoin',
      decimals: 8,
      confirmations: 1,
      addressEnv: 'PAYMENT_BTC_ADDRESS',
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'ERC20',
      networkName: 'Ethereum',
      decimals: 18,
      confirmations: 12,
      addressEnv: 'PAYMENT_ETH_ADDRESS',
    },
    LTC: {
      symbol: 'LTC',
      name: 'Litecoin',
      network: 'LTC',
      networkName: 'Litecoin',
      decimals: 8,
      confirmations: 6,
      addressEnv: 'PAYMENT_LTC_ADDRESS',
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      network: 'BEP20',
      networkName: 'BSC',
      decimals: 18,
      confirmations: 15,
      addressEnv: 'PAYMENT_BNB_ADDRESS',
    },
    TON: {
      symbol: 'TON',
      name: 'Toncoin',
      network: 'TON',
      networkName: 'TON',
      decimals: 9,
      confirmations: 1,
      addressEnv: 'PAYMENT_TON_ADDRESS',
    },
  },

  // Markets
  MARKETS: {
    CRYPTO: { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
    FOREX: { id: 'forex', name: 'Forex', icon: '$' },
    GOLD: { id: 'gold', name: 'Gold & Precious Metals', icon: '🥇' },
    INDICES: { id: 'indices', name: 'Indices', icon: '📊' },
    COMMODITIES: { id: 'commodities', name: 'Commodities', icon: '🛢️' },
    STOCKS: { id: 'stocks', name: 'Stocks', icon: '📈' },
  },

  // Trading Pairs by Market
  TRADING_PAIRS: {
    crypto: [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
      'SOL/USDT', 'DOGE/USDT', 'MATIC/USDT', 'DOT/USDT', 'AVAX/USDT',
    ],
    forex: [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
      'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'USD/CHF',
    ],
    gold: [
      'XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD',
    ],
    indices: [
      'US30', 'US100', 'US500', 'UK100', 'GER40',
      'FRA40', 'JPN225', 'AUS200',
    ],
  },

  // Risk Levels
  RISK_LEVELS: {
    LOW: { id: 'low', name: 'Low', color: '#10b981' },
    MEDIUM: { id: 'medium', name: 'Medium', color: '#f59e0b' },
    HIGH: { id: 'high', name: 'High', color: '#ef4444' },
  },

  // Timeframes
  TIMEFRAMES: ['5M', '15M', '30M', '1H', '4H', '1D', '1W'],

  // Admin Roles
  ADMIN_ROLES: {
    SUPER_ADMIN: {
      id: 'super_admin',
      name: 'Super Administrator',
      permissions: ['all'],
    },
    SIGNAL_MANAGER: {
      id: 'signal_manager',
      name: 'Signal Manager',
      permissions: ['signals', 'markets', 'performance'],
    },
    FINANCE_ADMIN: {
      id: 'finance_admin',
      name: 'Finance Administrator',
      permissions: ['payments', 'subscriptions', 'promo_codes'],
    },
    SUPPORT_ADMIN: {
      id: 'support_admin',
      name: 'Support Administrator',
      permissions: ['users', 'support_tickets', 'notifications'],
    },
    CONTENT_ADMIN: {
      id: 'content_admin',
      name: 'Content Administrator',
      permissions: ['announcements', 'notifications'],
    },
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    NEW_SIGNAL: 'new_signal',
    SIGNAL_UPDATE: 'signal_update',
    TP_HIT: 'tp_hit',
    SL_HIT: 'sl_hit',
    SIGNAL_CANCELLED: 'signal_cancelled',
    SUBSCRIPTION_EXPIRING: 'subscription_expiring',
    SUBSCRIPTION_EXPIRED: 'subscription_expired',
    PAYMENT_CONFIRMED: 'payment_confirmed',
    PAYMENT_PENDING: 'payment_pending',
    ANNOUNCEMENT: 'announcement',
    MARKET_ALERT: 'market_alert',
  },
};