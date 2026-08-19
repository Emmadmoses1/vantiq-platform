import React, { useEffect, useState } from 'react';
import telegram from '../config/telegram';

const YOUR_TELEGRAM_ID = 6096139230;

const AdminGuard = ({ children }) => {
  const [status, setStatus] = useState('checking'); // checking | allowed | denied

  useEffect(() => {
    const timer = setTimeout(() => {
      const tgUser = telegram.getUser();
      if (tgUser?.id === YOUR_TELEGRAM_ID) {
        setStatus('allowed');
      } else {
        setStatus('denied');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06080f' }}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: '#06080f' }}>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-sm text-gray-500">This admin panel is only accessible via authorized Telegram accounts.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGuard;
