import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import telegram from '../config/telegram';

const STATUS = {
  confirmed: { color:'#34d399', bg:'rgba(16,185,129,0.12)',  icon:CheckCircle,  label:'Confirmed' },
  pending:   { color:'#fbbf24', bg:'rgba(245,158,11,0.12)',  icon:Clock,        label:'Pending'   },
  detected:  { color:'#60a5fa', bg:'rgba(59,130,246,0.12)',  icon:Clock,        label:'Detected'  },
  failed:    { color:'#f87171', bg:'rgba(239,68,68,0.12)',   icon:XCircle,      label:'Failed'    },
  expired:   { color:'#6b7280', bg:'rgba(107,114,128,0.12)', icon:AlertCircle,  label:'Expired'   },
};

const EXPLORERS = {
  BTC: h => `https://blockchair.com/bitcoin/transaction/${h}`,
  ETH: h => `https://etherscan.io/tx/${h}`,
  USDT:h => `https://etherscan.io/tx/${h}`,
  BNB: h => `https://bscscan.com/tx/${h}`,
  LTC: h => `https://blockchair.com/litecoin/transaction/${h}`,
  TON: h => `https://tonscan.org/tx/${h}`,
};

export default function Wallet() {
  const [loading, setLoading]     = useState(true);
  const [payments, setPayments]   = useState([]);
  const [refreshing, setRefresh]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async (isRefresh=false) => {
    try {
      if(isRefresh) setRefresh(true); else setLoading(true);
      setPayments(await api.getPaymentHistory().catch(() => []));
    } finally { setLoading(false); setRefresh(false); }
  };

  const openExplorer = (hash, symbol) => {
    const fn = EXPLORERS[symbol] || (h => `https://blockchair.com/search?q=${h}`);
    telegram.openLink(fn(hash));
  };

  const totalSpent = payments
    .filter(p => p.status==='confirmed')
    .reduce((sum, p) => sum + parseFloat(p.usd_amount||0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <Loader size="lg" text="Loading wallet..." />
    </div>
  );

  return (
    <div className="p-4 pb-6 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Wallet</h1>
          <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{payments.length} transactions</p>
        </div>
        <motion.button whileTap={{ scale:0.9 }} onClick={() => load(true)}
          className="p-2 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <motion.div animate={{ rotate:refreshing?360:0 }} transition={{ duration:0.8, repeat:refreshing?Infinity:0, ease:'linear' }}>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </motion.div>
        </motion.button>
      </div>

      {/* Total spent */}
      {totalSpent > 0 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(8,145,178,0.06))', border:'1px solid rgba(59,130,246,0.15)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            style={{ background:'radial-gradient(circle at top right,rgba(59,130,246,0.1),transparent 70%)' }} />
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">Total Spent</p>
          <p className="text-3xl font-black text-white">${totalSpent.toFixed(2)}<span className="text-sm text-gray-500 ml-1">USD</span></p>
          <p className="text-[10px] text-gray-600 mt-1">{payments.filter(p=>p.status==='confirmed').length} confirmed payments</p>
        </motion.div>
      )}

      {/* Transactions */}
      <AnimatePresence>
        {payments.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-20">
            <motion.div
              animate={{ scale:[1,1.08,1] }} transition={{ duration:3, repeat:Infinity }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <WalletIcon className="w-9 h-9 text-gray-700" />
            </motion.div>
            <p className="text-sm font-bold text-gray-600">No transactions yet</p>
            <p className="text-[10px] text-gray-700 mt-1">Your payment history will appear here</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {payments.map((p, i) => {
              const cfg = STATUS[p.status] || STATUS.pending;
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background:'#0a0e1a', border:'1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Status bar */}
                  <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg,${cfg.color},transparent)` }} />

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-black text-white">{p.plan_name || 'Subscription'}</p>
                        <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                          {new Date(p.created_at).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background:cfg.bg }}>
                        <StatusIcon className="w-3 h-3" style={{ color:cfg.color }} />
                        <span className="text-[10px] font-black" style={{ color:cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { label:'USD Amount',  value:`$${p.usd_amount}` },
                        { label:'Crypto Paid', value:`${p.crypto_amount} ${p.crypto_symbol}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-xl"
                          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                          <p className="text-[10px] text-gray-600 mb-1">{label}</p>
                          <p className="text-sm font-black text-white font-mono">{value}</p>
                        </div>
                      ))}
                    </div>

                    {p.tx_hash && (
                      <div className="pt-3 border-t" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 font-mono truncate flex-1">{p.tx_hash}</p>
                          <motion.button
                            whileTap={{ scale:0.9 }}
                            onClick={() => { telegram.haptic?.('light'); openExplorer(p.tx_hash, p.crypto_symbol); }}
                            className="p-1.5 rounded-lg flex-shrink-0 transition-all"
                            style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)' }}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
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
      </AnimatePresence>
    </div>
  );
}
