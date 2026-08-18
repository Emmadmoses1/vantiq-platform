import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import SignalManagement from './pages/SignalManagement';
import SignalReview from './pages/SignalReview';
import CreateSignal from './pages/CreateSignal';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import PromoCodes from './pages/PromoCodes';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

const AdminApp = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    setAuthenticated(!!token);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/login"
          element={
            authenticated ? <Navigate to="/admin" /> : <AdminLogin onLogin={() => setAuthenticated(true)} />
          }
        />

        <Route
          path="/admin"
          element={authenticated ? <AdminLayout /> : <Navigate to="/admin/login" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetails />} />
          <Route path="signals" element={<SignalManagement />} />
          <Route path="signal-review" element={<SignalReview />} />
          <Route path="signals/create" element={<CreateSignal />} />
          <Route path="payments" element={<Payments />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="promo-codes" element={<PromoCodes />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1f35',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </BrowserRouter>
  );
};

export default AdminApp;