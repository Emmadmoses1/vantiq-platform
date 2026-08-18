import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await api.getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  return { subscription, loading, refresh: loadSubscription };
};