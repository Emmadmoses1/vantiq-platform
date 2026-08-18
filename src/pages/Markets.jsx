import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Bitcoin, DollarSign, BarChart3 } from 'lucide-react';
import telegram from '../config/telegram';

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const markets = [
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
  { id: 'forex', label: 'Forex', icon: DollarSign },
  { id: 'indices', label: 'Indices', icon: BarChart3 },
];

const pairs = {
  crypto: [
    { symbol: 'BTC/USDT', price: '67,234.50', change: 2.45, vol: '28.4B', mktCap: '1.32T' },
    { symbol: 'ETH/USDT', price: '3,456.78', change: 1.23, vol: '14.2B', mktCap: '415B' },
    { symbol: 'BNB/USDT', price: '567.89', change: -0.89, vol: '2.1B', mktCap: '87B' },
    { symbol: 'SOL/USDT', price: '134.56', change: 3.21, vol: '1.8B', mktCap: '59B' },
    { symbol: 'XRP/USDT', price: '0.6789', change: 1.45, vol: '3.2B', mktCap: '37B' },
    { symbol: 'ADA/USDT', price: '0.4521', change: -1.12, vol: '0.8B', mktCap: '16B' },
  ],
  forex: [
    { symbol: 'EUR/USD', price: '1.0850', change: 0.12, vol: '245B', mktCap: '—' },
    { symbol: 'GBP/USD', price: '1.2645', change: -0.08, vol: '178B', mktCap: '—' },
    { symbol: 'USD/JPY', price: '149.32', change: 0.34, vol: '312B', mktCap: '—' },
    { symbol: 'AUD/USD', price: '0.6534', change: 0.21, vol: '89B', mktCap: '—' },
    { symbol: 'USD/CAD', price: '1.3421', change: -0.15, vol: '67B', mktCap: '—' },
  ],
  indices: [
    { symbol: 'US30', price: '38,234.56', change: 0.89, vol: '234B', mktCap: '—' },
    { symbol: 'US100', price: '16,789.23', change: 1.12, vol: '189B', mktCap: '—' },
    { symbol: 'US500', price: '4,876.45', change: 0.67, vol: '267B', mktCap: '—' },
    { symbol: 'GER40', price: '17,234.80', change: -0.34, vol: '98B', mktCap: '—' },
  ],
};

const PairRow = ({ pair, starred, onStar, index }) => {
  const up = pair.change >= 0;
  return (
    <motion.div variants={fadeUp} transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
      <button onClick={() => { telegram.haptic('light'); onStar(pair.symbol); }} className="flex-shrink-0">
        <Star className={`w-4 h-4 transition-colors ${starred ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white font-mono">{pair.symbol}</p>
        <p className="text-[10px] text-gray-600">Vol: {pair.vol}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white font-mono">{pair.price}</p>
        <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? '+' : ''}{pair.change}%
        </div>
      </div>
    </motion.div>
  );
};

const Markets = () => {
  const [tab, setTab] = useState('crypto');
  const [watchlist, setWatchlist] = useState(['BTC/USDT', 'ETH/USDT']);
  const toggle = sym => setWatchlist(w => w.includes(sym) ? w.filter(s => s !== sym) : [...w, sym]);
  const currentPairs = pairs[tab] || [];
  const watchedPairs = currentPairs.filter(p => watchlist.includes(p.symbol));

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1">Live Data</p>
        <h1 className="text-2xl font-bold text-white">Markets</h1>
        <p className="text-xs text-gray-600 mt-0.5">Indicative prices — for reference only</p>
      </div>

      {/* Market tabs */}
      <div className="px-4 flex gap-2 mb-4">
        {markets.map(m => {
          const Icon = m.icon;
          const active = tab === m.id;
          return (
            <motion.button key={m.id} whileTap={{ scale: 0.94 }}
              onClick={() => { telegram.haptic('light'); setTab(m.id); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${active ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-white/[0.03] text-gray-500 border-white/[0.06]'}`}>
              <Icon className="w-3.5 h-3.5" />{m.label}
            </motion.button>
          );
        })}
      </div>

      {/* Watchlist */}
      {watchedPairs.length > 0 && (
        <motion.div variants={fadeUp} className="mx-4 mb-4 rounded-2xl border border-amber-500/15 overflow-hidden" style={{ background: '#0a0e1a' }}>
          <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Watchlist</span>
          </div>
          {watchedPairs.map((p, i) => <PairRow key={p.symbol} pair={p} starred index={i} onStar={toggle} />)}
        </motion.div>
      )}

      {/* All pairs */}
      <motion.div variants={fadeUp} className="mx-4 rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#0a0e1a' }}>
        <div className="px-4 py-2.5 border-b border-white/[0.05]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{markets.find(m => m.id === tab)?.label} Pairs</span>
        </div>
        {currentPairs.map((p, i) => <PairRow key={p.symbol} pair={p} starred={watchlist.includes(p.symbol)} index={i} onStar={toggle} />)}
      </motion.div>

      <p className="text-center text-[10px] text-gray-700 mt-4 px-4">Prices are indicative. Not financial advice.</p>
    </motion.div>
  );
};
export default Markets;
