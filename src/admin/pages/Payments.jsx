import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import adminApi from '../lib/adminApi';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await adminApi.getPayments(params);
      setPayments(data.payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Order ID', render: (row) => <span className="font-mono text-xs">{row.order_id.slice(0, 8)}...</span> },
    { header: 'User', render: (row) => row.user_id.slice(0, 8) },
    { header: 'Plan', key: 'plan_name' },
    {
      header: 'Amount',
      render: (row) => (
        <div>
          <p className="font-bold text-white">${row.usd_amount}</p>
          <p className="text-xs text-gray-400">{row.crypto_amount} {row.crypto_symbol}</p>
        </div>
      ),
    },
    {
      header: 'Network',
      render: (row) => (
        <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
          {row.network}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const statusConfig = {
          confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
          pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
          failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
        };
        const config = statusConfig[row.status] || statusConfig.pending;
        const Icon = config.icon;

        return (
          <span className={`px-3 py-1 rounded-full ${config.bg} ${config.text} text-xs font-semibold flex items-center gap-1 w-fit`}>
            <Icon className="w-3 h-3" />
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Date',
      render: (row) => new Date(row.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Payments" subtitle={`${payments.length} total payments`} />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$42,150</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Confirmed</p>
                <p className="text-2xl font-bold text-white">124</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Payments</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Payments Table */}
        <Table columns={columns} data={payments} />
      </div>
    </div>
  );
};

export default Payments;