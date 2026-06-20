export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore();
  const token = useCookie('token');

  if (!token.value && to.path !== '/admin/login') {
    return navigateTo('/admin/login');
  }

  if (token.value && to.path === '/admin/login') {
    return navigateTo('/admin/dashboard');
  }
});
