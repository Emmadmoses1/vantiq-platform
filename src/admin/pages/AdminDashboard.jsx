import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, ArrowRight, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import adminApi from '../lib/adminApi';

const revenueData = [
  { month: 'Jan', revenue: 12500, users: 80  },
  { month: 'Feb', revenue: 18900, users: 130 },
  { month: 'Mar', revenue: 24300, users: 190 },
  { month: 'Apr', revenue: 31200, users: 240 },
  { month: 'May', revenue: 28900, users: 210 },
  { month: 'Jun', revenue: 42100, users: 310 },
];

const recentUsers = [
  { id: 1, name: 'John Doe',      email: 'john@example.com',  plan: 'Pro',     status: 'Active', joined: 'Jan 15, 2024' },
  { id: 2, name: 'Jane Smith',    email: 'jane@example.com',  plan: 'Premium', status: 'Active', joined: 'Jan 14, 2024' },
  { id: 3, name: 'Mike Johnson',  email: 'mike@example.com',  plan: 'Starter', status: 'Active', joined: 'Jan 13, 2024' },
  { id: 4, name: 'Sara Williams', email: 'sara@example.com',  plan: 'Pro',     status: 'Trial',  joined: 'Jan 12, 2024' },
  { id: 5, name: 'Alex Turner',   email: 'alex@example.com',  plan: 'Premium', status: 'Active', joined: 'Jan 11, 2024' },
];

const planStyle  = { Pro: ['rgba(59,130,246,0.15)','#60a5fa'], Premium: ['rgba(168,85,247,0.15)','#c084fc'], Starter: ['rgba(107,114,128,0.15)','#9ca3af'] };
const statStyle  = { Active: ['rgba(16,185,129,0.15)','#34d399'], Trial: ['rgba(245,158,11,0.15)','#fbbf24'], Banned: ['rgba(239,68,68,0.15)','#f87171'] };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-xs shadow-2xl" style={{ background: '#0f1320', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-gray-400 mb-2 font-semibold">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {p.dataKey === 'revenue' ? `$${p.value.toLocaleString()}` : `${p.value} users`}
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState('revenue');

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data.overview);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); loadDashboard(); };

  const userColumns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}
          >
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{row.name}</p>
            <p className="text-[10px] text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Plan',
      render: (row) => {
        const [bg, text] = planStyle[row.plan] || planStyle.Starter;
        return <span className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: bg, color: text }}>{row.plan}</span>;
      },
    },
    {
      header: 'Status',
      render: (row) => {
        const [bg, text] = statStyle[row.status] || statStyle.Active;
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg w-fit" style={{ background: bg, color: text }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: text }} />
            {row.status}
          </span>
        );
      },
    },
    { header: 'Joined', key: 'joined' },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#06080f' }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500"
          />
          <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs text-gray-600">
            Loading dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" style={{ background: '#06080f' }}>
      <Topbar title="Dashboard" subtitle="Platform overview" />

      <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-sm font-bold text-white">Good morning, Admin 👋</h2>
            <p className="text-xs text-gray-600 mt-0.5">Here's what's happening on VANTIQ today.</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
            Refresh
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard index={0} title="Total Users"         value={stats?.totalUsers || '1,234'}       change={12.5} trend="up"   icon={Users}        color="primary" subtitle="All time"    />
          <StatCard index={1} title="Active Subscribers"  value={stats?.activeSubscribers || '856'}  change={8.2}  trend="up"   icon={CheckCircle}  color="success" subtitle="This month"  />
          <StatCard index={2} title="Total Revenue"       value={`$${(stats?.paymentStats?.totalRevenue || 42150).toLocaleString()}`} change={15.3} trend="up" icon={DollarSign} color="cyan" subtitle="This month" />
          <StatCard index={3} title="Pending Signals"     value={stats?.pendingSignals || '3'}        icon={AlertCircle} color="warning" subtitle="Needs review" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white">Performance</h3>
                <p className="text-[10px] text-gray-600 mt-0.5">Last 6 months</p>
              </div>
              <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {['revenue', 'users'].map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key)}
                    className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all capitalize"
                    style={{
                      background: activeChart === key ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: activeChart === key ? '#60a5fa' : '#6b7280',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={activeChart === 'revenue' ? '#3b82f6' : '#10b981'} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={activeChart === 'revenue' ? '#3b82f6' : '#10b981'} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => activeChart === 'revenue' ? `$${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  stroke={activeChart === 'revenue' ? '#3b82f6' : '#10b981'}
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: activeChart === 'revenue' ? '#3b82f6' : '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Side stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            {[
              { label: 'Total Signals',      value: stats?.signalStats?.totalSignals || '89',  icon: Activity,   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  sub: 'All time'     },
              { label: 'Win Rate',           value: `${stats?.signalStats?.winRate || '68'}%`, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)',  sub: 'Last 30 days' },
              { label: 'Completed Payments', value: stats?.paymentStats?.confirmedPayments || '124', icon: DollarSign, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', sub: 'Confirmed'    },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex-1 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 cursor-default"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">{item.value}</p>
                    <p className="text-[10px] text-gray-500">{item.label}</p>
                    <p className="text-[9px] text-gray-700 mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="text-sm font-bold text-white">Recent Users</h3>
              <p className="text-[10px] text-gray-600 mt-0.5">Latest sign-ups on the platform</p>
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => window.location.href = '/admin/users'}
              className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="p-3">
            <Table columns={userColumns} data={recentUsers} />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
