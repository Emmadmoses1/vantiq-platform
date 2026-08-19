import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, AlertCircle, Clock, ArrowRight, RefreshCw, Zap, ChevronLeft, Send } from 'lucide-react';
import QRCode from 'qrcode.react';
import api from '../../lib/api';
import Loader from '../ui/Loader';
import telegram from '../../config/telegram';

const CRYPTOS = [
  { key:'usdt_bep20', name:'Tether',    symbol:'USDT', network:'BSC', networkName:'BEP-20', color:'#26a17b', bg:'rgba(38,161,123,0.12)', emoji:'₮' },
  { key:'usdt_erc20', name:'Tether',    symbol:'USDT', network:'ETH', networkName:'ERC-20', color:'#26a17b', bg:'rgba(38,161,123,0.12)', emoji:'₮' },
  { key:'usdt_trc20', name:'Tether',    symbol:'USDT', network:'TRX', networkName:'TRC-20', color:'#26a17b', bg:'rgba(38,161,123,0.12)', emoji:'₮' },
  { key:'bnb',        name:'BNB',       symbol:'BNB',  network:'BSC', networkName:'BEP-20', color:'#f3ba2f', bg:'rgba(243,186,47,0.12)', emoji:'🔶' },
  { key:'eth',        name:'Ethereum',  symbol:'ETH',  network:'ETH', networkName:'ERC-20', color:'#627eea', bg:'rgba(98,126,234,0.12)', emoji:'Ξ'  },
  { key:'btc',        name:'Bitcoin',   symbol:'BTC',  network:'BTC', networkName:'Bitcoin',color:'#f7931a', bg:'rgba(247,147,26,0.12)', emoji:'₿'  },
  { key:'ltc',        name:'Litecoin',  symbol:'LTC',  network:'LTC', networkName:'Litecoin',color:'#bfbbbb',bg:'rgba(191,187,187,0.12)',emoji:'Ł'  },
  { key:'ton',        name:'Toncoin',   symbol:'TON',  network:'TON', networkName:'TON',    color:'#0098ea', bg:'rgba(0,152,234,0.12)', emoji:'💎' },
];

const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

const BILLING_LABELS = { monthly:'1 Month', quarterly:'3 Months', semiannual:'6 Months', yearly:'12 Months' };
const BILLING_MONTHS = { monthly:1, quarterly:3, semiannual:6, yearly:12 };
const BILLING_DISC   = { monthly:0, quarterly:10, semiannual:15, yearly:25 };

export default function PaymentModal({ plan, billingPeriod, onSuccess }) {
  const [step, setStep]           = useState('select-crypto');
  const [selCrypto, setSelCrypto] = useState(null);
  const [order, setOrder]         = useState(null);
  const [copied, setCopied]       = useState(null); // 'address'|'amount'
  const [txHash, setTxHash]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [timeLeft, setTimeLeft]   = useState(900);
  const [confirmSteps, setConfirmSteps] = useState([false,false,false]);
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  // Calc pricing
  const months  = BILLING_MONTHS[billingPeriod] || 1;
  const disc    = BILLING_DISC[billingPeriod]   || 0;
  const sub     = plan.base_price * months;
  const savings = sub * (disc/100);
  const total   = sub - savings;

  useEffect(() => () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (step === 'payment-details') {
      setTimeLeft(900);
      timerRef.current = setInterval(() => {
        setTimeLeft(p => { if(p<=1){ clearInterval(timerRef.current); return 0; } return p-1; });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [step]);

  const handleSelectCrypto = async (crypto) => {
    try {
      setError('');
      setLoading(true);
      telegram.haptic?.('medium');
      const res = await api.createPaymentOrder(plan.plan_id, billingPeriod, crypto.symbol, crypto.network, null);
      setSelCrypto(crypto);
      setOrder(res.paymentOrder);
      setStep('payment-details');
    } catch(e) {
      setError(e?.response?.data?.message || 'Failed to create payment order. Please try again.');
    } finally { setLoading(false); }
  };

  const copyTo = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      telegram.haptic?.('light');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleSubmitHash = async () => {
    const hash = txHash.trim();
    if (!hash) { setError('Please paste your transaction hash'); return; }
    if (hash.length < 20) { setError('Transaction hash looks too short — please check and retry'); return; }
    try {
      setError('');
      setLoading(true);
      telegram.haptic?.('medium');
      await api.submitTransaction(order.orderId, hash);
      setStep('confirming');
      startPolling();
      // Animate confirm steps
      setTimeout(() => setConfirmSteps([true,false,false]), 500);
      setTimeout(() => setConfirmSteps([true,true,false]), 3000);
    } catch(e) {
      setError(e?.response?.data?.message || 'Failed to submit transaction hash. Please check and retry.');
    } finally { setLoading(false); }
  };

  const startPolling = () => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.getPaymentStatus(order.orderId);
        const status = res?.payment?.status;
        if (status === 'confirmed') {
          clearInterval(pollRef.current);
          setConfirmSteps([true,true,true]);
          telegram.haptic?.('success');
          setTimeout(() => setStep('success'), 1000);
          setTimeout(() => onSuccess(), 3000);
        } else if (status === 'failed') {
          clearInterval(pollRef.current);
          setError('Payment verification failed. Please contact support.');
          setStep('payment-details');
        }
      } catch {}
      if (attempts >= 72) clearInterval(pollRef.current); // 6 min max
    }, 5000);
  };

  const urgentTime = timeLeft < 120;

  return (
    <div className="pb-6">
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Select Crypto ── */}
        {step === 'select-crypto' && (
          <motion.div key="s1"
            initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
            transition={{duration:0.25,ease:[0.22,1,0.36,1]}}
          >
            {/* Order recap */}
            <div className="rounded-2xl p-4 mb-4" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">You're paying</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">${total % 1===0 ? total.toFixed(0) : total.toFixed(2)}</span>
                <span className="text-sm text-gray-500">USD</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {plan.name} · {BILLING_LABELS[billingPeriod]}
                {disc>0 && <span className="text-green-500 ml-2">· {disc}% off</span>}
              </p>
            </div>

            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Select Cryptocurrency</p>

            <AnimatePresence>
              {error && (
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="rounded-xl p-3 flex items-center gap-2 mb-3"
                  style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)'}}>
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0"/>
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex justify-center py-12"><Loader size="md"/></div>
            ) : (
              <div className="space-y-2">
                {CRYPTOS.map((c,i) => (
                  <motion.button
                    key={c.key}
                    initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.04,ease:[0.22,1,0.36,1]}}
                    whileTap={{scale:0.97}}
                    onClick={() => handleSelectCrypto(c)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left"
                    style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{background:c.bg}}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{c.name}</p>
                      <p className="text-[10px] text-gray-500">{c.symbol} · {c.networkName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600"/>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Payment Details ── */}
        {step === 'payment-details' && order && (
          <motion.div key="s2"
            initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
            transition={{duration:0.25,ease:[0.22,1,0.36,1]}}
            className="space-y-3"
          >
            {/* Back + Timer */}
            <div className="flex items-center justify-between mb-1">
              <button onClick={() => setStep('select-crypto')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4"/> Back
              </button>
              <motion.div
                animate={{color: urgentTime ? ['#f59e0b','#ef4444','#f59e0b'] : '#f59e0b'}}
                transition={{duration:1,repeat:urgentTime?Infinity:0}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{background: urgentTime?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.1)',border:`1px solid ${urgentTime?'rgba(239,68,68,0.3)':'rgba(245,158,11,0.2)'}`}}
              >
                <Clock className="w-3.5 h-3.5"/>
                <span className="text-xs font-black font-mono">{fmt(timeLeft)}</span>
              </motion.div>
            </div>

            {/* Amount card */}
            <div className="rounded-2xl p-4" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Payment Details</p>
              <div className="space-y-2.5">
                {[
                  ['USD Amount',  `$${order.usdAmount}`,                                       'text-white font-bold'],
                  [`${selCrypto.symbol} Amount`, `${order.cryptoAmount} ${selCrypto.symbol}`, 'text-white font-bold'],
                  ['Network',     selCrypto.networkName,                                        'text-blue-400 font-semibold'],
                  ['Rate',        `1 ${selCrypto.symbol} = $${Number(order.exchangeRate).toLocaleString()}`, 'text-gray-300'],
                ].map(([l,v,cls]) => (
                  <div key={l} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{l}</span>
                    <span className={`text-xs ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy amount shortcut */}
            <motion.button
              whileTap={{scale:0.97}}
              onClick={() => copyTo(`${order.cryptoAmount}`, 'amount')}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
              style={{background:'rgba(59,130,246,0.08)',border:`1px solid ${copied==='amount'?'rgba(16,185,129,0.5)':'rgba(59,130,246,0.2)'}`}}
            >
              <div>
                <p className="text-[10px] text-gray-500 text-left">Exact amount to send</p>
                <p className="text-sm font-black text-white font-mono">{order.cryptoAmount} {selCrypto.symbol}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold"
                style={{color: copied==='amount'?'#10b981':'#3b82f6'}}>
                {copied==='amount' ? <><Check className="w-3.5 h-3.5"/>Copied!</> : <><Copy className="w-3.5 h-3.5"/>Copy</>}
              </div>
            </motion.button>

            {/* QR Code */}
            <div className="rounded-2xl p-4 flex flex-col items-center gap-3"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest self-start">Scan to Pay</p>
              <div className="bg-white p-3 rounded-xl">
                <QRCode value={order.paymentAddress} size={160} level="H" includeMargin={false}/>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl p-4 space-y-3"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Payment Address</p>
                <span className="px-2 py-0.5 rounded text-[9px] font-black"
                  style={{background:selCrypto.bg,color:selCrypto.color}}>
                  {selCrypto.networkName}
                </span>
              </div>
              <div className="rounded-xl p-3 break-all" style={{background:'rgba(0,0,0,0.3)'}}>
                <p className="text-xs text-gray-300 font-mono leading-relaxed">{order.paymentAddress}</p>
              </div>
              <motion.button
                whileTap={{scale:0.97}}
                onClick={() => copyTo(order.paymentAddress,'address')}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: copied==='address'?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.05)',
                  border:`1px solid ${copied==='address'?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.1)'}`,
                  color: copied==='address'?'#10b981':'#fff',
                }}
              >
                {copied==='address'
                  ? <><Check className="w-4 h-4"/>Address Copied!</>
                  : <><Copy className="w-4 h-4"/>Copy Address</>}
              </motion.button>
            </div>

            {/* Warning */}
            <div className="rounded-2xl p-4 space-y-1.5"
              style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)'}}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-400"/>
                <p className="text-xs font-black text-yellow-400">Important</p>
              </div>
              {[
                `Send ONLY ${selCrypto.symbol} on ${selCrypto.networkName} network`,
                `Send exactly ${order.cryptoAmount} ${selCrypto.symbol}`,
                'Wrong network = permanently lost funds',
                'Wait for 1–12 confirmations depending on network',
              ].map((w,i) => (
                <p key={i} className="text-[11px] text-yellow-200/60 pl-1">• {w}</p>
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)'}}>
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0"/>
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TX Hash submission */}
            <div className="rounded-2xl p-4 space-y-3"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <div>
                <p className="text-xs font-black text-white mb-0.5">Transaction Hash</p>
                <p className="text-[10px] text-gray-600">Paste your TX hash for instant verification</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={txHash}
                  onChange={e => { setTxHash(e.target.value); setError(''); }}
                  placeholder="0x... or txid..."
                  className="w-full px-4 py-3 pr-10 text-xs text-white placeholder-gray-600 rounded-xl outline-none transition-all font-mono"
                  style={{
                    background:'#0a0d14',
                    border:`1px solid ${txHash.length>20?'rgba(16,185,129,0.4)':txHash.length>0?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,
                    boxShadow: txHash.length>0?'0 0 0 3px rgba(59,130,246,0.08)':'none',
                  }}
                />
                {txHash.length>20 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400"/>
                )}
              </div>

              <motion.button
                whileTap={{scale:0.97}}
                onClick={handleSubmitHash}
                disabled={loading || !txHash.trim()}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 relative overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{background:'linear-gradient(135deg,#2563eb,#06b6d4)'}}
              >
                {!loading && (
                  <motion.div className="absolute inset-0"
                    style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)'}}
                    animate={{x:['-100%','200%']}} transition={{duration:2,repeat:Infinity,repeatDelay:1}}/>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {loading
                    ? <><motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:'linear'}}
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"/>Submitting...</>
                    : <><Send className="w-4 h-4"/>Submit & Verify Payment</>}
                </span>
              </motion.button>

              <p className="text-[10px] text-center text-gray-700">
                Or skip — we'll auto-detect your payment within a few minutes
              </p>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Confirming ── */}
        {step === 'confirming' && (
          <motion.div key="s3"
            initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}}
            className="py-8 text-center space-y-6"
          >
            <div className="relative w-20 h-20 mx-auto">
              <motion.div
                animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:'linear'}}
                className="w-20 h-20 rounded-full border-2 border-blue-500/20 border-t-blue-500 absolute inset-0"
              />
              <div className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{background:'rgba(37,99,235,0.1)'}}>
                <RefreshCw className="w-7 h-7 text-blue-400"/>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white mb-1">Verifying Payment</h3>
              <p className="text-sm text-gray-500">Checking blockchain confirmations...</p>
            </div>

            <div className="rounded-2xl p-4 space-y-3 max-w-xs mx-auto"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              {[
                ['Transaction submitted',      confirmSteps[0]],
                ['Waiting for confirmations',  confirmSteps[1]],
                ['Activating subscription',    confirmSteps[2]],
              ].map(([label,done],i) => (
                <motion.div
                  key={label}
                  animate={{opacity: i===0||confirmSteps[i-1]?1:0.3}}
                  className="flex items-center gap-3"
                >
                  {done
                    ? <motion.div initial={{scale:0}} animate={{scale:1}}
                        className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" strokeWidth={3}/>
                      </motion.div>
                    : <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1.2,repeat:Infinity}}
                        className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0"/>
                  }
                  <span className={`text-xs ${done?'text-white font-semibold':'text-gray-500'}`}>{label}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-[10px] text-gray-700">This may take 1–5 minutes depending on network</p>
          </motion.div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 'success' && (
          <motion.div key="s4"
            initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="py-8 text-center space-y-5"
          >
            <motion.div
              initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}}
              transition={{type:'spring',stiffness:200,damping:15}}
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center relative"
              style={{background:'linear-gradient(135deg,#10b981,#06b6d4)',boxShadow:'0 0 40px rgba(16,185,129,0.5)'}}
            >
              <Check className="w-9 h-9 text-white" strokeWidth={3}/>
              <motion.div
                animate={{scale:[1,1.5,1],opacity:[0.5,0,0.5]}}
                transition={{duration:2,repeat:Infinity}}
                className="absolute inset-0 rounded-full"
                style={{border:'2px solid rgba(16,185,129,0.5)'}}
              />
            </motion.div>

            <div>
              <motion.h3 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
                className="text-2xl font-black text-white mb-1">
                Payment Confirmed! 🎉
              </motion.h3>
              <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
                className="text-sm text-gray-500">
                Your subscription is now active
              </motion.p>
            </div>

            <motion.div
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              className="rounded-2xl p-4 space-y-2.5 max-w-xs mx-auto"
              style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)'}}
            >
              {[
                ['Plan',        plan.name],
                ['Amount Paid', `$${order?.usdAmount}`],
                ['Status',      '✅ Active'],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-gray-500">{l}</span>
                  <span className="text-white font-bold">{v}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
              className="flex items-center justify-center gap-2 text-sm text-green-400"
            >
              <Zap className="w-4 h-4"/>
              <span>You now have access to premium signals!</span>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
