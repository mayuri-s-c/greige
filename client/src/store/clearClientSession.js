import { useCartStore } from './cartStore';
import { useWarpStore } from './warpStore';
import { useToastStore } from './toastStore';

/** Wipe all in-memory buyer/supplier session data (cart, Warp, toasts). */
export function clearClientSession() {
  useCartStore.setState({ cart: null, loading: false });
  useWarpStore.setState((s) => ({
    open: false,
    draft: '',
    sessionEpoch: (s.sessionEpoch || 0) + 1,
  }));
  useToastStore.setState({ toasts: [] });
}
