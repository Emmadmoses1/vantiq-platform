import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import telegram from '../../config/telegram';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) telegram.showBackButton(onClose);
    else telegram.hideBackButton();
    return () => telegram.hideBackButton();
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden"
              style={{ background: '#0a0e1a', maxHeight: '92vh' }}>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b border-white/[0.06]"
                style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)' }}>
                <h2 className="text-base font-bold text-white">{title}</h2>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                  className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>
              <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(92vh - 60px)' }}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
export default Modal;
