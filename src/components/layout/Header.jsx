import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import telegram from '../../config/telegram';

const Header = () => {
  const navigate = useNavigate();
  const handleNotifications = () => { telegram.haptic('light'); navigate('/notifications'); };
  const handleSettings = () => { telegram.haptic('light'); navigate('/profile'); };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-white/[0.06]"
      style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-md" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              VANTIQ
            </h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">Market Intelligence</p>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {[{ icon: Bell, onClick: handleNotifications, badge: true }, { icon: Settings, onClick: handleSettings }].map(({ icon: Icon, onClick, badge }, i) => (
            <motion.button key={i} whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }} onClick={onClick}
              className="relative p-2 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all">
              <Icon className="w-[18px] h-[18px] text-gray-400" />
              {badge && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)]" />}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
