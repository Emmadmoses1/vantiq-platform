import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled = false, icon: Icon, iconPosition = 'left', onClick, className, ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none select-none';
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:from-blue-400 hover:to-cyan-400',
    secondary: 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/20',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/[0.06]',
    outline: 'border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm gap-1.5', md: 'px-5 py-2.5 text-sm gap-2', lg: 'px-7 py-3.5 text-base gap-2.5' };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Loading...</span></>) : (
        <>{Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}{children}{Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}</>
      )}
    </motion.button>
  );
};

export default Button;
