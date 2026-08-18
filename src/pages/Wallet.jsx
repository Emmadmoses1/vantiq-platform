import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import telegram from '../config/telegram';

const statusCfg = {
  confirmed: { variant: 'success', icon: CheckCircle, color: 'text-emerald-400' },
  pending: { variant: 'warning', icon: Clock, color: 'text-amber-400' },
  detected: { variant: 'info', icon: Clock, color: 'text-blue-400' },
  failed: { variant: 'danger', icon: XCircle, color: 'text-red-400' },
  expired: { variant: 'default', icon: AlertCircle, color: 'text-gray-500' },
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setPayments(await api.getPaymentHistory().catch(() => [])); }
    finally { setLoading(false); }
  };

  const openExplorer = (hash, symbol) => {
    const urls = { BTC: `https://blockchair.com/bitcoin/transaction/${hash}`, ETH: `https://etherscan.io/tx/${hash}`, USDT: `https://etherscan.io/tx/${hash}`, BNB: `https://bscscan.com/tx/${hash}` };
    const url = urls[symbol] || `https://blockchair.com/search?q=${hash}`;
    telegram.openLink(url);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader size="lg" text="Loading wallet..." /></div>;

  return (
    <div className="p-4 pb-6 space-y-4">
      <div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1">History</p>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-xs text-gray-600 mt-0.5 font-mono">{payments.length} transactions</p>
      </div>

      {payments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-7 h-7 text-gray-700" />
          </div>
          <p className="text-sm text-gray-600">No transactions yet</p>
          <p className="text-xs text-gray-700 mt-1">Your payment history will appear here</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => {
            const cfg = statusCfg[p.status] || statusCfg.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={p.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/[0.06] bg-[#0a0e1a] overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-white">{p.plan_name || 'Subscription'}</p>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <Badge variant={cfg.variant}>{p.status.toUpperCase()}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[10px] text-gray-600 mb-1">USD Amount</p>
                      <p className="text-base font-bold text-white font-mono">${p.usd_amount}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[10px] text-gray-600 mb-1">Crypto Paid</p>
                      <p className="text-base font-bold text-white font-mono">{p.crypto_amount} {p.crypto_symbol}</p>
                    </div>
                  </div>
                  {p.tx_hash && (
                    <div className="pt-3 border-t border-white/[0.04]">
                      <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 font-mono truncate flex-1">{p.tx_hash}</p>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { telegram.haptic('light'); openExplorer(p.tx_hash, p.crypto_symbol); }}
                          className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors flex-shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Wallet;
