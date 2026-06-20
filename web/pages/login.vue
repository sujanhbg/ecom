<template>
  <div class="auth-page container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your customer account to track orders and manage details</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrap">
            <i class="far fa-envelope"></i>
            <input 
              v-model="email" 
              type="email" 
              placeholder="e.g. john@example.com" 
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <i class="fas fa-lock"></i>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              required
            >
          </div>
        </div>

        <p v-if="error" class="error-msg">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </p>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Don't have an account? <NuxtLink to="/register">Create one now</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const config = useRuntimeConfig();
const API = config.public.apiBase;
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value, API);
    // Redirect to profile
    router.push('/profile');
  } catch (err) {
    error.value = err.data?.error || 'Invalid email or password. Please make sure you are registering or using client details.';
  } finally {
    loading.value = false;
  }
};

useHead({ title: 'Sign In — Demo Store' });
</script>

<style scoped>
.auth-page { display: flex; align-items: center; justify-content: center; min-height: 70vh; padding: 2rem 0; }
.auth-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }

.auth-header { text-align: center; margin-bottom: 2rem; }
.auth-header h2 { font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
.auth-header p { font-size: 0.875rem; color: #6b7280; line-height: 1.4; }

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #4b5563; }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap i { position: absolute; left: 1rem; color: #9ca3af; font-size: 0.9rem; }
.input-wrap input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
.input-wrap input:focus { border-color: #6366f1; }

.error-msg { font-size: 0.8rem; color: #ef4444; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }

.btn-submit { background: #6366f1; color: #fff; padding: 0.85rem; border-radius: 10px; font-size: 0.95rem; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s; }
.btn-submit:hover:not(:disabled) { background: #4f46e5; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280; }
.auth-footer a { color: #6366f1; font-weight: 600; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
</style>
