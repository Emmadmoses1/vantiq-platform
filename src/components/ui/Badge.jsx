import React from 'react';
import { clsx } from 'clsx';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-white/10 text-gray-300 border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    primary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border tracking-wide uppercase', variants[variant], className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full pulse-dot', {
        'bg-emerald-400': variant === 'success',
        'bg-red-400': variant === 'danger',
        'bg-amber-400': variant === 'warning',
        'bg-blue-400': variant === 'info' || variant === 'primary',
        'bg-cyan-400': variant === 'cyan',
        'bg-gray-400': variant === 'default',
      })} />
      {children}
    </span>
  );
};

export default Badge;
