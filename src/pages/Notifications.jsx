import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, TrendingUp, Check } from 'lucide-react';
import api from '../lib/api';
import Loader from '../components/ui/Loader';

const iconMap = { new_signal: TrendingUp, tp_hit: CheckCircle, sl_hit: AlertTriangle, payment_confirmed: CheckCircle, announcement: Info };
const colorMap = { new_signal: 'text-blue-400 bg-blue-500/10 border-blue-500/20', tp_hit: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', sl_hit: 'text-red-400 bg-red-500/10 border-red-500/20', payment_confirmed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', announcement: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [read, setRead] = useState(new Set());

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setNotifications(await api.getNotifications().catch(() => [])); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    setRead(r => new Set([...r, id]));
    await api.markNotificationRead(id).catch(() => {});
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader size="lg" text="Loading..." /></div>;

  return (
    <div className="p-4 pb-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1">Inbox</p>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-xs text-gray-600 mt-0.5 font-mono">{notifications.length} total</p>
        </div>
      </div>

      <AnimatePresence>
        {notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-gray-700" />
            </div>
            <p className="text-sm text-gray-600">All caught up</p>
            <p className="text-xs text-gray-700 mt-1">No new notifications</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const Icon = iconMap[n.type] || Bell;
              const c = colorMap[n.type] || 'text-gray-400 bg-white/[0.03] border-white/[0.06]';
              const isRead = read.has(n.id) || n.read;
              return (
                <motion.div key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${isRead ? 'bg-white/[0.01] border-white/[0.04] opacity-60' : 'bg-[#0a0e1a] border-white/[0.06] hover:border-white/[0.1]'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${c}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
                      {!isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-700 mt-2 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Notifications;
