import React, { useState } from 'react';
import { Plus, Send, Trash2, Eye } from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetPlans: [],
  });

  const handleSend = () => {
    toast.success('Announcement sent!');
    setShowCreateModal(false);
  };

  const columns = [
    { header: 'Title', key: 'title', render: (row) => <span className="font-bold text-white">{row.title}</span> },
    { header: 'Message', render: (row) => <span className="text-gray-300">{row.message.slice(0, 50)}...</span> },
    { header: 'Recipients', render: (row) => row.targetPlans.length > 0 ? row.targetPlans.join(', ') : 'All Users' },
    { header: 'Sent', render: (row) => new Date(row.sentAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const sampleData = [
    { id: 1, title: 'Platform Update', message: 'We have released new features...', targetPlans: [], sentAt: '2024-01-15' },
    { id: 2, title: 'New Signals Available', message: 'Check out the latest premium signals...', targetPlans: ['pro', 'premium'], sentAt: '2024-01-14' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Announcements" subtitle="Send notifications to users" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <div></div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </button>
        </div>

        <Table columns={columns} data={sampleData} />

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold text-white mb-4">Create Announcement</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Platform Update"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Enter your announcement message..."
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Target Audience</label>
                  <div className="space-y-2">
                    {['All Users', 'Starter', 'Pro', 'Premium', 'Elite', 'VIP'].map((plan) => (
                      <label key={plan} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-white">{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-200 hover:bg-dark-50 text-white font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Send Announcement
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

export default Announcements;