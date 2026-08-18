import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/layout/Layout';
import { FullPageLoader } from './components/ui/Loader';

import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Markets from './pages/Markets';
import Performance from './pages/Performance';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

import api from './lib/api';
import telegram from './config/telegram';

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const telegramInit = telegram.init();

      /*
       * Browser development mode:
       * Don't call api.initialize() because it requires
       * a real Telegram user.
       */
      if (!telegramInit && !import.meta.env.PROD) {
        console.log('VANTIQ: Browser development mode');
        setAuthenticated(true);
        setIsNewUser(false);
        return;
      }

      /*
       * Production must run inside Telegram.
       */
      if (!telegramInit && import.meta.env.PROD) {
        throw new Error('Must be opened in Telegram');
      }

      /*
       * Real Telegram authentication.
       */
      const result = await api.initialize();

      setAuthenticated(Boolean(result?.success));
      setIsNewUser(Boolean(result?.isNewUser));

    } catch (error) {
      console.error('VANTIQ initialization error:', error);

      /*
       * Never show the authentication screen during
       * local browser development.
       */
      if (!import.meta.env.PROD) {
        setAuthenticated(true);
        setIsNewUser(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullPageLoader text="Initializing VANTIQ..." />;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>

          <Route
            path="/"
            element={
              isNewUser
                ? <Navigate to="/onboarding" replace />
                : <Navigate to="/dashboard" replace />
            }
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
