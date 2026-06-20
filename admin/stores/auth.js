import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7 });
  const api = useApi();

  const isLoggedIn = computed(() => !!token.value);

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      token.value = data.token;
      user.value = data.user;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    navigateTo('/admin/login');
  };

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const data = await api.get('/auth/profile');
      user.value = data;
    } catch (error) {
      logout();
    }
  };

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    fetchProfile,
  };
});
