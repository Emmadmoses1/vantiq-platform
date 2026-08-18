import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import telegram from '../../config/telegram';

const statusMap = {
  published: { label: 'NEW', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  active: { label: 'ACTIVE', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  tp1_hit: { label: 'TP1 ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  tp2_hit: { label: 'TP2 ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  tp3_hit: { label: 'TP3 ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  stop_loss_hit: { label: 'SL HIT', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  closed: { label: 'CLOSED', color: 'text-gray-500', bg: 'bg-white/[0.03]', border: 'border-white/[0.06]' },
};

const SignalCard = ({ signal, onClick }) => {
  const isBuy = signal.direction === 'BUY';
  const status = statusMap[signal.status] || statusMap.active;
  const timeAgo = signal.published_at ? formatDistanceToNow(new Date(signal.published_at), { addSuffix: true }) : '';

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
      onClick={() => { telegram.haptic('light'); onClick(signal); }}
      className="rounded-2xl border border-white/[0.06] cursor-pointer overflow-hidden group transition-all hover:border-white/[0.12]"
      style={{ background: '#0a0e1a', boxShadow: isBuy ? '0 0 20px rgba(16,185,129,0.05)' : '0 0 20px rgba(239,68,68,0.05)' }}>
      {/* Direction stripe */}
      <div className={`h-px w-full ${isBuy ? 'bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500/60 to-transparent'}`} />
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white font-mono">{signal.symbol || signal.pair || 'N/A'}</span>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest border border-white/[0.06] px-1.5 py-0.5 rounded">{signal.market || 'CRYPTO'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{signal.timeframe}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${isBuy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'bg-red-500/10 text-red-400 border-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.15)]'}`}>
            {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {signal.direction}
          </div>
        </div>

        {/* Entry / SL */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl p-3 border border-blue-500/15 bg-blue-500/[0.05]">
            <div className="flex items-center gap-1 mb-1"><Target className="w-3 h-3 text-blue-400" /><span className="text-[10px] text-gray-600 uppercase tracking-wider">Entry</span></div>
            <p className="text-sm font-bold text-white font-mono">{signal.entry}</p>
          </div>
          <div className="rounded-xl p-3 border border-red-500/15 bg-red-500/[0.05]">
            <div className="flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3 text-red-400" /><span className="text-[10px] text-gray-600 uppercase tracking-wider">Stop Loss</span></div>
            <p className="text-sm font-bold text-red-400 font-mono">{signal.stop_loss}</p>
          </div>
        </div>

        {/* TP levels */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {[{ l: 'TP1', v: signal.take_profit_1, hit: signal.tp1_hit_at }, { l: 'TP2', v: signal.take_profit_2, hit: signal.tp2_hit_at }, { l: 'TP3', v: signal.take_profit_3, hit: signal.tp3_hit_at }].map((tp, i) => (
            <div key={i} className={`rounded-lg p-2 text-center border ${tp.hit ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-white/[0.02] border-white/[0.05]'}`}>
              <p className="text-[10px] text-gray-600 mb-0.5">{tp.l}</p>
              <p className={`text-xs font-bold font-mono ${tp.hit ? 'text-emerald-400' : 'text-gray-300'}`}>{tp.v || '—'}</p>
            </div>
          ))}
        </div>

        {/* Signal strength */}
        {signal.signal_strength && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Signal Strength</span>
              <span className="text-[10px] font-bold text-blue-400 font-mono">{Math.round(signal.signal_strength * 100)}%</span>
            </div>
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${signal.signal_strength * 100}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${signal.risk_level === 'low' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : signal.risk_level === 'high' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
            {(signal.risk_level || 'medium').toUpperCase()} RISK
          </div>
          <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${status.color} ${status.bg} ${status.border}`}>
            {status.label}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default SignalCard;
