import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';
import adminApi from '../lib/adminApi';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await adminApi.login(email, password);
      localStorage.setItem('admin_token', response.token);
      onLogin();
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#05080f' }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{ width: 600, height: 600, top: '-10%', left: '-10%', background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute rounded-full"
          style={{ width: 500, height: 500, bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute rounded-full"
          style={{ width: 400, height: 400, top: '40%', left: '40%', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, background: '#3b82f6', opacity: 0.3 }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Grid lines */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
            className="relative w-20 h-20 mx-auto mb-5"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 opacity-20"
                style={{ background: 'conic-gradient(transparent 0deg, #fff 360deg)' }}
              />
              <TrendingUp className="w-9 h-9 text-white relative z-10" strokeWidth={2.5} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl"
              style={{ boxShadow: '0 0 30px rgba(59,130,246,0.6)', pointerEvents: 'none' }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">
              VANTIQ
              <span
                className="ml-2 text-base font-semibold tracking-widest align-middle"
                style={{ background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                ADMIN
              </span>
            </h1>
            <p className="text-sm text-gray-500">Secure access to the control panel</p>
          </motion.div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(15,17,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)' }} />

          <form onSubmit={handleLogin} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="rounded-xl p-3.5 flex items-center gap-3"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email address</label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
                  style={{ color: focused === 'email' ? '#3b82f6' : '#4b5563' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  placeholder="admin@vantiq.io"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: '#0a0d14',
                    border: `1px solid ${focused === 'email' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
                  style={{ color: focused === 'password' ? '#3b82f6' : '#4b5563' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 text-sm text-white placeholder-gray-600 rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: '#0a0d14',
                    border: `1px solid ${focused === 'password' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)' }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Signing in...
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>

        {/* Admin credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 rounded-xl p-4"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <p className="text-xs text-center text-gray-500 mb-2 font-semibold uppercase tracking-wider">Default Admin Credentials</p>
          <div className="flex justify-center gap-6 text-xs">
            <span className="text-gray-400">📧 <span className="text-blue-400 font-mono">admin@vantiq.io</span></span>
            <span className="text-gray-400">🔑 <span className="text-blue-400 font-mono">Admin@123!</span></span>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-5">© 2025 VANTIQ. Restricted access.</p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
