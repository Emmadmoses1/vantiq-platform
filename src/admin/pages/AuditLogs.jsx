import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import adminApi from '../lib/adminApi';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    resource: 'all',
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      const params = {};
      if (filters.action !== 'all') params.action = filters.action;
      if (filters.resource !== 'all') params.resource = filters.resource;
      
      const data = await adminApi.getAuditLogs(params);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Timestamp', render: (row) => new Date(row.created_at || row.timestamp).toLocaleString() },
    { header: 'Action', render: (row) => (
      <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold">
        {row.action?.replace('_', ' ').toUpperCase()}
      </span>
    )},
    { header: 'Resource', key: 'resource', render: (row) => row.resource?.toUpperCase() },
    { header: 'Performed By', key: 'performedBy' },
    { header: 'IP Address', key: 'ipAddress', render: (row) => row.ipAddress || 'N/A' },
  ];

  const sampleData = [
    { id: 1, timestamp: new Date(), action: 'user_login', resource: 'auth', performedBy: 'admin@vantiq.io', ipAddress: '192.168.1.1' },
    { id: 2, timestamp: new Date(), action: 'signal_created', resource: 'signal', performedBy: 'admin@vantiq.io', ipAddress: '192.168.1.1' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Audit Logs" subtitle="System activity and changes" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Actions</option>
            <option value="user_login">User Login</option>
            <option value="signal_created">Signal Created</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="subscription_activated">Subscription Activated</option>
          </select>

          <select
            value={filters.resource}
            onChange={(e) => setFilters({...filters, resource: e.target.value})}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Resources</option>
            <option value="user">User</option>
            <option value="signal">Signal</option>
            <option value="payment">Payment</option>
            <option value="subscription">Subscription</option>
          </select>

          <button className="ml-auto px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Logs Table */}
        <Table columns={columns} data={sampleData} />
      </div>
    </div>
  );
};

export default AuditLogs;