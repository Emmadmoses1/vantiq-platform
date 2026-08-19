import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Bitcoin, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import telegram from '../config/telegram';

const stagger = { animate:{ transition:{ staggerChildren:0.04 } } };
const fadeUp  = { initial:{ opacity:0, y:10 }, animate:{ opacity:1, y:0 } };

const MARKETS = [
  { id:'crypto',  label:'Crypto',  icon:Bitcoin   },
  { id:'forex',   label:'Forex',   icon:DollarSign },
  { id:'indices', label:'Indices', icon:BarChart3  },
];

const PAIRS = {
  crypto: [
    { symbol:'BTC/USDT', price:'67,234.50', change:2.45,  vol:'28.4B', cap:'1.32T' },
    { symbol:'ETH/USDT', price:'3,456.78',  change:1.23,  vol:'14.2B', cap:'415B'  },
    { symbol:'BNB/USDT', price:'567.89',    change:-0.89, vol:'2.1B',  cap:'87B'   },
    { symbol:'SOL/USDT', price:'134.56',    change:3.21,  vol:'1.8B',  cap:'59B'   },
    { symbol:'XRP/USDT', price:'0.6789',    change:1.45,  vol:'3.2B',  cap:'37B'   },
    { symbol:'ADA/USDT', price:'0.4521',    change:-1.12, vol:'0.8B',  cap:'16B'   },
  ],
  forex: [
    { symbol:'EUR/USD', price:'1.0850', change:0.12,  vol:'245B', cap:'—' },
    { symbol:'GBP/USD', price:'1.2645', change:-0.08, vol:'178B', cap:'—' },
    { symbol:'USD/JPY', price:'149.32', change:0.34,  vol:'312B', cap:'—' },
    { symbol:'AUD/USD', price:'0.6534', change:0.21,  vol:'89B',  cap:'—' },
    { symbol:'USD/CAD', price:'1.3421', change:-0.15, vol:'67B',  cap:'—' },
  ],
  indices: [
    { symbol:'US30',  price:'38,234.56', change:0.89,  vol:'234B', cap:'—' },
    { symbol:'US100', price:'16,789.23', change:1.12,  vol:'189B', cap:'—' },
    { symbol:'US500', price:'4,876.45',  change:0.67,  vol:'267B', cap:'—' },
    { symbol:'GER40', price:'17,234.80', change:-0.34, vol:'98B',  cap:'—' },
  ],
};

const PairRow = ({ pair, starred, onStar, index }) => {
  const up = pair.change >= 0;
  return (
    <motion.div
      variants={fadeUp} transition={{ delay:index*0.04 }}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors"
      style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
      <motion.button whileTap={{ scale:0.85 }} onClick={() => { telegram.haptic?.('light'); onStar(pair.symbol); }}>
        <Star className={`w-4 h-4 transition-all duration-200 ${starred?'text-amber-400 fill-amber-400':'text-gray-700'}`} />
      </motion.button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white font-mono">{pair.symbol}</p>
        <p className="text-[10px] text-gray-600">Vol: {pair.vol}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-white font-mono">{pair.price}</p>
        <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${up?'text-emerald-400':'text-red-400'}`}>
          {up ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
          {up?'+':''}{pair.change}%
        </div>
      </div>
    </motion.div>
  );
};

export default function Markets() {
  const [tab, setTab]           = useState('crypto');
  const [watchlist, setWatch]   = useState(['BTC/USDT','ETH/USDT']);
  const [refreshing, setRef]    = useState(false);

  const toggle = sym => setWatch(w => w.includes(sym) ? w.filter(s=>s!==sym) : [...w,sym]);
  const currentPairs = PAIRS[tab] || [];
  const watched = currentPairs.filter(p => watchlist.includes(p.symbol));

  const refresh = () => {
    setRef(true);
    setTimeout(() => setRef(false), 1000);
    telegram.haptic?.('light');
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="pb-6">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Markets</h1>
          <p className="text-[10px] text-gray-600 mt-0.5">Indicative prices — reference only</p>
        </div>
        <motion.button whileTap={{ scale:0.9 }} onClick={refresh}
          className="p-2 rounded-xl mt-1" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <motion.div animate={{ rotate:refreshing?360:0 }} transition={{ duration:0.8, repeat:refreshing?Infinity:0, ease:'linear' }}>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </motion.div>
        </motion.button>
      </div>

      {/* Market tabs */}
      <div className="px-4 flex gap-2 mb-4">
        {MARKETS.map(m => {
          const Icon = m.icon;
          const active = tab === m.id;
          return (
            <motion.button key={m.id} whileTap={{ scale:0.93 }}
              onClick={() => { telegram.haptic?.('light'); setTab(m.id); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: active?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',
                border: `1px solid ${active?'rgba(59,130,246,0.3)':'rgba(255,255,255,0.07)'}`,
                color: active?'#60a5fa':'#6b7280',
                boxShadow: active?'0 0 12px rgba(59,130,246,0.12)':'none',
              }}>
              <Icon className="w-3.5 h-3.5"/>{m.label}
            </motion.button>
          );
        })}
      </div>

      {/* Watchlist */}
      <AnimatePresence>
        {watched.length > 0 && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="mx-4 mb-3 rounded-2xl overflow-hidden"
            style={{ background:'#0a0e1a', border:'1px solid rgba(245,158,11,0.15)' }}
          >
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Watchlist</span>
            </div>
            {watched.map((p,i) => <PairRow key={p.symbol} pair={p} starred index={i} onStar={toggle}/>)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All pairs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
          className="mx-4 rounded-2xl overflow-hidden"
          style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
              {MARKETS.find(m=>m.id===tab)?.label} Pairs
            </span>
          </div>
          {currentPairs.map((p,i) => (
            <PairRow key={p.symbol} pair={p} starred={watchlist.includes(p.symbol)} index={i} onStar={toggle}/>
          ))}
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-[9px] text-gray-700 mt-4 px-4">
        Prices are indicative. Not financial advice.
      </p>
    </motion.div>
  );
}
