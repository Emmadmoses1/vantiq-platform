import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, TrendingUp, Check, Trash2 } from 'lucide-react';
import api from '../lib/api';
import Loader from '../components/ui/Loader';

const TYPE_CFG = {
  new_signal:        { icon:TrendingUp,   color:'#60a5fa', bg:'rgba(59,130,246,0.1)',  label:'Signal'    },
  tp_hit:            { icon:CheckCircle,  color:'#34d399', bg:'rgba(16,185,129,0.1)',  label:'TP Hit'    },
  sl_hit:            { icon:AlertTriangle,color:'#f87171', bg:'rgba(239,68,68,0.1)',   label:'SL Hit'    },
  payment_confirmed: { icon:CheckCircle,  color:'#34d399', bg:'rgba(16,185,129,0.1)',  label:'Payment'   },
  announcement:      { icon:Info,         color:'#22d3ee', bg:'rgba(6,182,212,0.1)',   label:'News'      },
};

export default function Notifications() {
  const [loading, setLoading]  = useState(true);
  const [items, setItems]      = useState([]);
  const [read, setRead]        = useState(new Set());

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setItems(await api.getNotifications().catch(() => [])); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    setRead(r => new Set([...r, id]));
    await api.markNotificationRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setRead(new Set(items.map(n => n.id)));
    items.forEach(n => api.markNotificationRead(n.id).catch(() => {}));
  };

  const unread = items.filter(n => !read.has(n.id) && !n.read).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <Loader size="lg" text="Loading..." />
    </div>
  );

  return (
    <div className="p-4 pb-6 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{items.length} total · {unread} unread</p>
        </div>
        {unread > 0 && (
          <motion.button
            whileTap={{ scale:0.95 }}
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60a5fa' }}
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-20">
            <motion.div
              animate={{ scale:[1,1.08,1], opacity:[0.5,0.8,0.5] }}
              transition={{ duration:3, repeat:Infinity }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
            >
              <Bell className="w-9 h-9 text-gray-700" />
            </motion.div>
            <p className="text-sm font-bold text-gray-600">All caught up</p>
            <p className="text-[10px] text-gray-700 mt-1">No new notifications</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {items.map((n, i) => {
              const cfg    = TYPE_CFG[n.type] || TYPE_CFG.announcement;
              const Icon   = cfg.icon;
              const isRead = read.has(n.id) || n.read;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:16, height:0 }}
                  transition={{ delay:i*0.04 }}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all relative overflow-hidden"
                  style={{
                    background: isRead ? 'rgba(255,255,255,0.01)' : '#0a0e1a',
                    border: `1px solid ${isRead ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
                    opacity: isRead ? 0.55 : 1,
                  }}
                >
                  {!isRead && (
                    <motion.div
                      animate={{ opacity:[0.3,0.6,0.3] }} transition={{ duration:2, repeat:Infinity }}
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
                      style={{ background:cfg.color }}
                    />
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:cfg.bg }}>
                    <Icon className="w-4 h-4" style={{ color:cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color:cfg.color }}>
                          {cfg.label}
                        </span>
                        <p className="text-sm font-bold text-white leading-tight mt-0.5">{n.title}</p>
                      </div>
                      {!isRead && (
                        <motion.div
                          animate={{ scale:[1,1.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ background:'#3b82f6', boxShadow:'0 0 6px rgba(59,130,246,0.8)' }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-700 mt-2 font-mono">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
