import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    userName:   (s) => s.user?.name || '',
  },

  actions: {
    async login(email, password, apiBase) {
      const res = await $fetch(`${apiBase}/storefront/login`, {
        method: 'POST',
        body: { email, password }
      });
      this.token = res.token;
      this.user  = res.user;
      return res;
    },

    async register(name, email, password, phone, apiBase) {
      const res = await $fetch(`${apiBase}/storefront/register`, {
        method: 'POST',
        body: { name, email, password, phone }
      });
      this.token = res.token;
      this.user  = res.user;
      return res;
    },

    logout() {
      this.token = null;
      this.user  = null;
    }
  },

  persist: true
});
