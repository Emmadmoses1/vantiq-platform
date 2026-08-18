import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, TrendingUp, TrendingDown } from 'lucide-react';
import Topbar from '../components/Topbar';
import adminApi from '../lib/adminApi';
import toast from 'react-hot-toast';

const CreateSignal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    market: 'crypto',
    direction: 'BUY',
    entry: '',
    stopLoss: '',
    takeProfit1: '',
    takeProfit2: '',
    takeProfit3: '',
    timeframe: '1H',
    riskLevel: 'medium',
    analysis: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.createSignal({
        symbol: formData.symbol,
        market: formData.market,
        direction: formData.direction,
        entry: parseFloat(formData.entry),
        stop_loss: parseFloat(formData.stopLoss),
        take_profit_1: parseFloat(formData.takeProfit1),
        take_profit_2: parseFloat(formData.takeProfit2),
        take_profit_3: parseFloat(formData.takeProfit3),
        timeframe: formData.timeframe,
        risk_level: formData.riskLevel,
        signal_strength: 0.75,
        analysis: {
          reasoning: formData.analysis.split('\n').filter(line => line.trim()),
        },
        marketDataSnapshot: {
          price: parseFloat(formData.entry),
          timestamp: Date.now(),
        },
      });

      toast.success('Signal created successfully!');
      navigate('/admin/signals');
    } catch (error) {
      console.error('Error creating signal:', error);
      toast.error('Failed to create signal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Create Manual Signal" subtitle="Generate a new trading signal" />

      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="BTC/USDT"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Market</label>
                <select
                  name="market"
                  value={formData.market}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="crypto">Crypto</option>
                  <option value="forex">Forex</option>
                  <option value="gold">Gold</option>
                  <option value="indices">Indices</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Direction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: 'BUY' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      formData.direction === 'BUY'
                        ? 'bg-green-500 text-white'
                        : 'bg-dark-200 text-gray-400 hover:bg-dark-50'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: 'SELL' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      formData.direction === 'SELL'
                        ? 'bg-red-500 text-white'
                        : 'bg-dark-200 text-gray-400 hover:bg-dark-50'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5" />
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Timeframe</label>
                <select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="5M">5M</option>
                  <option value="15M">15M</option>
                  <option value="30M">30M</option>
                  <option value="1H">1H</option>
                  <option value="4H">4H</option>
                  <option value="1D">1D</option>
                  <option value="1W">1W</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trading Levels */}
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trading Levels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="entry"
                  value={formData.entry}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Take Profit 1</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="takeProfit1"
                  value={formData.takeProfit1}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Take Profit 2</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="takeProfit2"
                  value={formData.takeProfit2}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Take Profit 3</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="takeProfit3"
                  value={formData.takeProfit3}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Risk Level</label>
                <select
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Market Analysis</h3>
            
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Analysis Points (one per line)
              </label>
              <textarea
                name="analysis"
                value={formData.analysis}
                onChange={handleChange}
                placeholder="Strong uptrend confirmed&#10;RSI showing bullish momentum&#10;Support level holding at key zone"
                rows={6}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Signal'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/signals')}
              className="px-6 py-3 bg-dark-200 hover:bg-dark-50 text-white font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSignal;