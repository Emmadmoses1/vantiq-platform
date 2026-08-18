import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, TrendingUp, BarChart3, User } from 'lucide-react';
import telegram from '../../config/telegram';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/signals', icon: Activity, label: 'Signals' },
  { path: '/markets', icon: TrendingUp, label: 'Markets' },
  { path: '/performance', icon: BarChart3, label: 'Stats' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handle = (path) => { telegram.haptic('light'); navigate(path); };

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
      style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <motion.button key={path} whileTap={{ scale: 0.88 }} onClick={() => handle(path)}
              className="relative flex flex-col items-center gap-1 px-3 py-2 flex-1 max-w-[70px]">
              <AnimatePresence>
                {active && (
                  <motion.div key="bg" layoutId="navBg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-xl bg-blue-500/10 border border-blue-500/20"
                    style={{ boxShadow: '0 0 15px rgba(59,130,246,0.15)' }} />
                )}
              </AnimatePresence>
              <div className="relative">
                <Icon className={`w-5 h-5 transition-all duration-200 ${active ? 'text-blue-400' : 'text-gray-600'}`} />
                {active && <motion.div layoutId="navDot" className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 6px rgba(59,130,246,0.8)' }} />}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${active ? 'text-blue-400' : 'text-gray-600'}`}>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
