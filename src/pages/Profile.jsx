import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, ChevronRight, CreditCard, Activity, HelpCircle, LogOut, Zap, Shield, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import telegram from '../config/telegram';

const stagger = { animate:{ transition:{ staggerChildren:0.06 } } };
const fadeUp  = { initial:{ opacity:0, y:12 }, animate:{ opacity:1, y:0 } };

const Toggle = ({ on, onToggle }) => (
  <motion.button onClick={onToggle}
    className="relative w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-300"
    style={{ background: on ? '#2563eb' : 'rgba(255,255,255,0.1)' }}>
    <motion.div
      animate={{ x: on ? 26 : 2 }}
      transition={{ type:'spring', stiffness:600, damping:35 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
    />
  </motion.button>
);

export default function Profile() {
  const navigate = useNavigate();
  const touchRef = React.useRef(null);
  const [loading, setLoading]         = useState(true);
  const [user, setUser]               = useState(null);
  const [subscription, setSub]        = useState(null);
  const [showNotif, setShowNotif]     = useState(false);
  const [notifPrefs, setNotifPrefs]   = useState({ signals:true, tpHit:true, slHit:true, announcements:true, marketAlerts:false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [u, sub] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getUserSubscription().catch(() => null),
      ]);
      setUser(u); setSub(sub);
      if (u?.notification_preferences) setNotifPrefs(u.notification_preferences);
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    const ok = await telegram.showConfirm?.('Sign out of VANTIQ?');
    if (ok) { telegram.haptic?.('medium'); localStorage.clear(); navigate('/'); telegram.close?.(); }
  };

  const saveNotifs = async () => {
    try { telegram.haptic?.('medium'); setShowNotif(false); }
    catch { telegram.showAlert?.('Failed to save'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <Loader size="lg" text="Loading profile..." />
    </div>
  );

  const initials = [(user?.first_name||'')[0], (user?.last_name||'')[0]].filter(Boolean).join('').toUpperCase() || 'T';

  const SECTIONS = [
    {
      title:'Account', items:[
        { icon:User,       label:'Name',         value:`${user?.first_name||''} ${user?.last_name||''}`.trim()||'Not set', onClick:()=>{} },
        { icon:CreditCard, label:'Subscription',  value:subscription?subscription.plan_name:'No active plan', badge:subscription?'Active':null, onClick:()=>navigate('/subscription') },
        { icon:Activity,   label:'Trading Style', value:user?.risk_preference||'Medium risk', onClick:()=>{} },
      ]
    },
    {
      title:'Settings', items:[
        { icon:Bell,       label:'Notifications', value:'Configure alerts',  onClick:()=>setShowNotif(true) },
        { icon:Shield,     label:'Privacy',       value:'Data & security',   onClick:()=>{} },
        { icon:HelpCircle, label:'Help Center',   value:'Get support',       onClick:()=>telegram.openLink?.('https://vantiq.io/help') },
      ]
    },
  ];

  return (
    <motion.div
      variants={stagger} initial="initial" animate="animate"
      className="p-4 pb-6 space-y-5"
      onTouchStart={e => { if(e.touches.length===3) touchRef.current=e.touches[0].clientY; }}
      onTouchEnd={e => {
        if(touchRef.current!==null){
          if(touchRef.current - e.changedTouches[0].clientY > 60) navigate('/admin');
          touchRef.current = null;
        }
      }}
    >
      {/* Avatar card */}
      <motion.div variants={fadeUp}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(8,145,178,0.05))', border:'1px solid rgba(59,130,246,0.15)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background:'radial-gradient(circle at top right,rgba(59,130,246,0.08),transparent 70%)' }} />
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{ opacity:[0.2,0.4,0.2] }} transition={{ duration:3, repeat:Infinity }}
              className="absolute inset-0 rounded-2xl blur-md bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background:'linear-gradient(135deg,#1d4ed8,#0891b2)', boxShadow:'0 0 24px rgba(59,130,246,0.3)' }}>
              {initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white truncate">
              {user?.first_name||'Trader'} {user?.last_name||''}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 font-mono">@{user?.username||'user'}</p>
            {subscription && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-green-500/15 text-green-400 uppercase tracking-wider">
                ✦ {subscription.plan_name}
              </span>
            )}
          </div>
        </div>
        {!subscription && (
          <motion.button
            whileTap={{ scale:0.98 }} onClick={() => navigate('/subscription')}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-black text-blue-400 flex items-center justify-center gap-2 transition-all"
            style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' }}>
            <Zap className="w-4 h-4" /> Upgrade to Premium
          </motion.button>
        )}
      </motion.div>

      {/* Sections */}
      {SECTIONS.map(section => (
        <motion.div key={section.title} variants={fadeUp}>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-2 px-1">{section.title}</p>
          <div className="rounded-2xl overflow-hidden" style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.07)' }}>
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label} whileTap={{ scale:0.99 }}
                  onClick={() => { telegram.haptic?.('light'); item.onClick(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
                  style={{ borderBottom: i<section.items.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(59,130,246,0.1)' }}>
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{item.value}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-green-500/15 text-green-400">{item.badge}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* App info */}
      <motion.div variants={fadeUp} className="text-center py-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
          style={{ background:'linear-gradient(135deg,#1d4ed8,#0891b2)', boxShadow:'0 0 16px rgba(59,130,246,0.3)' }}>
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <p className="text-sm font-black tracking-[0.2em] bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ fontFamily:'JetBrains Mono, monospace' }}>VANTIQ</p>
        <p className="text-[10px] text-gray-700 mt-1">v2.0.0 · Precision. Intelligence. Edge.</p>
      </motion.div>

      {/* Logout */}
      <motion.div variants={fadeUp}>
        <motion.button
          whileTap={{ scale:0.97 }} onClick={handleLogout}
          className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </motion.button>
      </motion.div>

      {/* Notifications modal */}
      <Modal isOpen={showNotif} onClose={() => setShowNotif(false)} title="Notifications">
        <div className="space-y-2">
          {[
            { key:'signals',      label:'New Signals',      sub:'When new signals are published' },
            { key:'tpHit',        label:'Take Profit Alerts',sub:'When TP levels are reached'    },
            { key:'slHit',        label:'Stop Loss Alerts',  sub:'When SL is triggered'          },
            { key:'announcements',label:'Announcements',     sub:'Platform updates & news'        },
            { key:'marketAlerts', label:'Market Alerts',     sub:'Major market movements'         },
          ].map(p => (
            <div key={p.key}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-bold text-white">{p.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{p.sub}</p>
              </div>
              <Toggle on={notifPrefs[p.key]} onToggle={() => { telegram.haptic?.('light'); setNotifPrefs({ ...notifPrefs, [p.key]:!notifPrefs[p.key] }); }} />
            </div>
          ))}
          <motion.button
            whileTap={{ scale:0.97 }} onClick={saveNotifs}
            className="w-full mt-2 py-3.5 rounded-xl font-black text-sm text-white"
            style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
            Save Preferences
          </motion.button>
        </div>
      </Modal>
    </motion.div>
  );
}
