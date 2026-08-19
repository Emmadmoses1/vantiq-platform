import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Activity, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import SignalCard from '../components/signals/SignalCard';
import Modal from '../components/ui/Modal';
import SignalDetails from '../components/signals/SignalDetails';
import telegram from '../config/telegram';

const fadeUp = { initial:{ opacity:0, y:16 }, animate:{ opacity:1, y:0 } };

export default function Signals() {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [signals, setSignals]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [subscription, setSub]    = useState(null);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(); }, [signals, filter, search]);

  const load = async () => {
    try {
      setLoading(true);
      const [s, sub] = await Promise.all([
        api.getActiveSignals().catch(() => []),
        api.getUserSubscription().catch(() => null),
      ]);
      setSignals(s); setSub(sub);
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let f = [...signals];
    if (filter==='buy')    f = f.filter(s => s.direction==='BUY');
    if (filter==='sell')   f = f.filter(s => s.direction==='SELL');
    if (filter==='active') f = f.filter(s => ['published','active','tp1_hit','tp2_hit'].includes(s.status));
    if (search) f = f.filter(s => (s.symbol||s.pair||'').toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  };

  const FILTERS = [
    { id:'all',    label:'All',    count: signals.length },
    { id:'buy',    label:'Long',   count: signals.filter(s=>s.direction==='BUY').length,  icon: TrendingUp,   color:'#34d399' },
    { id:'sell',   label:'Short',  count: signals.filter(s=>s.direction==='SELL').length, icon: TrendingDown, color:'#f87171' },
    { id:'active', label:'Active', count: signals.filter(s=>['published','active','tp1_hit','tp2_hit'].includes(s.status)).length, color:'#60a5fa' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <Loader size="lg" text="Loading signals..." />
    </div>
  );

  if (!subscription) return (
    <div className="p-4 flex items-center justify-center min-h-[65vh]">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center max-w-xs">
        <motion.div
          animate={{ scale:[1,1.08,1], opacity:[0.5,0.8,0.5] }}
          transition={{ duration:3, repeat:Infinity }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', boxShadow:'0 0 30px rgba(59,130,246,0.1)' }}
        >
          <Activity className="w-10 h-10 text-blue-400" />
        </motion.div>
        <h2 className="text-xl font-black text-white mb-2">Subscription Required</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Subscribe to access premium real-time trading signals</p>
        <motion.button whileTap={{ scale:0.97 }} onClick={() => navigate('/subscription')}
          className="w-full py-3.5 rounded-xl font-black text-sm text-white"
          style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
          <Zap className="w-4 h-4 inline mr-2" />View Plans
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial="initial" animate="animate" className="p-4 pb-6 space-y-4">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-black text-white">Signals</h1>
        <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{filtered.length} available</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          type="text" placeholder="Search pair or market..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
          style={{
            background:'rgba(255,255,255,0.03)',
            border:`1px solid ${search?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,
            boxShadow: search?'0 0 0 3px rgba(59,130,246,0.08)':'none',
          }}
        />
        <AnimatePresence>
          {search && (
            <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => {
          const Icon = f.icon;
          const active = filter === f.id;
          return (
            <motion.button
              key={f.id} whileTap={{ scale:0.93 }}
              onClick={() => { telegram.haptic?.('light'); setFilter(f.id); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: active ? '#60a5fa' : '#6b7280',
                boxShadow: active ? '0 0 12px rgba(59,130,246,0.12)' : 'none',
              }}
            >
              {Icon && <Icon className="w-3.5 h-3.5" style={{ color: active && f.color ? f.color : 'inherit' }} />}
              {f.label}
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black"
                style={{ background: active?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.05)', color: active?'#93c5fd':'#6b7280' }}>
                {f.count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Signal list */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((signal, i) => (
              <motion.div
                key={signal.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.97 }}
                transition={{ delay: i*0.04 }}
              >
                <SignalCard signal={signal} onClick={setSelected} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <Activity className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-sm font-semibold text-gray-600">No signals found</p>
            {search && (
              <motion.button whileTap={{ scale:0.95 }} onClick={() => setSearch('')}
                className="text-xs text-blue-400 mt-2 hover:text-blue-300 transition-colors">
                Clear search
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Signal Details">
        {selected && <SignalDetails signal={selected} />}
      </Modal>
    </motion.div>
  );
}
