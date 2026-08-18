const { db } = require('./firebase');

// Collection References
const collections = {
  users: db.collection('users'),
  subscriptions: db.collection('subscriptions'),
  subscriptionPlans: db.collection('subscription_plans'),
  signals: db.collection('signals'),
  signalVersions: db.collection('signal_versions'),
  signalResults: db.collection('signal_results'),
  marketData: db.collection('market_data'),
  watchlists: db.collection('watchlists'),
  payments: db.collection('payments'),
  cryptoQuotes: db.collection('crypto_quotes'),
  supportedAssets: db.collection('supported_assets'),
  announcements: db.collection('announcements'),
  notifications: db.collection('notifications'),
  promoCodes: db.collection('promo_codes'),
  supportTickets: db.collection('support_tickets'),
  adminUsers: db.collection('admin_users'),
  adminRoles: db.collection('admin_roles'),
  auditLogs: db.collection('audit_logs'),
  platformSettings: db.collection('platform_settings'),
};

module.exports = collections;