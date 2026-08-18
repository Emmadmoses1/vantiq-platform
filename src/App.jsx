import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Markets from './pages/Markets';
import Performance from './pages/Performance';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Subscription from './pages/Subscription';
import Wallet from './pages/Wallet';
import Onboarding from './pages/Onboarding';
import TelegramGuard from './components/TelegramGuard';

const AdminApp = React.lazy(() => import('./admin/AdminApp'));

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#06080f' }}>
    <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── ADMIN — no Telegram guard ── */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminApp />
            </Suspense>
          }
        />

        {/* ── USER APP — Telegram only ── */}
        <Route
          path="*"
          element={
            <TelegramGuard>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/onboarding" element={<Onboarding />} />

                <Route element={<Layout />}>
                  <Route path="/dashboard"      element={<Dashboard />} />
                  <Route path="/signals"        element={<Signals />} />
                  <Route path="/markets"        element={<Markets />} />
                  <Route path="/performance"    element={<Performance />} />
                  <Route path="/profile"        element={<Profile />} />
                  <Route path="/notifications"  element={<Notifications />} />
                  <Route path="/subscription"   element={<Subscription />} />
                  <Route path="/wallet"         element={<Wallet />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </TelegramGuard>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
