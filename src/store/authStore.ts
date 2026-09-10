import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const storedUser = localStorage.getItem('lh_user');
const storedToken = localStorage.getItem('lh_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  setAuth: (user, token) => {
    localStorage.setItem('lh_user', JSON.stringify(user));
    localStorage.setItem('lh_token', token);
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('lh_user');
    localStorage.removeItem('lh_token');
    set({ user: null, token: null });
  },
}));
