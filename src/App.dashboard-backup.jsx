import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/layout/Layout';

import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Markets from './pages/Markets';
import Performance from './pages/Performance';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-dark-300">
        <Routes>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/onboarding"
            element={<Onboarding />}
          />

          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/signals"
              element={<Signals />}
            />

            <Route
              path="/markets"
              element={<Markets />}
            />

            <Route
              path="/performance"
              element={<Performance />}
            />

            <Route
              path="/subscription"
              element={<Subscription />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1f35',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
