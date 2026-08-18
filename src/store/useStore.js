import { create } from 'zustand';

const useStore = create((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Subscription
  subscription: null,
  setSubscription: (subscription) => set({ subscription }),

  // Signals
  signals: [],
  setSignals: (signals) => set({ signals }),

  // UI
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

export default useStore;