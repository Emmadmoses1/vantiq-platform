import { create } from 'zustand';

const useAuth = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLoading: (loading) => set({ loading }),
}));

export default useAuth;