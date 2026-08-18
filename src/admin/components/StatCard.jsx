import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  primary: { bg: 'rgba(59,130,246,0.1)',  icon: '#3b82f6', glow: 'rgba(59,130,246,0.2)',  border: 'rgba(59,130,246,0.2)'  },
  success: { bg: 'rgba(16,185,129,0.1)',  icon: '#10b981', glow: 'rgba(16,185,129,0.2)',  border: 'rgba(16,185,129,0.2)'  },
  danger:  { bg: 'rgba(239,68,68,0.1)',   icon: '#ef4444', glow: 'rgba(239,68,68,0.2)',   border: 'rgba(239,68,68,0.2)'   },
  warning: { bg: 'rgba(245,158,11,0.1)',  icon: '#f59e0b', glow: 'rgba(245,158,11,0.2)',  border: 'rgba(245,158,11,0.2)'  },
  cyan:    { bg: 'rgba(6,182,212,0.1)',   icon: '#06b6d4', glow: 'rgba(6,182,212,0.2)',   border: 'rgba(6,182,212,0.2)'   },
  purple:  { bg: 'rgba(168,85,247,0.1)',  icon: '#a855f7', glow: 'rgba(168,85,247,0.2)',  border: 'rgba(168,85,247,0.2)'  },
};

const StatCard = ({ title, value, change, icon: Icon, trend, color = 'primary', subtitle, index = 0 }) => {
  const c = colorMap[color] || colorMap.primary;
  const isUp = trend === 'up';
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl p-5 relative overflow-hidden cursor-default"
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #0a0d14 100%)',
        border: `1px solid ${hovered ? c.border : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered ? `0 8px 32px ${c.glow}, 0 0 0 1px ${c.border}` : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Background accent */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${c.bg}, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.2 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: c.bg,
            boxShadow: hovered ? `0 0 16px ${c.glow}` : 'none',
            transition: 'box-shadow 0.25s ease',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </motion.div>

        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
            style={{
              background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: isUp ? '#10b981' : '#ef4444',
            }}
          >
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}%
          </motion.div>
        )}
      </div>

      <div className="relative z-10">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-white tracking-tight mb-0.5"
        >
          {value}
        </motion.p>
        <p className="text-xs font-semibold text-gray-500">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-700 mt-1">{subtitle}</p>}
      </div>

      {/* Bottom bar */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
        style={{ background: `linear-gradient(90deg, ${c.icon}, transparent)` }}
      />
    </motion.div>
  );
};

export default StatCard;
