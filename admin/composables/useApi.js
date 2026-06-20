export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie('token');

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`;
    }

    try {
      const response = await $fetch(`${config.public.apiBase}${endpoint}`, {
        ...options,
        headers,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        token.value = null;
        navigateTo('/admin/login');
      }
      throw error;
    }
  };

  return {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
    put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
  };
};
