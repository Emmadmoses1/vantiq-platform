import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';

const Analytics = () => {
  const [period, setPeriod] = useState('30d');

  // Sample data
  const revenueData = [
    { month: 'Jan', revenue: 12500, users: 45 },
    { month: 'Feb', revenue: 18900, users: 67 },
    { month: 'Mar', revenue: 24300, users: 89 },
    { month: 'Apr', revenue: 31200, users: 112 },
    { month: 'May', revenue: 28900, users: 98 },
    { month: 'Jun', revenue: 42100, users: 145 },
  ];

  const planDistribution = [
    { name: 'Starter', value: 45, color: '#3b82f6' },
    { name: 'Pro', value: 120, color: '#06b6d4' },
    { name: 'Premium', value: 67, color: '#8b5cf6' },
    { name: 'Elite', value: 34, color: '#f59e0b' },
    { name: 'VIP', value: 12, color: '#10b981' },
  ];

  const signalPerformance = [
    { market: 'Crypto', wins: 68, losses: 32 },
    { market: 'Forex', wins: 72, losses: 28 },
    { market: 'Gold', wins: 65, losses: 35 },
    { market: 'Indices', wins: 70, losses: 30 },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Analytics" subtitle="Platform insights and metrics" />

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100 text-gray-400 hover:bg-dark-50'
              }`}
            >
              {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : p === '90d' ? 'Last 90 Days' : 'Last Year'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value="$158,900"
            change={23.5}
            trend="up"
            icon={DollarSign}
            color="success"
          />
          <StatCard
            title="Active Users"
            value="523"
            change={12.3}
            trend="up"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Signals Generated"
            value="1,247"
            change={8.7}
            trend="up"
            icon={Activity}
            color="primary"
          />
          <StatCard
            title="Avg Win Rate"
            value="68.5%"
            change={2.1}
            trend="up"
            icon={TrendingUp}
            color="success"
          />
        </div>

        {/* Revenue & Users Chart */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue & User Growth</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f35',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Revenue ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="users"
                stroke="#06b6d4"
                strokeWidth={3}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Subscription Plans</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Signal Performance */}
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Signal Performance by Market</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={signalPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="market" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f35',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="wins" fill="#10b981" name="Wins" />
                <Bar dataKey="losses" fill="#ef4444" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm text-gray-400 mb-2">Conversion Rate</h4>
            <p className="text-3xl font-bold text-white mb-1">24.5%</p>
            <p className="text-sm text-green-400">+3.2% from last month</p>
          </div>

          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm text-gray-400 mb-2">Average Subscription Value</h4>
            <p className="text-3xl font-bold text-white mb-1">$304</p>
            <p className="text-sm text-green-400">+12% from last month</p>
          </div>

          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm text-gray-400 mb-2">Churn Rate</h4>
            <p className="text-3xl font-bold text-white mb-1">4.2%</p>
            <p className="text-sm text-green-400">-1.3% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;