import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Card = ({ children, variant = 'default', hover = true, glow = false, gradient = false, className, onClick, ...props }) => {
  const base = 'rounded-2xl transition-all duration-300 overflow-hidden';
  const variants = {
    default: 'bg-[#0a0e1a] border border-white/[0.06] shadow-xl',
    glass: 'bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]',
    gradient: 'bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.06] border border-blue-500/20 backdrop-blur-xl',
    solid: 'bg-[#0f1425] border border-white/[0.06]',
    neon: 'bg-[#0a0e1a] border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover && onClick ? { y: -3, scale: 1.005, borderColor: 'rgba(59,130,246,0.3)' } : hover ? { y: -2 } : {}}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={clsx(base, variants[variant], onClick && 'cursor-pointer', glow && 'shadow-[0_0_30px_rgba(59,130,246,0.12)]', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
