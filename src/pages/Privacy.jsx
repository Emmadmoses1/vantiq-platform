import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, Eye, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const sections = [
  { icon: Database, title: 'Data We Collect', desc: 'We store your Telegram profile info (name, username), your trading preferences, and your subscription/payment history to run the app.' },
  { icon: Lock, title: 'How It\'s Protected', desc: 'Your data is secured with row-level access controls — only you can view or modify your own account information.' },
  { icon: Eye, title: 'What We Don\'t Do', desc: 'We never sell your data, and we don\'t share your Telegram info with third parties outside of what\'s needed to run VANTIQ.' },
];

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="p-4 pb-6 space-y-5">
      <motion.div variants={fadeUp} className="flex items-center gap-3 pt-1">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-white/[0.05] transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Privacy & Security</h1>
          <p className="text-xs text-gray-600">How we handle your data</p>
        </div>
      </motion.div>

      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div key={s.title} variants={fadeUp} className="rounded-2xl p-5 border border-white/[0.06] bg-[#0a0e1a]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white">{s.title}</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
          </motion.div>
        );
      })}

      <motion.div variants={fadeUp} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
        <Shield className="w-4 h-4 text-blue-500/50 flex-shrink-0" />
        <p className="text-xs text-gray-700 leading-relaxed">Questions about your data? Reach out via Help Center in your profile.</p>
      </motion.div>
    </motion.div>
  );
};

export default Privacy;
