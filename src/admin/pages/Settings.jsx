import React, { useState } from 'react';
import { Save, Key, Bell, Shield, DollarSign } from 'lucide-react';
import Topbar from '../components/Topbar';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'VANTIQ',
    siteUrl: 'https://vantiq.io',
    supportEmail: 'support@vantiq.io',
    telegramBotToken: '••••••••••',
    signalQualityThreshold: 0.70,
    autoPublishSignals: false,
    paymentConfirmationBlocks: {
      btc: 1,
      eth: 12,
      usdt: 12,
    },
    maintenanceMode: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Settings" subtitle="Configure platform settings" />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* General Settings */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            General Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Site URL</label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Signal Settings */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-400" />
            Signal Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Signal Quality Threshold (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.signalQualityThreshold}
                onChange={(e) => setSettings({...settings, signalQualityThreshold: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Minimum confidence score required for signal generation
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-200 rounded-xl">
              <div>
                <p className="font-semibold text-white">Auto-Publish Signals</p>
                <p className="text-sm text-gray-400">Automatically publish approved signals</p>
              </div>
              <button
                onClick={() => setSettings({...settings, autoPublishSignals: !settings.autoPublishSignals})}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.autoPublishSignals ? 'bg-primary-500' : 'bg-dark-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.autoPublishSignals ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-400" />
            Payment Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                BTC Confirmation Blocks
              </label>
              <input
                type="number"
                value={settings.paymentConfirmationBlocks.btc}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                ETH Confirmation Blocks
              </label>
              <input
                type="number"
                value={settings.paymentConfirmationBlocks.eth}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-400" />
            API Keys
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Telegram Bot Token
              </label>
              <input
                type="password"
                value={settings.telegramBotToken}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Maintenance Mode</h3>
              <p className="text-sm text-gray-400">Temporarily disable user access</p>
            </div>
            <button
              onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-dark-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;