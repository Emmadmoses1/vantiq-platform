import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const hideNavRoutes = ['/onboarding', '/welcome'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen relative" style={{ background: '#050810' }}>
      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Blue nebula top-right */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }} />
        {/* Cyan nebula bottom-left */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />
        {/* Purple accent center */}
        <motion.div animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {showNav && <Header />}
        <main className={`flex-1 ${showNav ? 'pb-24' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default Layout;
