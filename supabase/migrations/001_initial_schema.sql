-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    current_plan TEXT,
    subscription_status TEXT DEFAULT 'none',
    subscription_end_date TIMESTAMPTZ,
    preferred_markets TEXT[] DEFAULT '{}',
    preferred_pairs TEXT[] DEFAULT '{}',
    risk_preference TEXT DEFAULT 'medium',
    notification_preferences JSONB DEFAULT '{"signals": true, "tpHit": true, "slHit": true, "announcements": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Subscription Plans Table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    features JSONB NOT NULL,
    signal_limit INTEGER,
    markets TEXT[] NOT NULL,
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    billing_period TEXT NOT NULL,
    months INTEGER NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    payment_order_id UUID,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signals Table
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    market TEXT NOT NULL,
    direction TEXT NOT NULL,
    entry DECIMAL(20,8) NOT NULL,
    stop_loss DECIMAL(20,8) NOT NULL,
    take_profit_1 DECIMAL(20,8) NOT NULL,
    take_profit_2 DECIMAL(20,8) NOT NULL,
    take_profit_3 DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    timeframe TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    signal_strength DECIMAL(3,2),
    status TEXT NOT NULL,
    analysis JSONB,
    market_data_snapshot JSONB,
    visibility TEXT[] NOT NULL,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    tp1_hit_at TIMESTAMPTZ,
    tp2_hit_at TIMESTAMPTZ,
    tp3_hit_at TIMESTAMPTZ,
    sl_hit_at TIMESTAMPTZ
);

-- Signal Results Table (for performance tracking)
CREATE TABLE signal_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    market TEXT NOT NULL,
    direction TEXT NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    exit_price DECIMAL(20,8) NOT NULL,
    profit_loss DECIMAL(10,2) NOT NULL,
    result TEXT NOT NULL,
    final_status TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    billing_period TEXT NOT NULL,
    usd_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    promo_code TEXT,
    crypto_symbol TEXT NOT NULL,
    network TEXT NOT NULL,
    crypto_amount DECIMAL(20,8) NOT NULL,
    exchange_rate DECIMAL(20,8) NOT NULL,
    payment_address TEXT NOT NULL,
    status TEXT NOT NULL,
    tx_hash TEXT,
    confirmations INTEGER DEFAULT 0,
    verification_result JSONB,
    quote_expires_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes Table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    applicable_plans TEXT[],
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    performed_by TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    changes JSONB,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Data Table
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL,
    market TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_market ON signals(market);
CREATE INDEX idx_signals_published_at ON signals(published_at DESC);
CREATE INDEX idx_signal_results_symbol ON signal_results(symbol);
CREATE INDEX idx_signal_results_market ON signal_results(market);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (telegram_id = current_setting('app.telegram_id')::BIGINT);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (telegram_id = current_setting('app.telegram_id')::BIGINT);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
    ));

CREATE POLICY "Users can view signals based on subscription" ON signals
    FOR SELECT USING (
        status IN ('published', 'active', 'tp1_hit', 'tp2_hit', 'tp3_hit', 'closed')
    );

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
    ));

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
    ));

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Subscription Plans
INSERT INTO subscription_plans (plan_id, name, base_price, features, signal_limit, markets, popular) VALUES
('starter', 'Starter', 50.00, 
 '["Up to 10 signals per month", "Basic market analysis", "Email support", "Crypto, Forex access"]'::jsonb,
 10, ARRAY['crypto', 'forex'], false),

('pro', 'Pro', 100.00,
 '["Up to 30 signals per month", "Advanced technical analysis", "Priority support", "All markets access", "Real-time notifications"]'::jsonb,
 30, ARRAY['crypto', 'forex', 'gold', 'indices'], true),

('premium', 'Premium', 200.00,
 '["Unlimited signals", "Premium market insights", "Dedicated support", "All markets + commodities", "Custom watchlists", "Early signal access"]'::jsonb,
 -1, ARRAY['crypto', 'forex', 'gold', 'indices', 'commodities'], false),

('elite', 'Elite', 500.00,
 '["Unlimited premium signals", "Institutional-grade analysis", "24/7 priority support", "All markets access", "Personal account manager", "Exclusive market reports", "API access"]'::jsonb,
 -1, ARRAY['crypto', 'forex', 'gold', 'indices', 'commodities', 'stocks'], false),

('vip', 'VIP', 1000.00,
 '["Unlimited VIP signals", "Proprietary analysis models", "Dedicated 24/7 concierge", "All markets + pre-IPO", "Custom signal requests", "Private strategy sessions", "Full API access", "White-label options"]'::jsonb,
 -1, ARRAY['all'], false);