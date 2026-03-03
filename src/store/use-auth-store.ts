import { create } from 'zustand';
import { UserProfile } from '@/types/auth';

interface AuthStore {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user: UserProfile | null) => set({ user }),
  clearUser: () => set({ user: null }),
}));
