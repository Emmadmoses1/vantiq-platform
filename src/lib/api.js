import { supabase, setUserContext } from '../config/supabase';
import telegram from '../config/telegram';

class API {
  constructor() {
    this.user = null;
  }

  async initialize() {
    try {
      const telegramUser = telegram.getUser();
      if (!telegramUser) {
        throw new Error('No Telegram user found');
      }

      // Set RLS context
      await setUserContext(telegramUser.id);

      // Get or create user
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (existingUser) {
        this.user = existingUser;
        // Update last login
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', existingUser.id);
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
          })
          .select()
          .single();

        if (error) throw error;
        this.user = newUser;
      }

      return { success: true, user: this.user, isNewUser: !existingUser };
    } catch (error) {
      console.error('API initialization error:', error);
      throw error;
    }
  }

  // User Methods
  async getProfile() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', this.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Signals Methods
  async getActiveSignals() {
    const { data: subscription } = await this.getUserSubscription();
    
    if (!subscription) {
      return [];
    }

    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .in('status', ['published', 'active', 'tp1_hit', 'tp2_hit'])
      .contains('visibility', [subscription.plan_id])
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async getSignalHistory(filters = {}) {
    let query = supabase
      .from('signals')
      .select('*')
      .order('published_at', { ascending: false });

    if (filters.market) {
      query = query.eq('market', filters.market);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.limit(filters.limit || 50);

    if (error) throw error;
    return data || [];
  }

  async getPerformanceStats(period = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const { data, error } = await supabase
      .from('signal_results')
      .select('*')
      .gte('closed_at', startDate.toISOString());

    if (error) throw error;

    const results = data || [];
    const totalSignals = results.length;
    const winningSignals = results.filter(r => r.result === 'win').length;
    const losingSignals = results.filter(r => r.result === 'loss').length;
    const winRate = totalSignals > 0 ? (winningSignals / totalSignals) * 100 : 0;

    const avgWin = winningSignals > 0
      ? results.filter(r => r.result === 'win')
          .reduce((sum, r) => sum + parseFloat(r.profit_loss), 0) / winningSignals
      : 0;

    const avgLoss = losingSignals > 0
      ? results.filter(r => r.result === 'loss')
          .reduce((sum, r) => sum + Math.abs(parseFloat(r.profit_loss)), 0) / losingSignals
      : 0;

    return {
      totalSignals,
      winningSignals,
      losingSignals,
      winRate: parseFloat(winRate.toFixed(2)),
      avgWin: parseFloat(avgWin.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      profitFactor: avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(2)) : 0,
    };
  }

  // Subscription Methods
  async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('base_price');

    if (error) throw error;
    return data || [];
  }

  async getUserSubscription() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Payment Methods
  async createPaymentOrder(planId, billingPeriod, cryptoSymbol, network, promoCode = null) {
    const { data, error } = await supabase.rpc('create_payment_order', {
      p_user_id: this.user.id,
      p_plan_id: planId,
      p_billing_period: billingPeriod,
      p_crypto_symbol: cryptoSymbol,
      p_network: network,
      p_promo_code: promoCode,
    });

    if (error) throw error;
    return data;
  }

  async submitTransaction(orderId, txHash) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        tx_hash: txHash,
        status: 'detected',
        submitted_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('user_id', this.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentHistory() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Notifications
  async getNotifications(limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async markNotificationRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', this.user.id);

    if (error) throw error;
  }
}

export default new API();