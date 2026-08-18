import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useSignals = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSignals = async () => {
    try {
      setLoading(true);
      const data = await api.getActiveSignals();
      setSignals(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, []);

  return { signals, loading, error, refresh: loadSignals };
};