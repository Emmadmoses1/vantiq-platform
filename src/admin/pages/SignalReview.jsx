import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import adminApi from '../lib/adminApi';

const SignalReview = () => {
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    loadPendingSignals();
  }, []);

  const loadPendingSignals = async () => {
    try {
      const data = await adminApi.getPendingSignals();
      setSignals(data.signals);
    } catch (error) {
      console.error('Error loading pending signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (signalId) => {
    try {
      await adminApi.approveSignal(signalId, true);
      setSignals(signals.filter(s => s.id !== signalId));
      setSelectedSignal(null);
    } catch (error) {
      console.error('Error approving signal:', error);
      alert('Failed to approve signal');
    }
  };

  const handleReject = async (signalId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await adminApi.rejectSignal(signalId, reason);
      setSignals(signals.filter(s => s.id !== signalId));
      setSelectedSignal(null);
    } catch (error) {
      console.error('Error rejecting signal:', error);
      alert('Failed to reject signal');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Topbar
        title="Signal Review"
        subtitle={`${signals.length} signal${signals.length !== 1 ? 's' : ''} awaiting review`}
      />

      <div className="p-6">
        {signals.length === 0 ? (
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No signals pending review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signal List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Pending Signals</h3>
              {signals.map((signal) => (
                <motion.div
                  key={signal.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedSignal(signal)}
                  className={`bg-dark-100 border rounded-2xl p-4 cursor-pointer transition-all ${
                    selectedSignal?.id === signal.id
                      ? 'border-primary-500 shadow-glow-md'
                      : 'border-white/10 hover:border-primary-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white">{signal.symbol}</h4>
                      <p className="text-sm text-gray-400">{signal.market.toUpperCase()}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                      signal.direction === 'BUY'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.direction === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-bold">{signal.direction}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-dark-200 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Entry</p>
                      <p className="font-bold text-white">{signal.entry}</p>
                    </div>
                    <div className="bg-dark-200 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Stop Loss</p>
                      <p className="font-bold text-red-400">{signal.stop_loss}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(signal.created_at).toLocaleString()}
                    </span>
                    <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 font-semibold">
                      {Math.round(signal.signal_strength * 100)}% Confidence
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Signal Details */}
            {selectedSignal && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-dark-100 border border-white/10 rounded-2xl p-6 sticky top-6"
              >
                <h3 className="text-xl font-bold text-white mb-6">Signal Details</h3>

                {/* Trading Levels */}
                <div className="space-y-4 mb-6">
                  <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary-400" />
                      <p className="text-sm text-gray-400">Entry Price</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedSignal.entry}</p>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-gray-400">Stop Loss</p>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{selectedSignal.stop_loss}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'TP1', value: selectedSignal.take_profit_1 },
                      { label: 'TP2', value: selectedSignal.take_profit_2 },
                      { label: 'TP3', value: selectedSignal.take_profit_3 },
                    ].map((tp, index) => (
                      <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">{tp.label}</p>
                        <p className="text-sm font-bold text-green-400">{tp.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Analysis */}
                {selectedSignal.analysis?.reasoning && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Market Analysis</h4>
                    <div className="space-y-2">
                      {selectedSignal.analysis.reasoning.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-primary-400">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleApprove(selectedSignal.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => handleReject(selectedSignal.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalReview;