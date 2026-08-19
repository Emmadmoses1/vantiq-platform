import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Target, TrendingUp, Shield, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import telegram from '../config/telegram';

const SLIDES = [
  { title:'Welcome to VANTIQ', sub:'Precision. Intelligence. Edge.', desc:'Professional trading signals powered by institutional-grade market analysis.', icon:Zap,        a:'#2563eb', b:'#06b6d4', glow:'rgba(59,130,246,0.4)'  },
  { title:'Premium Signals',   sub:'Every level. Every move.',       desc:'Detailed entry points, stop losses, and take profit targets for every signal.', icon:Target,     a:'#10b981', b:'#34d399', glow:'rgba(16,185,129,0.4)'  },
  { title:'Track Performance', sub:'Transparent by default.',        desc:'Real-time analytics on win rate, profit factor, and signal history. No hidden numbers.', icon:TrendingUp, a:'#8b5cf6', b:'#3b82f6', glow:'rgba(139,92,246,0.4)' },
  { title:'Secure & Private',  sub:'Your data stays yours.',         desc:'Crypto-native payments. No credit cards. No auto-charges without your approval.',    icon:Shield,     a:'#06b6d4', b:'#2563eb', glow:'rgba(6,182,212,0.4)'  },
];

const MARKETS = [
  { id:'crypto',  name:'Crypto',  emoji:'₿', desc:'BTC, ETH, altcoins'  },
  { id:'forex',   name:'Forex',   emoji:'$', desc:'Major & minor pairs'  },
  { id:'gold',    name:'Metals',  emoji:'⚡',desc:'Gold, silver'          },
  { id:'indices', name:'Indices', emoji:'📊',desc:'US30, US100'           },
];

const RISKS = [
  { id:'low',    name:'Conservative', desc:'Lower frequency, tight setups',      color:'#34d399', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)' },
  { id:'medium', name:'Balanced',     desc:'Mix of setups across timeframes',    color:'#fbbf24', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.25)'  },
  { id:'high',   name:'Aggressive',   desc:'Higher frequency, scalp-friendly',   color:'#f87171', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)'   },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep]             = useState(0);
  const [markets, setMarkets]       = useState([]);
  const [risk, setRisk]             = useState('medium');

  const totalSteps = SLIDES.length + 2;
  const progress   = step / (totalSteps - 1);

  const next = () => { telegram.haptic?.('light'); setStep(s => s+1); };

  const toggleMarket = id => {
    telegram.haptic?.('light');
    setMarkets(m => m.includes(id) ? m.filter(x=>x!==id) : [...m,id]);
  };

  const complete = async () => {
    try {
      telegram.haptic?.('medium');
      await api.updateProfile({ preferred_markets:markets, risk_preference:risk }).catch(()=>{});
    } finally { navigate('/dashboard'); }
  };

  const isSlide   = step < SLIDES.length;
  const isMarkets = step === SLIDES.length;
  const isRisk    = step === SLIDES.length + 1;
  const slide     = SLIDES[step] || SLIDES[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background:'#05080f' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale:[1,1.2,1], opacity:[0.08,0.15,0.08] }}
          transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background:'radial-gradient(circle,#3b82f6,transparent 70%)', filter:'blur(40px)' }}
        />
        <motion.div
          animate={{ scale:[1,1.15,1], opacity:[0.06,0.12,0.06] }}
          transition={{ duration:10, repeat:Infinity, ease:'easeInOut', delay:3 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{ background:'radial-gradient(circle,#06b6d4,transparent 70%)', filter:'blur(40px)' }}
        />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background:'rgba(255,255,255,0.05)' }}>
        <motion.div
          animate={{ width:`${progress*100}%` }}
          transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
          className="h-full"
          style={{ background:'linear-gradient(90deg,#2563eb,#06b6d4)' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 pt-10">
        <AnimatePresence mode="wait">

          {/* Slides */}
          {isSlide && (
            <motion.div
              key={`slide-${step}`}
              initial={{ opacity:0, x:40, scale:0.97 }}
              animate={{ opacity:1, x:0,  scale:1 }}
              exit={{ opacity:0,  x:-40, scale:0.97 }}
              transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              className="flex-1 flex flex-col justify-center items-center text-center"
            >
              <motion.div
                initial={{ scale:0.5, rotate:-15 }} animate={{ scale:1, rotate:0 }}
                transition={{ delay:0.1, type:'spring', stiffness:220, damping:18 }}
                className="relative mb-10"
              >
                <motion.div
                  animate={{ scale:[1,1.2,1], opacity:[0.4,0.7,0.4] }}
                  transition={{ duration:3, repeat:Infinity }}
                  className="absolute inset-0 rounded-3xl blur-2xl"
                  style={{ background:`radial-gradient(circle,${slide.glow},transparent)` }}
                />
                <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{ background:`linear-gradient(135deg,${slide.a},${slide.b})`, boxShadow:`0 0 40px ${slide.glow}` }}>
                  {React.createElement(slide.icon, { className:'w-12 h-12 text-white' })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.2 }}
                className="space-y-3 mb-12 px-2"
              >
                <h1 className="text-3xl font-black text-white">{slide.title}</h1>
                <p className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {slide.sub}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{slide.desc}</p>
              </motion.div>

              {/* Dots */}
              <div className="flex gap-2 mb-10">
                {SLIDES.map((_,i) => (
                  <motion.div key={i} animate={{ width:i===step?24:6 }}
                    className="h-1.5 rounded-full transition-colors"
                    style={{ background:i===step?'#3b82f6':'rgba(255,255,255,0.1)' }} />
                ))}
              </div>

              <motion.button
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={next}
                className="relative min-w-[200px] py-4 rounded-2xl font-black text-white text-sm overflow-hidden"
                style={{ background:`linear-gradient(135deg,${slide.a},${slide.b})`, boxShadow:`0 8px 32px ${slide.glow}` }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }}
                  animate={{ x:['-100%','200%'] }} transition={{ duration:2, repeat:Infinity, repeatDelay:1 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {step === SLIDES.length-1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Markets */}
          {isMarkets && (
            <motion.div key="markets"
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white mb-1">Your Markets</h2>
                <p className="text-sm text-gray-500">Select all markets you want signals for</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                {MARKETS.map(m => {
                  const sel = markets.includes(m.id);
                  return (
                    <motion.button
                      key={m.id} whileTap={{ scale:0.95 }}
                      onClick={() => toggleMarket(m.id)}
                      className="p-5 rounded-2xl text-left transition-all duration-200 relative overflow-hidden"
                      style={{
                        background: sel?'rgba(37,99,235,0.12)':'rgba(255,255,255,0.03)',
                        border:`1px solid ${sel?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.08)'}`,
                        boxShadow: sel?'0 0 24px rgba(59,130,246,0.15)':'none',
                      }}
                    >
                      {sel && (
                        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background:'#2563eb' }}>
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                      <div className="text-2xl mb-3">{m.emoji}</div>
                      <p className="text-sm font-black text-white">{m.name}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{m.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                whileTap={{ scale:0.97 }} onClick={next}
                disabled={markets.length===0}
                className="w-full py-4 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-40"
                style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)' }}
              >
                Continue <ChevronRight className="w-4 h-4 inline ml-1" />
              </motion.button>
            </motion.div>
          )}

          {/* Risk */}
          {isRisk && (
            <motion.div key="risk"
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white mb-1">Trading Style</h2>
                <p className="text-sm text-gray-500">How do you approach risk?</p>
              </div>
              <div className="space-y-3 flex-1">
                {RISKS.map(r => {
                  const sel = risk === r.id;
                  return (
                    <motion.button
                      key={r.id} whileTap={{ scale:0.98 }}
                      onClick={() => { telegram.haptic?.('light'); setRisk(r.id); }}
                      className="w-full p-4 rounded-2xl text-left transition-all duration-200"
                      style={{
                        background: sel?r.bg:'rgba(255,255,255,0.02)',
                        border:`1px solid ${sel?r.border:'rgba(255,255,255,0.08)'}`,
                        boxShadow: sel?`0 0 20px ${r.bg}`:'none',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black" style={{ color:sel?r.color:'white' }}>{r.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{r.desc}</p>
                        </div>
                        <AnimatePresence>
                          {sel && (
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background:r.color }}>
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                whileTap={{ scale:0.97 }} onClick={complete}
                className="w-full mt-6 py-4 rounded-2xl font-black text-sm text-white"
                style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow:'0 8px 32px rgba(59,130,246,0.25)' }}
              >
                Complete Setup 🚀
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
