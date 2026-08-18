import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, Download } from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import adminApi from '../lib/adminApi';

const Users = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  const loadUsers = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await adminApi.getUsers(params);
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold">{row.first_name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <p className="font-semibold text-white">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-gray-400">@{row.username || 'user'}</p>
          </div>
        </div>
      ),
    },
    { header: 'Email', key: 'email', render: (row) => row.email || 'Not set' },
    {
      header: 'Plan',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.current_plan
            ? 'bg-primary-500/20 text-primary-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {row.current_plan?.toUpperCase() || 'None'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.subscription_status === 'active'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {row.subscription_status || 'None'}
        </span>
      ),
    },
    {
      header: 'Joined',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Users" subtitle={`${users.length} total users`} />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="none">No Subscription</option>
          </select>

          <button className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          data={filteredUsers}
          onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
        />
      </div>
    </div>
  );
};

export default Users;