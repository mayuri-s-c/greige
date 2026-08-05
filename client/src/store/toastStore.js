import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: [],

  pushToast({ title, body = '', tone = 'success', duration = 2800 } = {}) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ toasts: [...get().toasts, { id, title, body, tone }] });

    window.setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, duration);

    return id;
  },

  dismissToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clear() {
    set({ toasts: [] });
  },
}));
