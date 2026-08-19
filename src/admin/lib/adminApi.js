import { supabase } from '../../config/supabase';

class AdminAPI {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { token: data.session.access_token, user: data.user };
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async getDashboardStats() {
    const [{ count: userCount }, { count: signalCount }, { count: paymentCount }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('signals').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
    ]);
    return { userCount: userCount || 0, signalCount: signalCount || 0, paymentCount: paymentCount || 0 };
  }

  async getUsers(params = {}) {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getUserDetails(userId) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  }

  async getAllSignals(params = {}) {
    const { data, error } = await supabase.from('signals').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getPayments(params = {}) {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getAuditLogs(params = {}) {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data || [];
  }
}

export default new AdminAPI();
