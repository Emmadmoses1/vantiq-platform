import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import adminApi from '../lib/adminApi';
import toast from 'react-hot-toast';

const SignalManagement = () => {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSignals();
  }, [statusFilter]);

  const loadSignals = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await adminApi.getAllSignals(params);
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Error loading signals:', error);
      toast.error('Failed to load signals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (signalId) => {
    if (!window.confirm('Are you sure you want to delete this signal?')) return;

    try {
      await adminApi.deleteSignal(signalId);
      setSignals(signals.filter(s => s.id !== signalId));
      toast.success('Signal deleted successfully');
    } catch (error) {
      console.error('Error deleting signal:', error);
      toast.error('Failed to delete signal');
    }
  };

  const columns = [
    {
      header: 'Signal',
      render: (row) => (
        <div>
          <p className="font-bold text-white">{row.symbol}</p>
          <p className="text-xs text-gray-400">{row.market?.toUpperCase()}</p>
        </div>
      ),
    },
    {
      header: 'Direction',
      render: (row) => (
        <span className={`flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${
          row.direction === 'BUY'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {row.direction === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {row.direction}
        </span>
      ),
    },
    {
      header: 'Entry',
      key: 'entry',
      render: (row) => <span className="font-mono">{row.entry}</span>,
    },
    {
      header: 'Status',
      render: (row) => {
        const statusColors = {
          draft: 'bg-gray-500/20 text-gray-400',
          pending_review: 'bg-yellow-500/20 text-yellow-400',
          approved: 'bg-blue-500/20 text-blue-400',
          published: 'bg-green-500/20 text-green-400',
          active: 'bg-green-500/20 text-green-400',
          closed: 'bg-gray-500/20 text-gray-400',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || statusColors.draft}`}>
            {row.status?.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Created',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/signals/${row.id}`)}
            className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/admin/signals/edit/${row.id}`)}
            className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Signal Management" subtitle={`${signals.length} total signals`} />

      <div className="p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Signals</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button
            onClick={() => navigate('/admin/signals/create')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Signal
          </button>
        </div>

        {/* Signals Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading signals...</div>
          </div>
        ) : (
          <Table columns={columns} data={signals} />
        )}
      </div>
    </div>
  );
};

export default SignalManagement;