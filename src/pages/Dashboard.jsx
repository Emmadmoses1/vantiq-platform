import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, Target, Calendar, ArrowRight, Zap, Award, ChevronRight, WifiOff, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import telegram from '../config/telegram';

const stagger  = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp   = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } } };

const STAT_COLORS = {
  blue:  { icon:'#60a5fa', bg:'rgba(59,130,246,0.1)',  glow:'rgba(59,130,246,0.15)'  },
  green: { icon:'#34d399', bg:'rgba(16,185,129,0.1)',  glow:'rgba(16,185,129,0.15)'  },
  cyan:  { icon:'#22d3ee', bg:'rgba(6,182,212,0.1)',   glow:'rgba(6,182,212,0.15)'   },
  amber: { icon:'#fbbf24', bg:'rgba(245,158,11,0.1)',  glow:'rgba(245,158,11,0.15)'  },
};

const StatCard = ({ icon:Icon, label, value, sub, color='blue', bar, barValue, index=0 }) => {
  const c = STAT_COLORS[color];
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl p-4 relative overflow-hidden transition-all duration-200"
      style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.06)', boxShadow:`0 0 20px ${c.glow}` }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
        style={{ background:`radial-gradient(circle at top right, ${c.bg}, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:c.bg }}>
          <Icon className="w-4 h-4" style={{ color:c.icon }} />
        </div>
        <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{label}</span>
      </div>
      <motion.p
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        className="text-2xl font-black text-white mb-1"
      >{value}</motion.p>
      {sub && <p className="text-[10px] text-gray-600">{sub}</p>}
      {bar && (
        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ width:0 }} animate={{ width:`${barValue}%` }}
            transition={{ duration:1.4, ease:[0.22,1,0.36,1], delay:0.4 }}
            className="h-full rounded-full" style={{ background:`linear-gradient(90deg,${c.icon},${c.icon}aa)` }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState(null);
  const [subscription, setSub]      = useState(null);
  const [recentSignals, setSignals] = useState([]);
  const [stats, setStats]           = useState(null);
  const [offline, setOffline]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async (isRefresh=false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setOffline(false);
      const [u, sub, sigs, st] = await Promise.all([
        api.getProfile().catch(() => ({ first_name:'Trader' })),
        api.getUserSubscription().catch(() => null),
        api.getActiveSignals().catch(() => []),
        api.getPerformanceStats(7).catch(() => null),
      ]);
      setUser(u); setSub(sub);
      setSignals((sigs||[]).slice(0,4));
      setStats(st);
    } catch { setOffline(true); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const daysLeft = subscription?.end_date
    ? Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000) : null;
  const hour = new Date().getHours();
  const greeting = hour<12 ? 'Good morning' : hour<17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh]" style={{ background:'#05080f' }}>
      <Loader size="lg" text="Loading dashboard..." />
    </div>
  );

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="p-4 pb-6 space-y-4">

      {/* Offline banner */}
      <AnimatePresence>
        {offline && (
          <motion.div variants={fadeUp} initial="initial" animate="animate"
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', color:'#fbbf24' }}>
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            Offline mode — connect Supabase to load live data
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting */}
      <motion.div variants={fadeUp} className="flex items-start justify-between pt-1">
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">{greeting}</p>
          <h1 className="text-2xl font-black text-white leading-tight">
            {user?.first_name || 'Trader'}
            <span className="ml-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">↗</span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5 font-mono">
            {new Date().toLocaleDateString('en-US',{ weekday:'long', month:'short', day:'numeric' })}
          </p>
        </div>
        <motion.button
          whileTap={{ scale:0.9 }}
          onClick={() => load(true)}
          className="p-2 rounded-xl mt-1"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration:0.8, repeat:refreshing?Infinity:0, ease:'linear' }}>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Subscription card */}
      {subscription ? (
        <motion.div variants={fadeUp} className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(8,145,178,0.08))', border:'1px solid rgba(59,130,246,0.2)' }}>
          {/* Shine */}
          <motion.div
            animate={{ x:['-120%','220%'] }} transition={{ duration:3.5, repeat:Infinity, repeatDelay:5, ease:'easeInOut' }}
            className="absolute inset-y-0 w-24 pointer-events-none skew-x-12"
            style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)' }}
          />
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
            style={{ background:'radial-gradient(circle at top right,rgba(59,130,246,0.1),transparent 70%)' }} />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-green-500/20 text-green-400 uppercase tracking-wider">
                ✦ Active
              </span>
              <h3 className="text-xl font-black text-white mt-2">{subscription.plan_name}</h3>
              <p className="text-xs text-gray-600 mt-0.5">Premium subscription</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-600 mb-1">Expires in</p>
              <p className={`text-3xl font-black ${daysLeft<=7?'text-amber-400':'text-white'}`}>
                {daysLeft}<span className="text-sm font-normal text-gray-600 ml-1">days</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              Until {new Date(subscription.end_date).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
            </div>
            <motion.button whileTap={{ scale:0.96 }} onClick={() => navigate('/subscription')}
              className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          {daysLeft<=7 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="mt-3 p-3 rounded-xl flex items-center gap-2"
              style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400">Expiring soon — renew to keep signals flowing</p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}
          onClick={() => navigate('/subscription')}
          whileTap={{ scale:0.99 }}
          className="rounded-2xl p-6 text-center cursor-pointer relative overflow-hidden"
          style={{ background:'rgba(37,99,235,0.07)', border:'1px solid rgba(59,130,246,0.2)' }}
        >
          <motion.div
            animate={{ scale:[1,1.2,1], opacity:[0.3,0.6,0.3] }}
            transition={{ duration:3, repeat:Infinity }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background:'radial-gradient(ellipse at center,rgba(59,130,246,0.08),transparent 70%)' }}
          />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
            style={{ background:'rgba(59,130,246,0.15)', boxShadow:'0 0 24px rgba(59,130,246,0.2)' }}>
            <Zap className="w-7 h-7 text-blue-400 fill-blue-400" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Unlock Premium Signals</h3>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed max-w-xs mx-auto">
            Professional trading signals powered by institutional-grade analysis
          </p>
          <div className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
            View Plans <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      {stats && subscription && (
        <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
          <StatCard index={0} icon={Target}   label="Win Rate"     value={`${stats.winRate}%`}       color="green" bar barValue={stats.winRate} />
          <StatCard index={1} icon={Activity} label="Signals"      value={stats.totalSignals}         color="blue"  sub="Last 7 days" />
          <StatCard index={2} icon={TrendingUp} label="Avg Win"    value={`+${stats.avgWin}%`}        color="cyan"  sub="Per winning trade" />
          <StatCard index={3} icon={Award}    label="Profit Factor" value={stats.profitFactor}        color="amber" sub="Risk / reward" />
        </motion.div>
      )}

      {/* Recent Signals */}
      {subscription && recentSignals.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-white">Recent Signals</h2>
              <p className="text-[10px] text-gray-600 mt-0.5">Latest opportunities</p>
            </div>
            <motion.button whileTap={{ scale:0.95 }} onClick={() => navigate('/signals')}
              className="flex items-center gap-1 text-xs font-bold text-blue-400">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="space-y-2">
            {recentSignals.map((signal, i) => (
              <motion.div
                key={signal.id}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.06 }}
                whileHover={{ x:3 }} whileTap={{ scale:0.99 }}
                className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
              >
                <motion.div
                  animate={{ opacity:[1,0.5,1] }} transition={{ duration:1.5, repeat:Infinity }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: signal.direction==='BUY' ? '#34d399' : '#f87171',
                    boxShadow: `0 0 6px ${signal.direction==='BUY'?'rgba(52,211,153,0.8)':'rgba(248,113,113,0.8)'}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white font-mono truncate">{signal.symbol || signal.pair || 'BTC/USDT'}</p>
                  <p className="text-[10px] text-gray-600">{signal.market || 'Crypto'}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black"
                  style={{
                    background: signal.direction==='BUY' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color:      signal.direction==='BUY' ? '#34d399' : '#f87171',
                  }}
                >
                  {signal.direction || 'BUY'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {[
          { label:'Live Signals', sub:'Active trades', icon:Activity, a:'#3b82f6', b:'#06b6d4', path:'/signals' },
          { label:'Markets',      sub:'Prices & trends', icon:TrendingUp, a:'#8b5cf6', b:'#3b82f6', path:'/markets' },
        ].map(({ label, sub, icon:Icon, a, b, path }) => (
          <motion.div
            key={path} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
            onClick={() => { telegram.haptic?.('light'); navigate(path); }}
            className="p-4 rounded-2xl cursor-pointer transition-all"
            style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background:`linear-gradient(135deg,${a}22,${b}11)` }}>
              <Icon className="w-5 h-5" style={{ color:a }} />
            </div>
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp}
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.04)' }}>
        <Zap className="w-4 h-4 text-blue-500/40 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-700 leading-relaxed">
          Signals are generated using advanced technical analysis. Always apply proper risk management.
          Never invest more than you can afford to lose.
        </p>
      </motion.div>
    </motion.div>
  );
}
