import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Activity, CreditCard,
  BarChart3, Gift, Bell, Settings, FileText,
  LogOut, Zap, ChevronLeft, ChevronRight, TrendingUp,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/admin',              end: true },
  { icon: Users,           label: 'Users',          path: '/admin/users' },
  { icon: Activity,        label: 'Signals',        path: '/admin/signals' },
  { icon: Zap,             label: 'Signal Review',  path: '/admin/signal-review', badge: 3 },
  { icon: CreditCard,      label: 'Payments',       path: '/admin/payments' },
  { icon: BarChart3,       label: 'Analytics',      path: '/admin/analytics' },
  { icon: Gift,            label: 'Promo Codes',    path: '/admin/promo-codes' },
  { icon: Bell,            label: 'Announcements',  path: '/admin/announcements' },
  { icon: FileText,        label: 'Audit Logs',     path: '/admin/audit-logs' },
  { icon: Settings,        label: 'Settings',       path: '/admin/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-screen flex-shrink-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0d16 0%, #080b12 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle side glow */}
      <div
        className="absolute inset-y-0 right-0 w-px pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.3), transparent)' }}
      />

      {/* Collapse button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-9 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-colors"
        style={{
          background: '#0f1320',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-gray-400" />
          : <ChevronLeft className="w-3 h-3 text-gray-400" />}
      </motion.button>

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 border-b overflow-hidden"
        style={{ height: 68, borderColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center relative"
          style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}
        >
          <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} style={{ width: 18, height: 18 }} />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl"
            style={{ boxShadow: '0 0 12px rgba(59,130,246,0.5)' }}
          />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-black tracking-[0.2em] text-white uppercase">Vantiq</p>
              <p className="text-[9px] tracking-[0.15em] uppercase font-semibold" style={{ color: '#3b82f6' }}>
                Admin Panel
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <NavLink
                to={item.path}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group"
                style={{
                  background: isActive ? 'rgba(37,99,235,0.2)' : 'transparent',
                  color: isActive ? '#fff' : '#6b7280',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#d1d5db'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isActive ? '#fff' : '#6b7280'; }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: '#3b82f6' }} />
                )}
                <Icon className="w-[18px] h-[18px] flex-shrink-0 relative z-10" style={{ color: isActive ? '#60a5fa' : 'inherit' }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 text-sm font-medium relative z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-bold relative z-10"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                  >
                    {item.badge}
                  </motion.span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="px-2 pb-3 pt-2 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Admin badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}
              >
                SA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Super Admin</p>
                <p className="text-[10px] text-gray-600 truncate">admin@vantiq.io</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 ml-auto" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
          style={{ color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
