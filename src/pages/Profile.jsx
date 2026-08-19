import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, ChevronRight, CreditCard, Activity, HelpCircle, LogOut, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import telegram from '../config/telegram';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const Toggle = ({ on, onToggle }) => (
  <motion.button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-blue-500' : 'bg-white/[0.1]'}`}>
    <motion.div animate={{ x: on ? 26 : 2 }} transition={{ type: 'spring', stiffness: 600, damping: 35 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
  </motion.button>
);

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const touchStartRef = React.useRef(null);
  const [notifPrefs, setNotifPrefs] = useState({ signals: true, tpHit: true, slHit: true, announcements: true, marketAlerts: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [u, sub] = await Promise.all([api.getProfile().catch((e) => { telegram.showAlert('PROFILE ERROR: ' + e.message); return null; }), api.getUserSubscription().catch(() => null)]);
      setUser(u); setSubscription(sub);
      if (u?.notification_preferences) setNotifPrefs(u.notification_preferences);
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    const ok = await telegram.showConfirm('Sign out of VANTIQ?');
    if (ok) { telegram.haptic('medium'); localStorage.clear(); navigate('/'); telegram.close(); }
  };

  const saveNotifs = async () => {
    try {
      telegram.haptic('medium');
      // api.updateProfile({ notification_preferences: notifPrefs }) — add when backend ready
      setShowNotifModal(false);
    } catch (e) { telegram.showAlert('Failed to save'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader size="lg" text="Loading profile..." /></div>;

  const initial = (user?.first_name || 'U').charAt(0).toUpperCase();

  const sections = [
    {
      title: 'Account', items: [
        { icon: User, label: 'Name', value: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Not set', onClick: () => {} },
        { icon: CreditCard, label: 'Subscription', value: subscription ? subscription.plan_name : 'No plan', badge: subscription ? 'Active' : null, onClick: () => navigate('/subscription') },
        { icon: Activity, label: 'Trading Style', value: user?.risk_preference || 'Medium risk', onClick: () => {} },
      ]
    },
    {
      title: 'Settings', items: [
        { icon: Bell, label: 'Notifications', value: 'Configure alerts', onClick: () => setShowNotifModal(true) },
        { icon: Shield, label: 'Privacy', value: 'Data & security', onClick: () => navigate('/privacy') },
        { icon: HelpCircle, label: 'Help Center', value: 'Get support', onClick: () => telegram.openLink('https://vantiq.io/help') },
      ]
    },
  ];

  return (
    <motion.div
      variants={stagger} initial="initial" animate="animate" className="p-4 pb-6 space-y-5"
      onTouchStart={(e) => {
        if (e.touches.length === 3) touchStartRef.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (touchStartRef.current !== null) {
          const endY = e.changedTouches[0].clientY;
          const deltaY = touchStartRef.current - endY;
          if (deltaY > 60) navigate('/admin'); // swiped up at least 60px
          touchStartRef.current = null;
        }
      }}
    >
      {/* Avatar card */}
      <motion.div variants={fadeUp} className="rounded-2xl p-5 border border-white/[0.06] bg-gradient-to-br from-blue-500/[0.07] to-cyan-500/[0.04] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-md" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <span className="text-2xl font-bold text-white">{initial}</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user?.first_name || 'Trader'} {user?.last_name || ''}</h2>
            <p className="text-xs text-gray-600 mt-0.5 font-mono">@{user?.username || 'user'}</p>
            {subscription && <Badge variant="success" className="mt-2">{subscription.plan_name}</Badge>}
          </div>
        </div>
        {!subscription && (
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/subscription')}
            className="mt-4 w-full py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-sm font-semibold text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors">
            <Zap className="w-4 h-4" /> Upgrade to Premium
          </motion.button>
        )}
      </motion.div>

      {/* Menu sections */}
      {sections.map(section => (
        <motion.div key={section.title} variants={fadeUp}>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2 px-1">{section.title}</p>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e1a] overflow-hidden divide-y divide-white/[0.04]">
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <motion.button key={item.label} whileTap={{ scale: 0.99 }} onClick={() => { telegram.haptic('light'); item.onClick(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-gray-600 truncate">{item.value}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && <Badge variant="success">{item.badge}</Badge>}
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* App info */}
      <motion.div variants={fadeUp} className="text-center py-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>VANTIQ</p>
        <p className="text-[10px] text-gray-700 mt-1">v2.0.0 · Precision. Intelligence. Edge.</p>
      </motion.div>

      {/* Logout */}
      <motion.div variants={fadeUp}>
        <Button variant="danger" fullWidth onClick={handleLogout} icon={LogOut}>Sign Out</Button>
      </motion.div>

      {/* Notification modal */}
      <Modal isOpen={showNotifModal} onClose={() => setShowNotifModal(false)} title="Notification Preferences">
        <div className="space-y-3">
          {[
            { key: 'signals', label: 'New Signals', sub: 'When new signals are published' },
            { key: 'tpHit', label: 'Take Profit Alerts', sub: 'When TP levels are reached' },
            { key: 'slHit', label: 'Stop Loss Alerts', sub: 'When SL is triggered' },
            { key: 'announcements', label: 'Announcements', sub: 'Platform updates and news' },
            { key: 'marketAlerts', label: 'Market Alerts', sub: 'Major market movements' },
          ].map(p => (
            <div key={p.key} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div>
                <p className="text-sm font-semibold text-white">{p.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{p.sub}</p>
              </div>
              <Toggle on={notifPrefs[p.key]} onToggle={() => { telegram.haptic('light'); setNotifPrefs({ ...notifPrefs, [p.key]: !notifPrefs[p.key] }); }} />
            </div>
          ))}
          <Button variant="primary" fullWidth onClick={saveNotifs} className="mt-2">Save Preferences</Button>
        </div>
      </Modal>
    </motion.div>
  );
};
export default Profile;
