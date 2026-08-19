import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import telegram from '../../config/telegram';

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',     sub: 'Market Intelligence' },
  '/signals':      { title: 'Signals',       sub: 'Live Feed'           },
  '/markets':      { title: 'Markets',       sub: 'Live Prices'         },
  '/performance':  { title: 'Performance',   sub: 'Analytics'           },
  '/profile':      { title: 'Profile',       sub: 'Account'             },
  '/notifications':{ title: 'Notifications', sub: 'Inbox'               },
  '/wallet':       { title: 'Wallet',        sub: 'Transactions'        },
  '/subscription': { title: 'Plans',         sub: 'Subscription'        },
};

const Header = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const page = PAGE_TITLES[location.pathname] || { title: 'VANTIQ', sub: 'Market Intelligence' };
  const isHome = location.pathname === '/dashboard';

  useEffect(() => {
    const el = document.querySelector('main') || window;
    const onScroll = () => setScrolled((el.scrollTop || window.scrollY) > 10);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(5,8,16,0.97)' : 'rgba(5,8,16,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="px-4 py-3 flex items-center justify-between">

        {/* Logo / Page title */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => { telegram.haptic?.('light'); navigate('/dashboard'); }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="relative w-9 h-9 flex-shrink-0">
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 blur-md"
            />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              {isHome ? (
                <>
                  <h1 className="text-base font-black tracking-[0.15em] bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    VANTIQ
                  </h1>
                  <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">Market Intelligence</p>
                </>
              ) : (
                <>
                  <h1 className="text-base font-bold text-white">{page.title}</h1>
                  <p className="text-[9px] text-gray-600 tracking-widest uppercase">{page.sub}</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
            onClick={() => { telegram.haptic?.('light'); navigate('/notifications'); }}
            className="relative p-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Bell className="w-[18px] h-[18px] text-gray-400" />
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
              style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }}
            />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
            onClick={() => { telegram.haptic?.('light'); navigate('/profile'); }}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <User className="w-[18px] h-[18px] text-gray-400" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
