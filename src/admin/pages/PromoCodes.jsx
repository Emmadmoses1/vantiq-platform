import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import toast from 'react-hot-toast';

const PromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    expiresAt: '',
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Code copied!');
  };

  const handleCreate = () => {
    // Create promo code logic
    toast.success('Promo code created!');
    setShowCreateModal(false);
  };

  const columns = [
    { header: 'Code', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-white">{row.code}</span>
        <button
          onClick={() => handleCopy(row.code)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          {copied === row.code ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    )},
    { header: 'Discount', render: (row) => (
      <span className="text-white font-semibold">
        {row.discountType === 'percentage' ? `${row.discountValue}%` : `$${row.discountValue}`}
      </span>
    )},
    { header: 'Used', render: (row) => `${row.usedCount}/${row.maxUses || '∞'}` },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {row.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { header: 'Expires', render: (row) => row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : 'Never' },
    {
      header: 'Actions',
      render: (row) => (
        <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const sampleData = [
    { id: 1, code: 'WELCOME10', discountType: 'percentage', discountValue: 10, usedCount: 45, maxUses: 100, active: true, expiresAt: '2024-12-31' },
    { id: 2, code: 'VIP50', discountType: 'fixed', discountValue: 50, usedCount: 12, maxUses: null, active: true, expiresAt: null },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Promo Codes" subtitle="Manage discount codes" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <div></div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Promo Code
          </button>
        </div>

        <Table columns={columns} data={sampleData} />

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Create Promo Code</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Code</label>
                  <input
                    type="text"
                    placeholder="SUMMER2024"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Discount Type</label>
                  <select className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Discount Value</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Max Uses (optional)</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Expires At (optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-200 hover:bg-dark-50 text-white font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodes;