import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import telegram from '../config/telegram';
import api from '../lib/api';

const isTelegram = () => {
  try {
    const tgApp = window.Telegram?.WebApp;
    if (!tgApp) return false;
    if (tgApp.initData && tgApp.initData.length > 0) return true;
    if (tgApp.platform && tgApp.platform !== 'unknown') return true;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('telegram')) return true;
    return false;
  } catch {
    return false;
  }
};

const TelegramGuard = ({ children }) => {
  const [status, setStatus] = useState('checking');
  const [welcome, setWelcome] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isTelegram()) {
        setStatus('blocked');
        return;
      }
      telegram.init();
      setStatus('registering');
      try {
        const result = await api.initialize();
        setWelcome({ firstName: result.user?.first_name || 'there', isNew: result.isNewUser });
        setTimeout(() => setWelcome(null), 2200);
        setStatus('allowed');
      } catch (e) {
        console.error('Registration failed:', e);
        setStatus('allowed');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'checking' || status === 'registering') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#06080f' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        {status === 'registering' && <p className="text-xs text-gray-600">Setting up your account...</p>}
      </div>
    );
  }

  if (status === 'blocked') return <BlockedScreen />;

  return (
    <>
      <AnimatePresence>
        {welcome && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-[100] flex justify-center">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0a0e1a] border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-white">Welcome, {welcome.firstName}! Your account is registered.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

const BlockedScreen = () => {
  const BOT_LINK = import.meta.env.VITE_TELEGRAM_BOT_LINK || 'https://t.me/your_bot/app';
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#05080f' }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full" style={{ width: 500, height: 500, top: '-10%', left: '-15%', background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(60px)' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute rounded-full" style={{ width: 400, height: 400, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg,rgba(59,130,246,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full max-w-sm text-center">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: '0 0 40px rgba(59,130,246,0.5)' }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">VANTIQ</h1>
          <p className="text-sm font-semibold text-gray-400 mb-1">Telegram Mini App Only</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-8">VANTIQ is exclusively available inside Telegram.<br />Open it through our bot to get access.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <motion.a href={BOT_LINK} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white overflow-hidden w-full justify-center" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)' }}>
            <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'linear' }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative z-10"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="relative z-10">Open in Telegram</span>
          </motion.a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Secure</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Telegram Only</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Premium</span>
          </div>
        </motion.div>
        <p className="text-[10px] text-gray-700 mt-5">© 2025 VANTIQ. All rights reserved.</p>
      </motion.div>
    </div>
  );
};

export default TelegramGuard;
