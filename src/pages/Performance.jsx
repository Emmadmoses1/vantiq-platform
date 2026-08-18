import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import telegram from '../config/telegram';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const PERIODS = [{ v: 7, l: '7D' }, { v: 30, l: '30D' }, { v: 90, l: '90D' }, { v: 180, l: '6M' }, { v: 365, l: '1Y' }];

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState(30);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => { load(); }, [period]);

  const load = async () => {
    try {
      setLoading(true);
      const [s, sub] = await Promise.all([api.getPerformanceStats(period).catch(() => null), api.getUserSubscription().catch(() => null)]);
      setStats(s); setSubscription(sub);
    } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader size="lg" text="Loading stats..." /></div>;

  if (!subscription) return (
    <div className="p-4 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Subscription Required</h2>
        <p className="text-sm text-gray-500 mb-6">Subscribe to view performance analytics</p>
        <Button variant="primary" onClick={() => window.location.href = '/subscription'}>View Plans</Button>
      </div>
    </div>
  );

  const winRate = stats?.winRate || 0;
  const expectancy = stats ? ((stats.avgWin * (winRate / 100)) - (stats.avgLoss * (1 - winRate / 100))).toFixed(2) : 0;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="p-4 pb-6 space-y-4">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1">Analytics</p>
        <h1 className="text-2xl font-bold text-white">Performance</h1>
      </motion.div>

      {/* Period selector */}
      <motion.div variants={fadeUp} className="flex gap-2">
        {PERIODS.map(p => (
          <motion.button key={p.v} whileTap={{ scale: 0.92 }}
            onClick={() => { telegram.haptic('light'); setPeriod(p.v); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex-1 ${period === p.v ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-white/[0.03] text-gray-600 border-white/[0.06]'}`}>
            {p.l}
          </motion.button>
        ))}
      </motion.div>

      {/* Main stat — Win Rate hero */}
      <motion.div variants={fadeUp} className="rounded-2xl p-5 border border-white/[0.06] bg-[#0a0e1a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Win Rate</p>
        <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 font-mono mb-3">{winRate}<span className="text-2xl">%</span></p>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${winRate}%` }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-mono">
          <span>{stats?.winningSignals || 0} wins</span>
          <span>{stats?.losingSignals || 0} losses</span>
        </div>
      </motion.div>

      {/* Grid stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
        {[
          { icon: Activity, label: 'Total Signals', value: stats?.totalSignals || 0, color: 'text-blue-400', glow: 'rgba(59,130,246,0.1)', sub: `Last ${period} days` },
          { icon: Target, label: 'Profit Factor', value: `${stats?.profitFactor || 0}x`, color: 'text-cyan-400', glow: 'rgba(6,182,212,0.1)', sub: 'Risk / reward' },
          { icon: TrendingUp, label: 'Avg Win', value: `+${stats?.avgWin || 0}%`, color: 'text-emerald-400', glow: 'rgba(16,185,129,0.1)', sub: 'Per winning trade' },
          { icon: TrendingDown, label: 'Avg Loss', value: `-${stats?.avgLoss || 0}%`, color: 'text-red-400', glow: 'rgba(239,68,68,0.08)', sub: 'Per losing trade' },
        ].map(({ icon: Icon, label, value, color, glow, sub }) => (
          <motion.div key={label} variants={fadeUp} className="rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a]" style={{ boxShadow: `0 0 20px ${glow}` }}>
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Expectancy */}
      <motion.div variants={fadeUp} className="rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a]">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Advanced Metrics</h3>
        {[
          { label: 'Expectancy', value: `${expectancy}%`, color: parseFloat(expectancy) >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Risk/Reward Ratio', value: `${stats?.profitFactor || 0}:1`, color: 'text-white' },
          { label: 'Total Trades', value: `${stats?.totalSignals || 0}`, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500/70 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">Past performance does not guarantee future results. Statistics are based on closed signals within the selected period.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default Performance;
