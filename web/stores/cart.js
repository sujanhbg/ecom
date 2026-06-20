import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],      // { product, quantity, variation }
    wishlist: []    // product objects
  }),

  getters: {
    cartCount: (s) => s.items.reduce((n, i) => n + i.quantity, 0),
    cartTotal: (s) => s.items.reduce((t, i) => {
      const price = Number(i.variation?.price || i.product.price);
      return t + price * i.quantity;
    }, 0),

    wishlistCount: (s) => s.wishlist.length,
    isInWishlist: (s) => (id) => s.wishlist.some(p => p.id === id)
  },

  actions: {
    addToCart(product, quantity = 1, variation = null) {
      const key = variation ? `${product.id}-${variation.id}` : `${product.id}`;
      const existing = this.items.find(i =>
        i.key === key
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({ key, product, quantity, variation });
      }
    },

    removeFromCart(key) {
      this.items = this.items.filter(i => i.key !== key);
    },

    updateQty(key, quantity) {
      const item = this.items.find(i => i.key === key);
      if (item) item.quantity = Math.max(1, quantity);
    },

    clearCart() { this.items = []; },

    toggleWishlist(product) {
      const idx = this.wishlist.findIndex(p => p.id === product.id);
      if (idx === -1) {
        this.wishlist.push(product);
      } else {
        this.wishlist.splice(idx, 1);
      }
    }
  },

  persist: true
});
