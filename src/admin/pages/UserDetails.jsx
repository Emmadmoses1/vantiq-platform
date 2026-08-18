import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  CheckCircle,
  Ban,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import Table from '../components/Table';
import adminApi from '../lib/adminApi';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showActivateModal, setShowActivateModal] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      const data = await adminApi.getUserDetails(userId);
      setUser(data.user);
      setSubscriptions(data.subscriptions || []);
      setPayments(data.payments || []);
      setActivity(data.activity || []);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubscription = async (planId, months) => {
    try {
      await adminApi.activateSubscription(userId, planId, months);
      toast.success('Subscription activated successfully');
      setShowActivateModal(false);
      loadUserDetails();
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Failed to activate subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">User not found</div>
      </div>
    );
  }

  const paymentColumns = [
    { header: 'Order ID', render: (row) => <span className="font-mono text-xs">{row.order_id?.slice(0, 12)}...</span> },
    { header: 'Plan', key: 'plan_name' },
    { header: 'Amount', render: (row) => `$${row.usd_amount}` },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.status === 'confirmed'
            ? 'bg-green-500/20 text-green-400'
            : row.status === 'pending'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {row.status}
        </span>
      ),
    },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-dark-100 border-b border-white/10 px-6 py-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-white">User Details</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.first_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-400">@{user.username || 'user'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowActivateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Activate Subscription
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{user.email || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Telegram ID</p>
                <p className="text-white font-mono">{user.telegram_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Registered</p>
                <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Current Subscription</h3>
          {user.subscription_status === 'active' ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white">{user.current_plan?.toUpperCase()} Plan</p>
                <p className="text-sm text-gray-400 mt-1">
                  Expires: {new Date(user.subscription_end_date).toLocaleDateString()}
                </p>
              </div>
              <span className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-semibold">
                Active
              </span>
            </div>
          ) : (
            <p className="text-gray-400">No active subscription</p>
          )}
        </div>

        {/* Subscription History */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Subscription History</h3>
          {subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-dark-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-white">{sub.plan_name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No subscription history</p>
          )}
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Payment History</h3>
          <Table columns={paymentColumns} data={payments} />
        </div>

        {/* Activate Subscription Modal */}
        {showActivateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Activate Subscription</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Plan</label>
                  <select className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="starter">Starter - $50</option>
                    <option value="pro">Pro - $100</option>
                    <option value="premium">Premium - $200</option>
                    <option value="elite">Elite - $500</option>
                    <option value="vip">VIP - $1000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Duration (months)</label>
                  <select className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowActivateModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-200 hover:bg-dark-50 text-white font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleActivateSubscription('pro', 1)}
                    className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Activate
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

export default UserDetails;