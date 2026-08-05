import { create } from 'zustand';

export const useWarpStore = create((set) => ({
  open: false,
  draft: '',
  /** Bumps on logout so WarpPanel can wipe chat history. */
  sessionEpoch: 0,

  openWarp: (draft = '') => set({ open: true, draft }),
  closeWarp: () => set({ open: false }),
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: '' }),

  reset() {
    set((s) => ({
      open: false,
      draft: '',
      sessionEpoch: s.sessionEpoch + 1,
    }));
  },
}));
