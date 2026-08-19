import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Info, Star, Crown, Rocket, Shield, Diamond } from 'lucide-react';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import PaymentModal from '../components/subscription/PaymentModal';
import telegram from '../config/telegram';

const FALLBACK_PLANS = [
  { id:'1', plan_id:'starter', name:'Starter', base_price:50,  signal_limit:10,  popular:false, features:['Up to 10 signals per month','Basic market analysis','Email support','Crypto & Forex access'] },
  { id:'2', plan_id:'pro',     name:'Pro',     base_price:100, signal_limit:30,  popular:true,  features:['Up to 30 signals per month','Advanced technical analysis','Priority support','All markets access','Real-time notifications'] },
  { id:'3', plan_id:'premium', name:'Premium', base_price:200, signal_limit:-1,  popular:false, features:['Unlimited signals','Premium market insights','Dedicated support','All markets + commodities','Custom watchlists','Early signal access'] },
  { id:'4', plan_id:'elite',   name:'Elite',   base_price:500, signal_limit:-1,  popular:false, features:['Unlimited premium signals','Institutional-grade analysis','24/7 priority support','All markets access','Personal account manager','API access'] },
  { id:'5', plan_id:'vip',     name:'VIP',     base_price:1000,signal_limit:-1,  popular:false, features:['Unlimited VIP signals','Proprietary analysis models','Dedicated 24/7 concierge','All markets + pre-IPO','Custom signal requests','Private strategy sessions','Full API access'] },
];

const PERIODS = [
  { id:'monthly',    label:'Monthly',  months:1,  discount:0,  tag:null,         color:'#6b7280' },
  { id:'quarterly',  label:'3 Months', months:3,  discount:10, tag:'SAVE 10%',   color:'#3b82f6' },
  { id:'semiannual', label:'6 Months', months:6,  discount:15, tag:'SAVE 15%',   color:'#8b5cf6' },
  { id:'yearly',     label:'Yearly',   months:12, discount:25, tag:'BEST VALUE', color:'#10b981' },
];

const COLORS = {
  starter: { a:'#3b82f6', b:'#06b6d4', glow:'rgba(59,130,246,0.18)'  },
  pro:     { a:'#8b5cf6', b:'#3b82f6', glow:'rgba(139,92,246,0.18)'  },
  premium: { a:'#f59e0b', b:'#ef4444', glow:'rgba(245,158,11,0.18)'  },
  elite:   { a:'#10b981', b:'#06b6d4', glow:'rgba(16,185,129,0.18)'  },
  vip:     { a:'#ec4899', b:'#8b5cf6', glow:'rgba(236,72,153,0.18)'  },
};
const ICONS = { starter:Rocket, pro:Star, premium:Crown, elite:Shield, vip:Diamond };

const calcPrice = (base, periodId) => {
  const p = PERIODS.find(x => x.id === periodId);
  const sub = base * p.months;
  const disc = sub * (p.discount / 100);
  return { subtotal:sub, discount:disc, total:sub-disc, months:p.months, perMonth:(sub-disc)/p.months };
};

export default function Subscription() {
  const [loading, setLoading]       = useState(true);
  const [plans, setPlans]           = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [period, setPeriod]         = useState('monthly');
  const [selected, setSelected]     = useState(null);
  const [showPay, setShowPay]       = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [p, s] = await Promise.all([
        api.getPlans().catch(() => FALLBACK_PLANS),
        api.getUserSubscription().catch(() => null),
      ]);
      setPlans(p?.length ? p : FALLBACK_PLANS);
      setCurrentSub(s);
    } catch { setPlans(FALLBACK_PLANS); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{background:'#06080f'}}>
      <Loader size="lg" text="Loading plans..." />
    </div>
  );

  const activePeriod = PERIODS.find(p => p.id === period);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{background:'#06080f'}}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} className="text-center mb-6">
        <motion.div
          initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}}
          transition={{type:'spring',stiffness:220,delay:0.1}}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{background:'linear-gradient(135deg,#2563eb,#06b6d4)',boxShadow:'0 0 32px rgba(59,130,246,0.35)'}}
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-2xl font-black text-white tracking-tight">Choose Your Plan</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Pick a billing period, then select your plan</p>
      </motion.div>

      {/* Current Sub */}
      <AnimatePresence>
        {currentSub && (
          <motion.div
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="rounded-2xl p-4 flex items-center justify-between mb-5"
            style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)'}}
          >
            <div>
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">✦ Active Plan</p>
              <p className="font-bold text-white">{currentSub.plan_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Expires {new Date(currentSub.end_date).toLocaleDateString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" strokeWidth={3} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Period */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="mb-5">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Billing Period</p>
        <div className="grid grid-cols-2 gap-2">
          {PERIODS.map((p) => {
            const active = period === p.id;
            return (
              <motion.button
                key={p.id} whileTap={{scale:0.95}}
                onClick={() => { setPeriod(p.id); telegram.haptic?.('light'); }}
                className="relative p-3.5 rounded-xl text-left transition-all duration-200 overflow-hidden"
                style={{
                  background: active ? `rgba(${p.id==='yearly'?'16,185,129':p.id==='semiannual'?'139,92,246':p.id==='quarterly'?'59,130,246':'107,114,128'},0.12)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? p.color : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 4px 20px ${p.color}33` : 'none',
                }}
              >
                {active && (
                  <motion.div layoutId="periodBg" className="absolute inset-0 opacity-10 rounded-xl"
                    style={{background:`radial-gradient(circle at top left, ${p.color}, transparent)`}} />
                )}
                {p.tag && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-black"
                    style={{background:p.color,color:'#fff'}}>
                    {p.tag}
                  </span>
                )}
                <p className={`text-sm font-bold ${active?'text-white':'text-gray-500'}`}>{p.label}</p>
                {p.discount > 0
                  ? <p className="text-[10px] font-semibold mt-0.5" style={{color:p.color}}>Save {p.discount}%</p>
                  : <p className="text-[10px] text-gray-700 mt-0.5">Standard rate</p>
                }
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Plans */}
      <div className="mb-5">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Available Plans</p>
        <div className="space-y-3">
          {plans.map((plan, i) => {
            const pricing   = calcPrice(plan.base_price, period);
            const c         = COLORS[plan.plan_id] || COLORS.starter;
            const Icon      = ICONS[plan.plan_id] || Star;
            const isSel     = selected?.id === plan.id;
            const isCur     = currentSub?.plan_id === plan.plan_id;
            const features  = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features||'[]');

            return (
              <motion.div
                key={plan.id}
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                transition={{delay:0.15+i*0.06, ease:[0.22,1,0.36,1]}}
                onClick={() => { setSelected(plan); telegram.haptic?.('medium'); }}
                className="relative rounded-2xl p-4 cursor-pointer transition-all duration-250 overflow-hidden"
                style={{
                  background: isSel
                    ? `linear-gradient(135deg,${c.a}18,${c.b}10,#0a0d1400)`
                    : 'rgba(255,255,255,0.025)',
                  border:`1px solid ${isSel ? c.a : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isSel ? `0 8px 40px ${c.glow}` : 'none',
                  transform: isSel ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* Popular ribbon */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none">
                    <div className="absolute top-3 -right-5 w-24 py-0.5 text-center text-[8px] font-black text-white rotate-45"
                      style={{background:`linear-gradient(90deg,${c.a},${c.b})`}}>
                      POPULAR
                    </div>
                  </div>
                )}

                {/* Selected indicator */}
                <AnimatePresence>
                  {isSel && (
                    <motion.div
                      initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{background:c.a}}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3}/>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Background glow */}
                {isSel && (
                  <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                    style={{background:`radial-gradient(circle at top right,${c.a}20,transparent 70%)`}} />
                )}

                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{boxShadow: isSel ? `0 0 20px ${c.a}60` : '0 0 0 transparent'}}
                    transition={{duration:0.3}}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:`linear-gradient(135deg,${c.a},${c.b})`}}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-white">{plan.name}</span>
                      {isCur && <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-green-500/20 text-green-400">ACTIVE</span>}
                    </div>

                    {/* Price — updates live */}
                    <div className="flex items-baseline gap-1">
                      <motion.span
                        key={`${plan.id}-${period}`}
                        initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                        className="text-2xl font-black"
                        style={{background:`linear-gradient(135deg,${c.a},${c.b})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}
                      >
                        ${pricing.total % 1 === 0 ? pricing.total.toFixed(0) : pricing.total.toFixed(2)}
                      </motion.span>
                      <span className="text-xs text-gray-600">
                        /{activePeriod.months===1?'mo':`${activePeriod.months}mo`}
                      </span>
                    </div>

                    {activePeriod.months > 1 && (
                      <motion.p
                        key={`${plan.id}-${period}-sub`}
                        initial={{opacity:0}} animate={{opacity:1}}
                        className="text-[10px] mt-0.5"
                        style={{color:c.a}}
                      >
                        ${pricing.perMonth.toFixed(2)}/mo · {activePeriod.discount}% saved
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="mt-3 space-y-1.5 pl-1">
                  {features.slice(0,isSel?features.length:3).map((f,fi) => (
                    <motion.div
                      key={fi}
                      initial={isSel?{opacity:0,x:-8}:{}}
                      animate={{opacity:1,x:0}}
                      transition={{delay:fi*0.04}}
                      className="flex items-center gap-2"
                    >
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{background:`${c.a}22`}}>
                        <Check className="w-2 h-2" style={{color:c.a}} strokeWidth={3}/>
                      </div>
                      <p className="text-xs text-gray-400">{f}</p>
                    </motion.div>
                  ))}
                  {!isSel && features.length > 3 && (
                    <p className="text-[10px] text-gray-600 pl-5">+{features.length-3} more features</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <AnimatePresence>
        {selected && (() => {
          const pricing = calcPrice(selected.base_price, period);
          const c = COLORS[selected.plan_id] || COLORS.starter;
          return (
            <motion.div
              initial={{opacity:0,y:24,scale:0.97}}
              animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:24,scale:0.97}}
              transition={{type:'spring',stiffness:300,damping:28}}
              className="rounded-2xl overflow-hidden mb-5"
              style={{background:'#0d1117',border:'1px solid rgba(255,255,255,0.08)'}}
            >
              {/* Top accent */}
              <div className="h-0.5 w-full" style={{background:`linear-gradient(90deg,${c.a},${c.b})`}} />

              <div className="p-4">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Order Summary</p>

                <div className="space-y-2.5 mb-4">
                  {[
                    ['Plan', selected.name, 'text-white font-bold'],
                    ['Billing', `${activePeriod.label}${activePeriod.months>1?` (${activePeriod.months} months)`:''}`, 'text-white'],
                    ['Subtotal', `$${pricing.subtotal.toFixed(2)}`, 'text-white'],
                    ...(pricing.discount>0 ? [['Discount ('+activePeriod.discount+'%)', `-$${pricing.discount.toFixed(2)}`, 'text-green-400 font-semibold']] : []),
                  ].map(([label,val,cls])=>(
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-xs ${cls}`}>{val}</span>
                    </div>
                  ))}
                  <div className="pt-2.5 border-t border-white/8 flex justify-between items-center">
                    <span className="text-sm font-black text-white">Total</span>
                    <motion.span
                      key={`total-${period}`}
                      initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}}
                      className="text-2xl font-black"
                      style={{background:`linear-gradient(135deg,${c.a},${c.b})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}
                    >
                      ${pricing.total % 1===0 ? pricing.total.toFixed(0) : pricing.total.toFixed(2)} USD
                    </motion.span>
                  </div>
                </div>

                <motion.button
                  whileHover={{scale:1.01}} whileTap={{scale:0.97}}
                  onClick={() => { setShowPay(true); telegram.haptic?.('medium'); }}
                  className="w-full py-4 rounded-xl font-black text-white text-sm relative overflow-hidden"
                  style={{background:`linear-gradient(135deg,${c.a},${c.b})`,boxShadow:`0 8px 32px ${c.glow}`}}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)'}}
                    animate={{x:['-100%','200%']}}
                    transition={{duration:2,repeat:Infinity,repeatDelay:1.5,ease:'linear'}}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Pay ${pricing.total % 1===0 ? pricing.total.toFixed(0) : pricing.total.toFixed(2)} — {selected.name} {activePeriod.label}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Info */}
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}
      >
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px] text-gray-600 leading-relaxed">
          <p>• All plans include professional trading signals</p>
          <p>• Crypto payments processed securely on-chain</p>
          <p>• Subscriptions activate after payment confirmation</p>
          <p>• No auto-renewal — you stay in control</p>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <Modal isOpen={showPay} onClose={() => setShowPay(false)} title="Complete Payment" size="full">
        {selected && (
          <PaymentModal
            plan={selected}
            billingPeriod={period}
            onSuccess={() => { setShowPay(false); load(); }}
          />
        )}
      </Modal>
    </div>
  );
}
