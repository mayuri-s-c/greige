import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';
import { clearClientSession } from './clearClientSession';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      tokenType: 'Bearer',
      expiresIn: null,
      user: null,
      loading: false,
      bootstrapping: true,
      error: null,

      async register(payload) {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', payload);
          clearClientSession();
          set({
            token: data.token,
            tokenType: data.tokenType || 'Bearer',
            expiresIn: data.expiresIn || null,
            user: data.user,
            loading: false,
          });
          return data.user;
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },

      async login(payload) {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', payload);
          clearClientSession();
          set({
            token: data.token,
            tokenType: data.tokenType || 'Bearer',
            expiresIn: data.expiresIn || null,
            user: data.user,
            loading: false,
          });
          return data.user;
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed';
          set({ loading: false, error: message });
          throw new Error(message);
        }
      },

      /** Validate stored JWT against backend and refresh user profile */
      async bootstrap() {
        const token = get().token;
        if (!token) {
          set({ bootstrapping: false, user: null });
          return null;
        }

        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, bootstrapping: false, error: null });
          return data.user;
        } catch {
          clearClientSession();
          set({
            token: null,
            tokenType: 'Bearer',
            expiresIn: null,
            user: null,
            bootstrapping: false,
          });
          return null;
        }
      },

      async refreshMe() {
        if (!get().token) return null;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
          return data.user;
        } catch {
          clearClientSession();
          set({ token: null, user: null, expiresIn: null });
          return null;
        }
      },

      markOnboarded() {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, onboardingComplete: true } });
      },

      async logout() {
        try {
          if (get().token) {
            await api.post('/auth/logout');
          }
        } catch {
          /* ignore network errors on logout */
        }
        clearClientSession();
        set({
          token: null,
          tokenType: 'Bearer',
          expiresIn: null,
          user: null,
          error: null,
          loading: false,
        });
      },
    }),
    {
      name: 'greige-auth',
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        expiresIn: state.expiresIn,
        user: state.user,
      }),
    }
  )
);
