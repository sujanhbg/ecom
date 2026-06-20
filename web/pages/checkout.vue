<template>
  <div class="checkout-page container">
    <h1 class="page-title"><i class="fas fa-credit-card"></i> Checkout</h1>

    <div v-if="cart.items.length === 0 && !orderSuccess" class="empty-state">
      <div class="empty-icon"><i class="fas fa-shopping-bag"></i></div>
      <h2>Your cart is empty</h2>
      <p>Please add products to your cart before checking out.</p>
      <NuxtLink to="/products" class="btn-primary">Continue Shopping</NuxtLink>
    </div>

    <!-- Success Screen -->
    <div v-else-if="orderSuccess" class="success-screen">
      <div class="success-icon"><i class="fas fa-check-circle"></i></div>
      <h2>Order Placed Successfully!</h2>
      <p class="order-number">Order Number: <strong>{{ orderNumber }}</strong></p>
      <p>Thank you for shopping with us. We will contact you soon for confirmation.</p>
      <div class="success-actions">
        <NuxtLink to="/" class="btn-primary">Return Home</NuxtLink>
        <NuxtLink to="/products" class="btn-outline">Shop More</NuxtLink>
      </div>
    </div>

    <!-- Checkout Flow -->
    <div v-else class="checkout-layout">
      <!-- Left Column: Checkout Details -->
      <div class="checkout-main">
        <!-- Auth Check Block if not logged in -->
        <div v-if="!auth.isLoggedIn" class="checkout-card auth-card">
          <div class="auth-tabs">
            <button 
              :class="['auth-tab', { active: activeAuthTab === 'guest' }]" 
              @click="activeAuthTab = 'guest'"
            >
              <i class="fas fa-user"></i> Checkout as Guest
            </button>
            <button 
              :class="['auth-tab', { active: activeAuthTab === 'login' }]" 
              @click="activeAuthTab = 'login'"
            >
              <i class="fas fa-sign-in-alt"></i> Sign In / Register
            </button>
          </div>

          <div v-if="activeAuthTab === 'login'" class="auth-forms">
            <div v-if="showRegisterForm" class="auth-form">
              <h3>Create Customer Account</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input v-model="regForm.name" type="text" placeholder="John Doe">
                </div>
                <div class="form-group">
                  <label>Email Address *</label>
                  <input v-model="regForm.email" type="email" placeholder="john@example.com">
                </div>
                <div class="form-group">
                  <label>Phone Number *</label>
                  <input v-model="regForm.phone" type="text" placeholder="017xxxxxxxx">
                </div>
                <div class="form-group">
                  <label>Password *</label>
                  <input v-model="regForm.password" type="password" placeholder="••••••••">
                </div>
              </div>
              <p v-if="authError" class="error-msg"><i class="fas fa-exclamation-circle"></i> {{ authError }}</p>
              <div class="auth-actions">
                <button class="btn-primary" @click="handleRegister" :disabled="loadingAuth">
                  {{ loadingAuth ? 'Creating account...' : 'Register & Continue' }}
                </button>
                <button class="btn-text" @click="showRegisterForm = false">Already have an account? Sign In</button>
              </div>
            </div>

            <div v-else class="auth-form">
              <h3>Sign In to Your Account</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Email Address *</label>
                  <input v-model="loginForm.email" type="email" placeholder="john@example.com">
                </div>
                <div class="form-group">
                  <label>Password *</label>
                  <input v-model="loginForm.password" type="password" placeholder="••••••••">
                </div>
              </div>
              <p v-if="authError" class="error-msg"><i class="fas fa-exclamation-circle"></i> {{ authError }}</p>
              <div class="auth-actions">
                <button class="btn-primary" @click="handleLogin" :disabled="loadingAuth">
                  {{ loadingAuth ? 'Signing in...' : 'Sign In & Continue' }}
                </button>
                <button class="btn-text" @click="showRegisterForm = true">Create an account instead</button>
              </div>
            </div>
          </div>

          <div v-else class="guest-info-banner">
            <p><i class="fas fa-info-circle"></i> You are checking out as a guest. Fill in your details below to place the order.</p>
          </div>
        </div>

        <div v-else class="checkout-card user-logged-card">
          <div class="user-welcome">
            <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
            <div>
              <h3>Welcome back, {{ auth.userName }}!</h3>
              <p>Logged in as {{ auth.user?.email }}</p>
            </div>
            <button class="btn-logout" @click="auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>

        <!-- Shipping Addresses Manager -->
        <div class="checkout-card shipping-card">
          <div class="card-header">
            <h2><i class="fas fa-truck"></i> Shipping Information</h2>
            <button 
              v-if="auth.isLoggedIn && !showAddressForm" 
              class="btn-add-address" 
              @click="openNewAddressForm"
            >
              <i class="fas fa-plus"></i> Add New Address
            </button>
          </div>

          <!-- Address Form (Create or Edit / Guest mode uses this) -->
          <div v-if="showAddressForm || !auth.isLoggedIn" class="address-form">
            <h3 v-if="auth.isLoggedIn">{{ editingAddressIndex !== null ? 'Edit Address' : 'Add New Shipping Address' }}</h3>
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label>Receiver Name *</label>
                <input v-model="addressForm.name" type="text" placeholder="Full Name">
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <input v-model="addressForm.phone" type="text" placeholder="e.g. 01712345678">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input v-model="addressForm.email" type="email" placeholder="e.g. email@example.com">
              </div>
              <div class="form-group col-span-2">
                <label>Street Address / House / Flat *</label>
                <input v-model="addressForm.address" type="text" placeholder="House 12, Road 4, Sector 3">
              </div>
              <div class="form-group">
                <label>City *</label>
                <input v-model="addressForm.city" type="text" placeholder="e.g. Dhaka">
              </div>
              <div class="form-group">
                <label>District *</label>
                <input v-model="addressForm.district" type="text" placeholder="e.g. Dhaka">
              </div>
              <div class="form-group">
                <label>ZIP / Postal Code</label>
                <input v-model="addressForm.zip" type="text" placeholder="1230">
              </div>
              <div class="form-group" v-if="auth.isLoggedIn">
                <label>Address Label</label>
                <input v-model="addressForm.label" type="text" placeholder="e.g. Home, Office">
              </div>
            </div>

            <div class="form-actions" v-if="auth.isLoggedIn">
              <button class="btn-primary" @click="saveAddress">Save Address</button>
              <button class="btn-outline" @click="showAddressForm = false">Cancel</button>
            </div>
          </div>

          <!-- Saved Addresses Selection (Logged In Mode) -->
          <div v-else class="saved-addresses-list">
            <div v-if="savedAddresses.length === 0" class="no-address-alert">
              <p><i class="fas fa-exclamation-triangle"></i> You have no saved shipping addresses. Please add one to continue.</p>
            </div>
            <div v-else class="address-grid">
              <div 
                v-for="(addr, idx) in savedAddresses" 
                :key="idx" 
                :class="['address-card', { selected: selectedAddressIndex === idx }]"
                @click="selectAddress(idx)"
              >
                <div class="address-card-header">
                  <span class="address-label">{{ addr.label || 'Address' }}</span>
                  <div class="address-actions" @click.stop>
                    <button class="icon-btn-edit" @click="editAddress(idx)" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn-delete" @click="deleteAddress(idx)" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
                <div class="address-details">
                  <p class="addr-name"><strong>{{ addr.name }}</strong></p>
                  <p class="addr-phone"><i class="fas fa-phone"></i> {{ addr.phone }}</p>
                  <p class="addr-text">{{ addr.address }}, {{ addr.city }}, {{ addr.district }}</p>
                </div>
                <div class="selected-badge"><i class="fas fa-check-circle"></i></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Courier & Delivery Options -->
        <div class="checkout-card courier-card">
          <h2><i class="fas fa-truck-ramp-box"></i> Delivery Method</h2>
          <div class="courier-grid">
            <div 
              v-for="courier in couriers" 
              :key="courier.id"
              :class="['courier-option', { selected: selectedCourierId === courier.id }]"
              @click="selectedCourierId = courier.id"
            >
              <div class="courier-info">
                <span class="courier-name">{{ courier.name }}</span>
                <span class="courier-days">Estimated Delivery: {{ courier.estimatedDays }}</span>
              </div>
              <div class="courier-price">৳{{ courier.baseCost }}</div>
            </div>
          </div>
        </div>

        <!-- Payment Method selection -->
        <div class="checkout-card payment-card">
          <h2><i class="fas fa-wallet"></i> Payment Method</h2>
          <div class="payment-options">
            <label class="payment-option">
              <input type="radio" v-model="paymentMethod" value="COD">
              <span class="option-custom">
                <i class="fas fa-money-bill-wave"></i>
                <span class="option-text">
                  <strong>Cash on Delivery (COD)</strong>
                  <span class="option-desc">Pay with cash when order is delivered</span>
                </span>
              </span>
            </label>

            <label class="payment-option">
              <input type="radio" v-model="paymentMethod" value="bKash">
              <span class="option-custom">
                <i class="fas fa-mobile-alt"></i>
                <span class="option-text">
                  <strong>bKash / Mobile Banking</strong>
                  <span class="option-desc">Pay instantly using your bKash wallet</span>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary & Review -->
      <div class="checkout-sidebar">
        <div class="checkout-card summary-card">
          <h3>Order Review</h3>
          <div class="summary-items">
            <div v-for="item in cart.items" :key="item.key" class="summary-item">
              <img :src="resolveImg(item.product.image)" :alt="item.product.name">
              <div class="item-details">
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-qty">Qty: {{ item.quantity }} <span v-if="item.variation">| {{ item.variation.name }}</span></span>
              </div>
              <div class="item-price">
                ৳{{ Number((item.variation?.price || item.product.price) * item.quantity).toLocaleString() }}
              </div>
            </div>
          </div>

          <div class="summary-totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>৳{{ Number(cart.cartTotal).toLocaleString() }}</span>
            </div>
            <div class="totals-row">
              <span>Shipping Cost</span>
              <span>৳{{ Number(shippingCost).toLocaleString() }}</span>
            </div>
            <div class="totals-row divider"></div>
            <div class="totals-row grand-total">
              <span>Grand Total</span>
              <span>৳{{ Number(grandTotal).toLocaleString() }}</span>
            </div>
          </div>

          <p v-if="checkoutError" class="error-msg"><i class="fas fa-exclamation-circle"></i> {{ checkoutError }}</p>

          <button 
            class="btn-place-order" 
            :disabled="submittingOrder"
            @click="submitOrder"
          >
            <i class="fas fa-lock"></i>
            {{ submittingOrder ? 'Placing Order...' : 'Confirm & Place Order' }}
          </button>

          <div class="secure-checkout-tag">
            <i class="fas fa-shield-alt"></i> Encrypted Secure Checkout
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useCartStore } from '~/stores/cart';
import { useAuthStore } from '~/stores/auth';

const cart = useCartStore();
const auth = useAuthStore();
const config = useRuntimeConfig();
const API = config.public.apiBase;
const IMG = config.public.imageBase;

// --- Auth States ---
const activeAuthTab = ref('guest');
const showRegisterForm = ref(false);
const loadingAuth = ref(false);
const authError = ref('');

const loginForm = reactive({ email: '', password: '' });
const regForm = reactive({ name: '', email: '', password: '', phone: '' });

// --- Shipping Address States ---
const savedAddresses = ref([]);
const selectedAddressIndex = ref(null);
const showAddressForm = ref(true);
const editingAddressIndex = ref(null);

const addressForm = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  district: '',
  zip: '',
  label: ''
});

// --- Courier & Delivery States ---
const couriers = ref([
  { id: 1, name: 'Standard Inside Dhaka', baseCost: 60, estimatedDays: '1-2 Days' },
  { id: 2, name: 'Standard Outside Dhaka', baseCost: 120, estimatedDays: '3-5 Days' }
]);
const selectedCourierId = ref(1);

// --- Payment & Checkout States ---
const paymentMethod = ref('COD');
const submittingOrder = ref(false);
const checkoutError = ref('');
const orderSuccess = ref(false);
const orderNumber = ref('');

// --- Helpers ---
const resolveImg = (path) => {
  if (!path) return 'https://picsum.photos/60/60';
  if (path.startsWith('http')) return path;
  return `${IMG}${path.startsWith('/') ? path : '/' + path}`;
};

// Calculate cost based on courier
const shippingCost = computed(() => {
  const chosen = couriers.value.find(c => c.id === selectedCourierId.value);
  return chosen ? Number(chosen.baseCost) : 60;
});

const grandTotal = computed(() => {
  return Number(cart.cartTotal) + Number(shippingCost.value);
});


// --- Lifecycle & Sync ---
onMounted(async () => {
  // Load saved addresses from localStorage (standard simulated multi-address)
  const localAddrs = localStorage.getItem('storefront_addresses');
  if (localAddrs) {
    savedAddresses.value = JSON.parse(localAddrs);
  }

  // Pre-fill profile info if logged in
  if (auth.isLoggedIn) {
    activeAuthTab.value = 'user';
    if (savedAddresses.value.length > 0) {
      selectedAddressIndex.value = 0;
      showAddressForm.value = false;
    }
  }

  // Fetch real couriers from DB if API active
  try {
    const list = await $fetch(`${API}/storefront/couriers`);
    if (list?.length > 0) {
      couriers.value = list;
      selectedCourierId.value = list[0].id;
    }
  } catch (_) {}
});

// Watch login state to toggle view automatically
watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    activeAuthTab.value = 'user';
    if (savedAddresses.value.length > 0) {
      selectedAddressIndex.value = 0;
      showAddressForm.value = false;
    } else {
      showAddressForm.value = true;
    }
  } else {
    activeAuthTab.value = 'guest';
    showAddressForm.value = true;
  }
});

// --- Auth Actions ---
const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    authError.value = 'Email and Password are required';
    return;
  }
  authError.value = '';
  loadingAuth.value = true;
  try {
    await auth.login(loginForm.email, loginForm.password, API);
  } catch (err) {
    authError.value = err.data?.error || 'Invalid credentials. Make sure you entered client credentials.';
  } finally {
    loadingAuth.value = false;
  }
};

const handleRegister = async () => {
  if (!regForm.name || !regForm.email || !regForm.password || !regForm.phone) {
    authError.value = 'All fields are required';
    return;
  }
  authError.value = '';
  loadingAuth.value = true;
  try {
    await auth.register(regForm.name, regForm.email, regForm.password, regForm.phone, API);
  } catch (err) {
    authError.value = err.data?.error || 'Registration failed';
  } finally {
    loadingAuth.value = false;
  }
};

// --- Address Management ---
const openNewAddressForm = () => {
  editingAddressIndex.value = null;
  showAddressForm.value = true;
  addressForm.name = auth.user?.name || '';
  addressForm.phone = auth.user?.phone || '';
  addressForm.email = auth.user?.email || '';
  addressForm.address = '';
  addressForm.city = '';
  addressForm.district = '';
  addressForm.zip = '';
  addressForm.label = 'Home';
};

const saveAddress = () => {
  if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.district) {
    alert('Please fill in all required fields');
    return;
  }

  const payload = { ...addressForm };
  if (editingAddressIndex.value !== null) {
    savedAddresses.value[editingAddressIndex.value] = payload;
  } else {
    savedAddresses.value.push(payload);
  }

  localStorage.setItem('storefront_addresses', JSON.stringify(savedAddresses.value));
  showAddressForm.value = false;
  selectedAddressIndex.value = savedAddresses.value.length - 1;
};

const editAddress = (idx) => {
  editingAddressIndex.value = idx;
  const target = savedAddresses.value[idx];
  Object.assign(addressForm, target);
  showAddressForm.value = true;
};

const deleteAddress = (idx) => {
  savedAddresses.value.splice(idx, 1);
  localStorage.setItem('storefront_addresses', JSON.stringify(savedAddresses.value));
  if (selectedAddressIndex.value === idx) {
    selectedAddressIndex.value = savedAddresses.value.length > 0 ? 0 : null;
  }
  if (savedAddresses.value.length === 0) {
    showAddressForm.value = true;
  }
};

const selectAddress = (idx) => {
  selectedAddressIndex.value = idx;
  showAddressForm.value = false;
};

// --- Order Submission ---
const submitOrder = async () => {
  checkoutError.value = '';

  // 1. Resolve active shipping details
  let shippingData = {};
  if (auth.isLoggedIn) {
    if (showAddressForm.value) {
      // User is currently filling form
      if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.district) {
        checkoutError.value = 'Please complete the shipping address fields';
        return;
      }
      shippingData = { ...addressForm };
    } else {
      // User selected a saved address
      if (selectedAddressIndex.value === null) {
        checkoutError.value = 'Please select or add a shipping address';
        return;
      }
      shippingData = savedAddresses.value[selectedAddressIndex.value];
    }
  } else {
    // Guest checkout
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.district) {
      checkoutError.value = 'Please fill in all required shipping address fields';
      return;
    }
    shippingData = { ...addressForm };
  }

  submittingOrder.value = true;

  try {
    const payload = {
      shippingName:     shippingData.name,
      shippingPhone:    shippingData.phone,
      shippingEmail:    shippingData.email || '',
      shippingAddress:  shippingData.address,
      shippingCity:     shippingData.city,
      shippingDistrict: shippingData.district,
      shippingZip:      shippingData.zip || '',
      paymentMethod:    paymentMethod.value,
      subtotal:         cart.cartTotal,
      shippingCost:     shippingCost.value,
      total:            grandTotal.value,
      items: cart.items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.variation?.price || i.product.price,
        quantity: i.quantity,
        variationName: i.variation?.name || null
      }))
    };

    const headers = {};
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }

    const res = await $fetch(`${API}/storefront/orders`, {
      method: 'POST',
      headers,
      body: payload
    });

    if (res.success) {
      orderNumber.value = res.orderNumber;
      orderSuccess.value = true;
      cart.clearCart();
    } else {
      checkoutError.value = res.error || 'Failed to place order';
    }
  } catch (err) {
    checkoutError.value = err.data?.error || 'An error occurred while placing order. Please try again.';
  } finally {
    submittingOrder.value = false;
  }
};

useHead({ title: 'Secure Checkout — Demo Store' });
</script>

<style scoped>
.checkout-page { padding: 2rem 0 4rem; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; }
.page-title i { color: #6366f1; }

/* Empty state */
.empty-state { text-align: center; padding: 4rem; color: #9ca3af; }
.empty-icon { font-size: 3.5rem; color: #d1d5db; margin-bottom: 1.2rem; }
.btn-primary { background: #6366f1; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
.btn-primary:hover { background: #4f46e5; }
.btn-outline { background: #fff; border: 1.5px solid #d1d5db; color: #374151; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; display: inline-flex; text-decoration: none; cursor: pointer; }
.btn-outline:hover { border-color: #6366f1; color: #6366f1; }

/* Success Screen */
.success-screen { text-align: center; max-width: 500px; margin: 3rem auto; padding: 2.5rem; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.success-icon { font-size: 4rem; color: #10b981; margin-bottom: 1.5rem; }
.success-screen h2 { font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 0.75rem; }
.order-number { font-size: 1.1rem; color: #374151; margin-bottom: 1rem; }
.success-actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; }

/* Checkout Layout */
.checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }
.checkout-main { display: flex; flex-direction: column; gap: 1.5rem; }
.checkout-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; }

/* Auth Card & Tabs */
.auth-tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.25rem; }
.auth-tab { flex: 1; padding: 0.85rem; background: none; border: none; font-size: 0.9rem; font-weight: 700; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-bottom: 2.5px solid transparent; }
.auth-tab.active { color: #6366f1; border-color: #6366f1; }
.guest-info-banner { background: #f3f4f6; color: #4b5563; padding: 0.85rem 1rem; border-radius: 10px; font-size: 0.82rem; line-weight: 1.4; }
.auth-form h3 { font-size: 1.05rem; font-weight: 700; color: #111827; margin-bottom: 1rem; }
.auth-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; }
.btn-text { background: none; border: none; color: #6366f1; cursor: pointer; font-size: 0.82rem; font-weight: 600; }
.btn-text:hover { text-decoration: underline; }

.user-logged-card .user-welcome { display: flex; align-items: center; gap: 1rem; }
.user-avatar { font-size: 2.5rem; color: #6366f1; }
.user-welcome h3 { font-size: 1.05rem; font-weight: 700; color: #111827; }
.user-welcome p { font-size: 0.82rem; color: #6b7280; }
.btn-logout { margin-left: auto; background: none; border: 1px solid #fca5a5; color: #ef4444; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
.btn-logout:hover { background: #fee2e2; }

/* Shipping Form & Manager */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.card-header h2 { font-size: 1.15rem; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 0.5rem; }
.checkout-card h2 i { color: #6366f1; }
.btn-add-address { background: #eef2ff; color: #4f46e5; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
.btn-add-address:hover { background: #e0e7ff; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.col-span-2 { grid-column: span 2; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #4b5563; }
.form-group input { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.875rem; outline: none; }
.form-group input:focus { border-color: #6366f1; }
.form-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }

/* Address manager grid */
.address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.address-card { border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 1rem; cursor: pointer; position: relative; display: flex; flex-direction: column; gap: 0.5rem; transition: border-color 0.2s; }
.address-card:hover { border-color: #cbd5e1; }
.address-card.selected { border-color: #6366f1; background: #faf5ff; }
.address-card-header { display: flex; justify-content: space-between; align-items: center; }
.address-label { font-size: 0.7rem; font-weight: 700; background: #e2e8f0; color: #475569; padding: 0.15rem 0.5rem; border-radius: 99px; }
.address-card.selected .address-label { background: #eef2ff; color: #4f46e5; }
.address-actions { display: flex; gap: 0.5rem; }
.address-actions button { background: none; border: none; font-size: 0.75rem; cursor: pointer; color: #94a3b8; }
.address-actions button:hover { color: #64748b; }
.address-details p { font-size: 0.8rem; line-height: 1.4; color: #4b5563; }
.addr-name { font-size: 0.85rem !important; color: #111827 !important; }
.selected-badge { position: absolute; bottom: 0.75rem; right: 0.75rem; font-size: 1.15rem; color: #6366f1; display: none; }
.address-card.selected .selected-badge { display: block; }
.no-address-alert { background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; padding: 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 500; }

/* Courier Grid */
.courier-card h2 { font-size: 1.15rem; font-weight: 800; color: #111827; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
.courier-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.courier-option { border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: border-color 0.2s; }
.courier-option:hover { border-color: #cbd5e1; }
.courier-option.selected { border-color: #6366f1; background: #faf5ff; }
.courier-info { display: flex; flex-direction: column; gap: 0.2rem; }
.courier-name { font-size: 0.875rem; font-weight: 700; color: #111827; }
.courier-days { font-size: 0.75rem; color: #6b7280; }
.courier-price { font-size: 1rem; font-weight: 800; color: #111827; }

/* Payment Card */
.payment-card h2 { font-size: 1.15rem; font-weight: 800; color: #111827; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
.payment-options { display: flex; flex-direction: column; gap: 0.85rem; }
.payment-option { display: block; position: relative; cursor: pointer; }
.payment-option input { position: absolute; opacity: 0; cursor: pointer; }
.option-custom { border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; transition: border-color 0.2s; }
.payment-option input:checked ~ .option-custom { border-color: #6366f1; background: #faf5ff; }
.option-custom i { font-size: 1.5rem; color: #4f46e5; }
.option-text { display: flex; flex-direction: column; gap: 0.15rem; }
.option-text strong { font-size: 0.875rem; color: #111827; }
.option-desc { font-size: 0.75rem; color: #6b7280; }

/* Right Sidebar Review */
.checkout-sidebar { position: sticky; top: 80px; }
.summary-card h3 { font-size: 1.1rem; font-weight: 800; color: #111827; margin-bottom: 1.25rem; }
.summary-items { display: flex; flex-direction: column; gap: 1rem; max-height: 250px; overflow-y: auto; padding-right: 0.25rem; margin-bottom: 1.25rem; }
.summary-item { display: flex; align-items: center; gap: 0.75rem; }
.summary-item img { width: 44px; height: 44px; border-radius: 6px; border: 1px solid #e5e7eb; object-fit: cover; }
.item-details { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; min-width: 0; }
.item-name { font-size: 0.8rem; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-qty { font-size: 0.7rem; color: #6b7280; }
.summary-item .item-price { font-size: 0.82rem; font-weight: 700; color: #111827; }

.summary-totals { border-top: 1px dashed #e5e7eb; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
.totals-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #4b5563; }
.totals-row.divider { border-top: 1px solid #e5e7eb; margin: 0.25rem 0; }
.grand-total { font-size: 0.95rem; font-weight: 800; color: #111827; }
.grand-total span:nth-child(2) { font-size: 1.15rem; color: #6366f1; }

.btn-place-order { width: 100%; padding: 0.85rem; border-radius: 12px; background: #6366f1; color: #fff; border: none; font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1.25rem; transition: background 0.2s; }
.btn-place-order:hover:not(:disabled) { background: #4f46e5; }
.btn-place-order:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

.error-msg { font-size: 0.78rem; color: #ef4444; font-weight: 600; margin-top: 0.85rem; display: flex; align-items: center; gap: 0.3rem; }
.secure-checkout-tag { text-align: center; font-size: 0.72rem; color: #9ca3af; margin-top: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem; }
.secure-checkout-tag i { color: #10b981; }

@media (max-width: 900px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-sidebar { position: static; }
}
</style>
