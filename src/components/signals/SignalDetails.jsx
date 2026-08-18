import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const SignalDetails = ({ signal }) => {
  const isBuy = signal.direction === 'BUY';
  const Row = ({ label, value, icon: Icon, color = 'text-white' }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <div className="flex items-center gap-2 text-gray-500 text-sm">{Icon && <Icon className="w-3.5 h-3.5" />}{label}</div>
      <span className={`text-sm font-semibold font-mono ${color}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-4 border border-white/[0.06] bg-gradient-to-br from-blue-500/[0.07] to-cyan-500/[0.04]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-white font-mono">{signal.symbol || signal.pair}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] border border-white/[0.08] text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">{signal.market}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${isBuy ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{signal.direction}
              </span>
            </div>
          </div>
          {signal.signal_strength && (
            <div className="text-right">
              <p className="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">Confidence</p>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">{Math.round(signal.signal_strength * 100)}%</p>
            </div>
          )}
        </div>
        {signal.signal_strength && (
          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${signal.signal_strength * 100}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        )}
      </div>

      {/* Levels */}
      <div className="rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a]">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" />Trading Levels</h3>
        <div className="space-y-2 mb-3">
          <div className="p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Entry</p>
            <p className="text-xl font-bold text-white font-mono">{signal.entry}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" />Stop Loss</p>
            <p className="text-xl font-bold text-red-400 font-mono">{signal.stop_loss}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ l: 'TP1', v: signal.take_profit_1, hit: signal.tp1_hit_at }, { l: 'TP2', v: signal.take_profit_2, hit: signal.tp2_hit_at }, { l: 'TP3', v: signal.take_profit_3, hit: signal.tp3_hit_at }].map((tp, i) => (
              <div key={i} className={`p-3 rounded-xl text-center border ${tp.hit ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-[10px] text-gray-600">{tp.l}</p>
                  {tp.hit && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className={`text-sm font-bold font-mono ${tp.hit ? 'text-emerald-400' : 'text-white'}`}>{tp.v || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a]">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" />Signal Info</h3>
        <Row label="Timeframe" value={signal.timeframe} icon={Clock} />
        <Row label="Risk Level" value={(signal.risk_level || '').toUpperCase()} icon={AlertTriangle}
          color={signal.risk_level === 'low' ? 'text-emerald-400' : signal.risk_level === 'high' ? 'text-red-400' : 'text-amber-400'} />
        <Row label="Status" value={(signal.status || '').replace('_', ' ').toUpperCase()}
          color={signal.status?.includes('tp') ? 'text-emerald-400' : signal.status === 'stop_loss_hit' ? 'text-red-400' : 'text-blue-400'} />
        {signal.published_at && <Row label="Published" value={format(new Date(signal.published_at), 'MMM dd, yyyy HH:mm')} icon={Calendar} color="text-gray-400" />}
      </div>

      {/* Analysis */}
      {signal.analysis?.reasoning && (
        <div className="rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a]">
          <h3 className="text-sm font-bold text-white mb-3">Market Analysis</h3>
          <div className="space-y-2">
            {signal.analysis.reasoning.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{r}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">Trading signals are for informational purposes only. Always use proper risk management. Past performance does not guarantee future results.</p>
        </div>
      </div>
    </div>
  );
};
export default SignalDetails;
