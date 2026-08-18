import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Target, TrendingUp, Shield, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import api from '../lib/api';
import telegram from '../config/telegram';

const slides = [
  { title: 'Welcome to VANTIQ', sub: 'Precision. Intelligence. Edge.', desc: 'Professional trading signals powered by institutional-grade market analysis.', icon: Zap, color: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.3)' },
  { title: 'Premium Signals', sub: 'Every level. Every move.', desc: 'Detailed entry points, stop losses, and take profit targets for every signal we publish.', icon: Target, color: 'from-emerald-500 to-green-400', glow: 'rgba(16,185,129,0.3)' },
  { title: 'Track Performance', sub: 'Transparent by default.', desc: 'Real-time analytics on win rate, profit factor, and signal history. No hidden numbers.', icon: TrendingUp, color: 'from-purple-500 to-blue-500', glow: 'rgba(139,92,246,0.3)' },
  { title: 'Secure & Private', sub: 'Your data stays yours.', desc: 'Crypto-native payments, no credit cards, no recurring charges without your approval.', icon: Shield, color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.3)' },
];

const markets = [
  { id: 'crypto', name: 'Crypto', emoji: '₿', desc: 'BTC, ETH, altcoins' },
  { id: 'forex', name: 'Forex', emoji: '$', desc: 'Major & minor pairs' },
  { id: 'gold', name: 'Metals', emoji: '⚡', desc: 'Gold, silver' },
  { id: 'indices', name: 'Indices', emoji: '📊', desc: 'US30, US100' },
];

const riskLevels = [
  { id: 'low', name: 'Conservative', desc: 'Lower frequency, tighter setups', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'medium', name: 'Balanced', desc: 'Mix of setups across timeframes', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'high', name: 'Aggressive', desc: 'Higher frequency, scalp-friendly', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [risk, setRisk] = useState('medium');

  const next = () => { telegram.haptic('light'); setStep(s => s + 1); };

  const toggleMarket = id => {
    telegram.haptic('light');
    setSelectedMarkets(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id]);
  };

  const complete = async () => {
    try { telegram.haptic('medium'); await api.updateProfile({ preferred_markets: selectedMarkets, risk_preference: risk }).catch(() => {}); }
    finally { navigate('/dashboard'); }
  };

  const isSlide = typeof step === 'number' && step < slides.length;
  const isMarkets = step === slides.length;
  const isRisk = step === slides.length + 1;

  return (
    <div className="min-h-screen flex flex-col p-6" style={{ background: '#050810' }}>
      {/* BG orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {isSlide && (
            <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col justify-center items-center text-center">
              {/* Icon */}
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                className="relative mb-10">
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" style={{ background: `radial-gradient(circle, ${slides[step].glow} 0%, transparent 70%)` }} />
                <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[step].color} flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]`}>
                  {React.createElement(slides[step].icon, { className: 'w-12 h-12 text-white' })}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3 mb-12 px-4">
                <h1 className="text-3xl font-bold text-white">{slides[step].title}</h1>
                <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{slides[step].sub}</p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{slides[step].desc}</p>
              </motion.div>
              {/* Progress */}
              <div className="flex gap-1.5 mb-10">
                {slides.map((_, i) => (
                  <motion.div key={i} animate={{ width: i === step ? 24 : 6 }} className={`h-1.5 rounded-full transition-colors ${i === step ? 'bg-blue-500' : 'bg-white/[0.1]'}`} />
                ))}
              </div>
              <Button variant="primary" size="lg" onClick={next} icon={ChevronRight} iconPosition="right" className="min-w-[180px]">
                {step === slides.length - 1 ? "Get Started" : "Next"}
              </Button>
            </motion.div>
          )}

          {isMarkets && (
            <motion.div key="markets" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex-1 flex flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Your Markets</h2>
                <p className="text-sm text-gray-500">Select all markets you want signals for</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {markets.map(m => {
                  const sel = selectedMarkets.includes(m.id);
                  return (
                    <motion.button key={m.id} whileTap={{ scale: 0.96 }} onClick={() => toggleMarket(m.id)}
                      className={`p-5 rounded-2xl border text-left transition-all ${sel ? 'bg-blue-500/15 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'}`}>
                      <div className="text-2xl mb-3">{m.emoji}</div>
                      <p className="text-sm font-bold text-white">{m.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
                      {sel && <div className="mt-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </motion.button>
                  );
                })}
              </div>
              <Button variant="primary" fullWidth size="lg" onClick={next} disabled={selectedMarkets.length === 0}>Continue</Button>
            </motion.div>
          )}

          {isRisk && (
            <motion.div key="risk" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex-1 flex flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Trading Style</h2>
                <p className="text-sm text-gray-500">How do you approach risk?</p>
              </div>
              <div className="space-y-3 mb-8">
                {riskLevels.map(r => {
                  const sel = risk === r.id;
                  return (
                    <motion.button key={r.id} whileTap={{ scale: 0.98 }} onClick={() => { telegram.haptic('light'); setRisk(r.id); }}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${sel ? `${r.bg} ${r.border}` : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-bold ${sel ? r.color : 'text-white'}`}>{r.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{r.desc}</p>
                        </div>
                        {sel && <div className={`w-5 h-5 rounded-full flex items-center justify-center ${r.bg} border ${r.border}`}><Check className={`w-3 h-3 ${r.color}`} /></div>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <Button variant="primary" fullWidth size="lg" onClick={complete}>Complete Setup</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default Onboarding;
