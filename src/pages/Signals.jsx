import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Activity, SlidersHorizontal, X } from 'lucide-react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import SignalCard from '../components/signals/SignalCard';
import Modal from '../components/ui/Modal';
import SignalDetails from '../components/signals/SignalDetails';
import telegram from '../config/telegram';

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const Signals = () => {
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(); }, [signals, activeFilter, search]);

  const load = async () => {
    try {
      setLoading(true);
      const [s, sub] = await Promise.all([api.getActiveSignals().catch(() => []), api.getUserSubscription().catch(() => null)]);
      setSignals(s); setSubscription(sub);
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let f = [...signals];
    if (activeFilter === 'buy') f = f.filter(s => s.direction === 'BUY');
    else if (activeFilter === 'sell') f = f.filter(s => s.direction === 'SELL');
    else if (activeFilter === 'active') f = f.filter(s => ['published','active','tp1_hit','tp2_hit'].includes(s.status));
    if (search) f = f.filter(s => (s.symbol || s.pair || '').toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  };

  const filters = [
    { id: 'all', label: 'All', count: signals.length },
    { id: 'buy', label: 'Long', icon: TrendingUp, count: signals.filter(s => s.direction === 'BUY').length },
    { id: 'sell', label: 'Short', icon: TrendingDown, count: signals.filter(s => s.direction === 'SELL').length },
    { id: 'active', label: 'Active', count: signals.filter(s => ['published','active','tp1_hit','tp2_hit'].includes(s.status)).length },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader size="lg" text="Loading signals..." />
    </div>
  );

  if (!subscription) return (
    <div className="p-4 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Subscription Required</h2>
        <p className="text-sm text-gray-500 mb-6">Subscribe to access premium trading signals</p>
        <Button variant="primary" onClick={() => window.location.href = '/subscription'}>View Plans</Button>
      </div>
    </div>
  );

  return (
    <motion.div initial="initial" animate="animate" className="p-4 pb-6 space-y-4">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1">Live Feed</p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Signals</h1>
            <p className="text-xs text-gray-600 mt-0.5 font-mono">{filtered.length} available</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input type="text" placeholder="Search pair or market..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/40 transition-colors" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => {
          const Icon = f.icon;
          const active = activeFilter === f.id;
          return (
            <motion.button key={f.id} whileTap={{ scale: 0.94 }}
              onClick={() => { telegram.haptic('light'); setActiveFilter(f.id); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${active ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]' : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:border-white/[0.12]'}`}>
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? 'bg-blue-500/20 text-blue-300' : 'bg-white/[0.05] text-gray-600'}`}>{f.count}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((signal, i) => (
              <motion.div key={signal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }}>
                <SignalCard signal={signal} onClick={setSelected} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Activity className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No signals found</p>
            {search && <button onClick={() => setSearch('')} className="text-xs text-blue-400 mt-2 hover:underline">Clear search</button>}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Signal Details">
        {selected && <SignalDetails signal={selected} />}
      </Modal>
    </motion.div>
  );
};
export default Signals;
