import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Activity, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import telegram from '../config/telegram';

const stagger = { animate:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { initial:{ opacity:0, y:16 }, animate:{ opacity:1, y:0 } };
const PERIODS = [{ v:7,l:'7D' },{ v:30,l:'30D' },{ v:90,l:'90D' },{ v:180,l:'6M' },{ v:365,l:'1Y' }];

export default function Performance() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [period, setPeriod]     = useState(30);
  const [subscription, setSub]  = useState(null);

  useEffect(() => { load(); }, [period]);

  const load = async () => {
    try {
      setLoading(true);
      const [s, sub] = await Promise.all([
        api.getPerformanceStats(period).catch(() => null),
        api.getUserSubscription().catch(() => null),
      ]);
      setStats(s); setSub(sub);
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <Loader size="lg" text="Loading analytics..." />
    </div>
  );

  if (!subscription) return (
    <div className="p-4 flex items-center justify-center min-h-[65vh]">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center max-w-xs">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' }}>
          <BarChart3 className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Subscription Required</h2>
        <p className="text-sm text-gray-500 mb-6">Subscribe to access detailed performance analytics</p>
        <motion.button whileTap={{ scale:0.97 }} onClick={() => navigate('/subscription')}
          className="w-full py-3.5 rounded-xl font-black text-sm text-white"
          style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
          View Plans
        </motion.button>
      </motion.div>
    </div>
  );

  const winRate    = stats?.winRate || 0;
  const expectancy = stats ? ((stats.avgWin*(winRate/100))-(stats.avgLoss*(1-winRate/100))).toFixed(2) : 0;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="p-4 pb-6 space-y-4">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Performance</h1>
          <p className="text-[10px] text-gray-600 mt-0.5">Last {period} days</p>
        </div>
        <motion.button whileTap={{ scale:0.9 }} onClick={load}
          className="p-2 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </motion.button>
      </motion.div>

      {/* Period selector */}
      <motion.div variants={fadeUp}
        className="flex gap-1.5 p-1 rounded-xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        {PERIODS.map(p => (
          <motion.button
            key={p.v} whileTap={{ scale:0.92 }}
            onClick={() => { telegram.haptic?.('light'); setPeriod(p.v); }}
            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
            style={{
              background: period===p.v ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: period===p.v ? '#60a5fa' : '#6b7280',
              border: period===p.v ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}
          >{p.l}</motion.button>
        ))}
      </motion.div>

      {/* Win Rate hero */}
      <motion.div variants={fadeUp}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{ background:'radial-gradient(circle at top right,rgba(16,185,129,0.08),transparent 70%)' }} />
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Win Rate</p>
        <div className="flex items-baseline gap-2 mb-4">
          <motion.span
            key={`wr-${period}`}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent font-mono"
          >{winRate}</motion.span>
          <span className="text-2xl text-emerald-400/60 font-black">%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
          <motion.div
            key={`bar-${period}`}
            initial={{ width:0 }} animate={{ width:`${winRate}%` }}
            transition={{ duration:1.4, ease:[0.22,1,0.36,1] }}
            className="h-full rounded-full"
            style={{ background:'linear-gradient(90deg,#10b981,#34d399)' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-600">
          <span className="text-green-400">{stats?.winningSignals||0} wins</span>
          <span className="text-red-400">{stats?.losingSignals||0} losses</span>
        </div>
      </motion.div>

      {/* Grid stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
        {[
          { icon:Activity,    label:'Total Signals',  value:stats?.totalSignals||0,     color:'#60a5fa', glow:'rgba(59,130,246,0.1)',  sub:`Last ${period} days` },
          { icon:Target,      label:'Profit Factor',  value:`${stats?.profitFactor||0}x`,color:'#22d3ee', glow:'rgba(6,182,212,0.1)',   sub:'Risk / reward' },
          { icon:TrendingUp,  label:'Avg Win',        value:`+${stats?.avgWin||0}%`,    color:'#34d399', glow:'rgba(16,185,129,0.1)',  sub:'Per winning trade' },
          { icon:TrendingDown,label:'Avg Loss',       value:`-${stats?.avgLoss||0}%`,   color:'#f87171', glow:'rgba(239,68,68,0.08)',  sub:'Per losing trade' },
        ].map(({ icon:Icon, label, value, color, glow, sub },i) => (
          <motion.div
            key={label} variants={fadeUp} transition={{ delay:i*0.07 }}
            whileHover={{ y:-2 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.07)', boxShadow:`0 0 20px ${glow}` }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{ background:`radial-gradient(circle at top right,${glow},transparent 70%)` }} />
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <motion.p
              key={`${label}-${period}`}
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              className="text-2xl font-black font-mono mb-0.5" style={{ color }}
            >{value}</motion.p>
            <p className="text-xs text-gray-600">{label}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Advanced metrics */}
      <motion.div variants={fadeUp}
        className="rounded-2xl p-4" style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Advanced Metrics</p>
        {[
          { label:'Expectancy',        value:`${expectancy}%`, color: parseFloat(expectancy)>=0?'#34d399':'#f87171' },
          { label:'Risk/Reward Ratio', value:`${stats?.profitFactor||0}:1`, color:'#fff' },
          { label:'Total Trades',      value:`${stats?.totalSignals||0}`,   color:'#fff' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-sm font-black font-mono" style={{ color }}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp}
        className="p-4 rounded-xl flex items-start gap-2.5"
        style={{ background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)' }}>
        <AlertTriangle className="w-4 h-4 text-amber-500/60 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-600 leading-relaxed">
          Past performance does not guarantee future results. Stats are based on closed signals within the selected period.
        </p>
      </motion.div>
    </motion.div>
  );
}
