import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const [time, setTime] = useState(new Date());
  const [searchFocused, setSearchFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fmt = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-6 relative"
      style={{
        height: 68,
        background: 'rgba(10,13,22,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Shimmer top line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)' }}
        animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Left: title */}
      <div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-bold text-white tracking-tight"
        >
          {title}
        </motion.h1>
        {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Live clock */}
        <div className="hidden lg:flex flex-col items-end mr-2">
          <p className="text-xs font-mono font-semibold text-gray-300">{fmt}</p>
          <p className="text-[10px] text-gray-600">{fmtDate}</p>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-200"
            style={{ color: searchFocused ? '#3b82f6' : '#4b5563' }}
          />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-48 pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 rounded-lg outline-none transition-all duration-200"
            style={{
              background: '#0a0d14',
              border: `1px solid ${searchFocused ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: searchFocused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
            }}
          />
        </div>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#d1d5db'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <Bell className="w-4 h-4" />
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"
          />
        </motion.button>

        {/* Profile dropdown */}
        <div className="relative" ref={ref}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
            style={{
              background: dropdown ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${dropdown ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}
            >
              SA
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">Super Admin</p>
              <p className="text-[10px] text-gray-500 mt-0.5">admin@vantiq.io</p>
            </div>
            <motion.div animate={{ rotate: dropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {dropdown && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
                style={{
                  background: '#0f1320',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-semibold text-white">Super Admin</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">admin@vantiq.io</p>
                </div>
                {[
                  { icon: User,     label: 'Profile',  action: () => navigate('/admin/settings') },
                  { icon: Settings, label: 'Settings', action: () => navigate('/admin/settings') },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                    >
                      <Icon className="w-3.5 h-3.5" /> {item.label}
                    </button>
                  );
                })}
                <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/admin/login'; }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
