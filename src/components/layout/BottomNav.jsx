import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, TrendingUp, BarChart3, User } from 'lucide-react';
import telegram from '../../config/telegram';

const NAV = [
  { path: '/dashboard',   icon: Home,       label: 'Home'    },
  { path: '/signals',     icon: Activity,   label: 'Signals' },
  { path: '/markets',     icon: TrendingUp, label: 'Markets' },
  { path: '/performance', icon: BarChart3,  label: 'Stats'   },
  { path: '/profile',     icon: User,       label: 'Profile' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(5,8,16,0.95)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <motion.button
              key={path}
              whileTap={{ scale: 0.82 }}
              onClick={() => { telegram.haptic?.('light'); navigate(path); }}
              className="relative flex flex-col items-center gap-1 flex-1 max-w-[68px] py-1"
            >
              {/* Active pill bg */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="navPill"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'rgba(59,130,246,0.12)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      boxShadow: '0 0 16px rgba(59,130,246,0.12)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="relative">
                <motion.div
                  animate={{ color: active ? '#60a5fa' : '#4b5563' }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                {active && (
                  <motion.div
                    layoutId="navGlow"
                    className="absolute -inset-1 rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)' }}
                  />
                )}
              </div>

              {/* Label */}
              <motion.span
                animate={{ color: active ? '#60a5fa' : '#4b5563' }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-semibold tracking-wide relative z-10"
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
