import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Target, Calendar, ArrowRight, Zap, Award, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } };

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue', bar, barValue }) => {
  const colors = {
    blue: { icon: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'from-blue-500 to-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
    green: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'from-emerald-500 to-green-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
    cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', bar: 'from-cyan-500 to-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]' },
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'from-amber-500 to-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
  };
  const c = colors[color];
  return (
    <motion.div variants={fadeUp} className={`rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a] ${c.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className={`text-2xl font-bold stat-number ${color === 'green' ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      {bar && (
        <div className="mt-3 h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${barValue}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className={`h-full bg-gradient-to-r ${c.bar} rounded-full`} />
        </div>
      )}
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl p-4 border border-white/[0.06] bg-[#0a0e1a] space-y-3">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton h-7 w-16 rounded" />
    <div className="skeleton h-2 w-full rounded" />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [recentSignals, setRecentSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setOffline(false);
      const [profileData, subData, signalsData, statsData] = await Promise.all([
        api.getProfile().catch(() => ({ first_name: 'Trader' })),
        api.getUserSubscription().catch(() => null),
        api.getActiveSignals().catch(() => []),
        api.getPerformanceStats(7).catch(() => null),
      ]);
      setUser(profileData);
      setSubscription(subData);
      setRecentSignals((signalsData || []).slice(0, 3));
      setStats(statsData);
    } catch (e) {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const daysLeft = subscription?.end_date ? Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000) : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="p-4 space-y-4">
      <div className="skeleton h-8 w-48 rounded-lg mb-6" />
      <div className="skeleton h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="p-4 pb-6 space-y-5">

      {/* Offline banner */}
      {offline && (
        <motion.div variants={fadeUp} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <WifiOff className="w-4 h-4 flex-shrink-0" /> Running in offline mode — connect Supabase to load live data
        </motion.div>
      )}

      {/* Greeting */}
      <motion.div variants={fadeUp} className="pt-1">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-1 font-semibold">{greeting}</p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {user?.first_name || 'Trader'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">↗</span>
        </h1>
        <p className="text-sm text-gray-600 mt-0.5 font-mono">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Subscription card */}
      {subscription ? (
        <motion.div variants={fadeUp} className="gradient-border p-px">
          <div className="bg-[#0a0e1a] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="success">Active</Badge>
                <h3 className="text-xl font-bold text-white mt-2">{subscription.plan_name || 'Premium'}</h3>
                <p className="text-xs text-gray-600 mt-0.5">Active subscription</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Expires in</p>
                <p className={`text-3xl font-bold stat-number ${daysLeft <= 7 ? 'text-amber-400' : 'text-white'}`}>{daysLeft}<span className="text-base font-normal text-gray-600 ml-1">days</span></p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                Until {new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/subscription')} icon={ChevronRight} iconPosition="right">Manage</Button>
            </div>
            {daysLeft <= 7 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <p className="text-xs text-amber-400 flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Subscription expiring soon — renew to keep signals flowing</p>
              </motion.div>
            )}
            {/* Animated shine */}
            <motion.div animate={{ x: ['-120%', '220%'] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none skew-x-12" />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} onClick={() => navigate('/subscription')}
          className="rounded-2xl p-6 border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.07] to-cyan-500/[0.04] cursor-pointer text-center"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Zap className="w-6 h-6 text-blue-400 fill-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Unlock Premium Signals</h3>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">Professional trading signals powered by advanced technical analysis</p>
          <Button variant="primary" icon={ArrowRight} iconPosition="right" fullWidth>View Plans</Button>
        </motion.div>
      )}

      {/* Stats grid */}
      {stats && subscription && (
        <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
          <StatCard icon={Target} label="Win Rate" value={`${stats.winRate}%`} color="green" bar barValue={stats.winRate} />
          <StatCard icon={Activity} label="Signals" value={stats.totalSignals} sub="Last 7 days" color="blue" />
          <StatCard icon={TrendingUp} label="Avg Win" value={`+${stats.avgWin}%`} sub="Per winning trade" color="cyan" />
          <StatCard icon={Award} label="Profit Factor" value={stats.profitFactor} sub="Risk / reward" color="amber" />
        </motion.div>
      )}

      {/* Recent Signals */}
      {subscription && recentSignals.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white">Recent Signals</h2>
              <p className="text-xs text-gray-600">Latest trading opportunities</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/signals')} icon={ArrowRight} iconPosition="right">All</Button>
          </div>
          <div className="space-y-2">
            {recentSignals.map((signal, i) => (
              <motion.div key={signal.id} variants={fadeUp}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-[#0a0e1a] hover:border-white/[0.1] transition-all cursor-pointer"
                whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${signal.direction === 'BUY' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white font-mono truncate">{signal.pair || 'BTC/USDT'}</p>
                  <p className="text-xs text-gray-600">{signal.market || 'Crypto'}</p>
                </div>
                <div className="text-right">
                  <Badge variant={signal.direction === 'BUY' ? 'success' : 'danger'}>{signal.direction || 'BUY'}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {[
          { label: 'Live Signals', sub: 'View active trades', icon: Activity, color: 'text-blue-400', glow: 'rgba(59,130,246,0.12)', path: '/signals' },
          { label: 'Markets', sub: 'Price & trends', icon: TrendingUp, color: 'text-cyan-400', glow: 'rgba(6,182,212,0.12)', path: '/markets' },
        ].map(({ label, sub, icon: Icon, color, glow, path }) => (
          <motion.div key={path} onClick={() => navigate(path)} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            className="p-4 rounded-2xl border border-white/[0.06] bg-[#0a0e1a] cursor-pointer hover:border-white/[0.12] transition-all"
            style={{ boxShadow: `0 0 20px ${glow}` }}>
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
        <Zap className="w-4 h-4 text-blue-500/50 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 leading-relaxed">Signals are generated using advanced technical analysis. Always apply proper risk management — never invest more than you can afford to lose.</p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
