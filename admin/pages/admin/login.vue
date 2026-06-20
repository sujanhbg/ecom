<template>
  <div class="login-page">
    <div class="background-overlay"></div>
    
    <div class="login-container">
      <div class="login-card glass fade-in">
        <div class="login-header">
          <div class="logo-wrapper">
            <i class="fas fa-shopping-bag logo-icon"></i>
          </div>
          <h1>Welcome Back</h1>
          <p>Please enter your credentials to access the admin panel</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope input-icon"></i>
              <input 
                id="email"
                v-model="form.email" 
                type="email" 
                placeholder="admin@sumon.com" 
                required
                :disabled="loading"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input 
                id="password"
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                required
                :disabled="loading"
              >
              <button 
                type="button" 
                class="password-toggle" 
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <label class="remember-me">
              <input type="checkbox" v-model="form.remember">
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot Password?</a>
          </div>

          <Transition name="shake">
            <div v-if="error" class="error-banner">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ error }}</span>
            </div>
          </Transition>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="!loading">Sign In to Dashboard</span>
            <div v-else class="loader"></div>
          </button>
        </form>

        <div class="login-footer">
          <p>&copy; 2026 Sumon E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
});

const auth = useAuthStore();
const form = reactive({
  email: '',
  password: '',
  remember: false
});
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  // Add a small delay for better feel
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    await auth.login(form.email, form.password);
    navigateTo('/admin/dashboard');
  } catch (err) {
    error.value = err.data?.error || 'Authentication failed. Please check your credentials.';
    // Clear password on error
    form.password = '';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-image: url('/images/login-bg.png');
  background-size: cover;
  background-position: center;
  font-family: 'Inter', sans-serif;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%);
  z-index: 1;
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  padding: 1.5rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-wrapper {
  width: 64px;
  height: 64px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
}

.logo-icon {
  font-size: 1.75rem;
  color: white;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.login-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: white;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.remember-me input {
  width: 1rem;
  height: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.remember-me span {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.forgot-password {
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 500;
  transition: opacity 0.2s;
}

.forgot-password:hover {
  opacity: 0.8;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-banner {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  color: #fb7185;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake-enter-active {
  animation: shake 0.2s ease-in-out 0s 2;
}

.login-footer {
  margin-top: 3rem;
  text-align: center;
}

.login-footer p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
}
</style>
