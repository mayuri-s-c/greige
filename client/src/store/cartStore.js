import { create } from 'zustand';
import api from '../api/client';

export const useCartStore = create((set) => ({
  cart: null,
  loading: false,

  reset() {
    set({ cart: null, loading: false });
  },

  async fetchCart() {
    set({ loading: true });
    try {
      const { data } = await api.get('/cart');
      set({ cart: data.cart, loading: false });
    } catch {
      set({ cart: null, loading: false });
    }
  },

  async addItem(productId, quantity = 1, color = '') {
    const { data } = await api.post('/cart/items', { productId, quantity, color });
    set({ cart: data.cart });
    return data.cart;
  },

  async updateItem(productId, quantity, color = '') {
    const { data } = await api.put('/cart/items', { productId, quantity, color });
    set({ cart: data.cart });
  },

  async removeItem(productId, color = '') {
    const query = color ? `?color=${encodeURIComponent(color)}` : '';
    const { data } = await api.delete(`/cart/items/${productId}${query}`);
    set({ cart: data.cart });
  },
}));
