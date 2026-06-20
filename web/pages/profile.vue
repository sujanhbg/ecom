<template>
  <div class="profile-page container">
    <div v-if="!auth.isLoggedIn" class="not-logged-in">
      <div class="lock-icon"><i class="fas fa-lock"></i></div>
      <h2>Please Sign In</h2>
      <p>You must be signed in to view your customer dashboard and track orders.</p>
      <NuxtLink to="/login" class="btn-primary">Sign In to Account</NuxtLink>
    </div>

    <div v-else class="profile-layout">
      <!-- Left Sidebar Navigation -->
      <aside class="profile-sidebar">
        <div class="user-profile-header">
          <div class="avatar-circle">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-meta">
            <h3>{{ auth.userName }}</h3>
            <span class="user-role">Customer Account</span>
          </div>
        </div>

        <ul class="sidebar-menu">
          <li :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
            <i class="fas fa-home"></i> Dashboard
          </li>
          <li :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
            <i class="fas fa-box"></i> Order History &amp; Tracking
          </li>
          <li :class="{ active: activeTab === 'addresses' }" @click="activeTab = 'addresses'">
            <i class="fas fa-map-marker-alt"></i> Saved Addresses
          </li>
          <li :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
            <i class="fas fa-key"></i> Change Password
          </li>
          <li class="logout-btn" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i> Logout
          </li>
        </ul>
      </aside>

      <!-- Right Main Content Area -->
      <main class="profile-content">
        <!-- 1. DASHBOARD OVERVIEW -->
        <div v-if="activeTab === 'dashboard'" class="tab-pane">
          <h2 class="pane-title">Account Dashboard</h2>
          <p class="pane-desc">Hello, <strong>{{ auth.userName }}</strong>! From your dashboard, you can track orders, update shipping locations, and edit login details.</p>

          <div class="stats-grid">
            <div class="stat-card" @click="activeTab = 'orders'">
              <div class="stat-icon purple"><i class="fas fa-shopping-bag"></i></div>
              <div class="stat-info">
                <h3>{{ orders.length }}</h3>
                <p>Total Orders Placed</p>
              </div>
            </div>
            <div class="stat-card" @click="activeTab = 'addresses'">
              <div class="stat-icon blue"><i class="fas fa-map-marked-alt"></i></div>
              <div class="stat-info">
                <h3>{{ savedAddresses.length }}</h3>
                <p>Saved Addresses</p>
              </div>
            </div>
            <div class="stat-card" @click="activeTab = 'orders'">
              <div class="stat-icon green"><i class="fas fa-clock"></i></div>
              <div class="stat-info">
                <h3>{{ pendingOrdersCount }}</h3>
                <p>Pending Delivery</p>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="dashboard-card profile-info-card">
            <h3><i class="far fa-edit"></i> Edit Profile Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input v-model="profileForm.name" type="text" placeholder="Name">
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input v-model="profileForm.phone" type="text" placeholder="Phone">
              </div>
              <div class="form-group">
                <label>Email Address (Cannot change)</label>
                <input :value="auth.user?.email" type="email" disabled class="disabled-input">
              </div>
              <div class="form-group">
                <label>City</label>
                <input v-model="profileForm.city" type="text" placeholder="e.g. Dhaka">
              </div>
              <div class="form-group col-span-2">
                <label>Default Address</label>
                <input v-model="profileForm.address" type="text" placeholder="Street Address, Block">
              </div>
            </div>
            <div class="pane-actions">
              <button class="btn-primary" @click="updateProfile" :disabled="loadingProfile">
                {{ loadingProfile ? 'Saving...' : 'Save Profile Changes' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 2. ORDER HISTORY & TRACKING -->
        <div v-else-if="activeTab === 'orders'" class="tab-pane">
          <h2 class="pane-title">Order History &amp; Tracking</h2>
          <p class="pane-desc">Monitor live status, delivery courier details, and itemized receipts for your orders.</p>

          <div v-if="loadingOrders" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i> Loading purchase history...
          </div>

          <div v-else-if="orders.length === 0" class="empty-orders">
            <i class="fas fa-box-open"></i>
            <h3>No orders found</h3>
            <p>You haven't placed any orders with this account yet.</p>
            <NuxtLink to="/products" class="btn-primary">Browse Products</NuxtLink>
          </div>

          <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-receipt-card">
              <div class="receipt-header">
                <div>
                  <span class="order-id">#{{ order.orderNumber }}</span>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="receipt-badges">
                  <span :class="['status-badge', order.status]">{{ order.status.toUpperCase() }}</span>
                  <span :class="['pay-badge', order.paymentStatus]">{{ order.paymentStatus.toUpperCase() }}</span>
                </div>
              </div>

              <!-- Order Details/Receipt Items -->
              <div class="receipt-body">
                <div class="receipt-items">
                  <div v-for="item in order.OrderItems" :key="item.id" class="receipt-item">
                    <span class="item-name"><strong>{{ item.productName }}</strong> <span v-if="item.variation">({{ item.variation }})</span></span>
                    <span class="item-qty">Qty: {{ item.quantity }}</span>
                    <span class="item-price">৳{{ Number(item.price * item.quantity).toLocaleString() }}</span>
                  </div>
                </div>

                <div class="receipt-meta">
                  <p><strong>Shipping Address:</strong> {{ order.shippingAddress }}</p>
                  <p><strong>Payment Method:</strong> {{ order.paymentMethod }}</p>
                  <p v-if="order.trackingNumber"><strong>Tracking Info:</strong> {{ order.courierService || 'Courier' }} - {{ order.trackingNumber }}</p>
                </div>
              </div>

              <div class="receipt-footer">
                <span>Total Amount:</span>
                <strong>৳{{ Number(order.total).toLocaleString() }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. SAVED ADDRESSES -->
        <div v-else-if="activeTab === 'addresses'" class="tab-pane">
          <div class="pane-header">
            <div>
              <h2 class="pane-title">Saved Shipping Locations</h2>
              <p class="pane-desc">Manage multiple billing and delivery addresses for quick selection during checkout.</p>
            </div>
            <button class="btn-primary-sm" @click="openNewAddressForm">
              <i class="fas fa-plus"></i> Add Address
            </button>
          </div>

          <!-- Add/Edit address inline form -->
          <div v-if="showAddressForm" class="address-inline-form dashboard-card">
            <h3>{{ editingAddressIndex !== null ? 'Edit Saved Address' : 'Create Shipping Address' }}</h3>
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label>Receiver Full Name *</label>
                <input v-model="addressForm.name" type="text" placeholder="John Doe">
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <input v-model="addressForm.phone" type="text" placeholder="e.g. 017xxxxxxxx">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input v-model="addressForm.email" type="email" placeholder="email@example.com">
              </div>
              <div class="form-group col-span-2">
                <label>Street Address *</label>
                <input v-model="addressForm.address" type="text" placeholder="House/Flat/Road Details">
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
              <div class="form-group">
                <label>Location Label *</label>
                <input v-model="addressForm.label" type="text" placeholder="e.g. Home, Office">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-primary" @click="saveAddress">Save Location</button>
              <button class="btn-outline" @click="showAddressForm = false">Cancel</button>
            </div>
          </div>

          <div v-else-if="savedAddresses.length === 0" class="empty-addresses">
            <i class="fas fa-map-marked-alt"></i>
            <h3>No addresses saved</h3>
            <p>Add shipping locations to speed up your checkout process.</p>
          </div>

          <div v-else class="addresses-grid">
            <div v-for="(addr, idx) in savedAddresses" :key="idx" class="address-item-card">
              <div class="card-top">
                <span class="addr-label">{{ addr.label || 'Home' }}</span>
                <div class="card-actions">
                  <button @click="editAddress(idx)" title="Edit"><i class="fas fa-edit"></i></button>
                  <button @click="deleteAddress(idx)" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </div>
              <div class="card-details">
                <p class="name"><strong>{{ addr.name }}</strong></p>
                <p class="phone"><i class="fas fa-phone"></i> {{ addr.phone }}</p>
                <p class="text">{{ addr.address }}, {{ addr.city }}, {{ addr.district }} {{ addr.zip }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. CHANGE PASSWORD -->
        <div v-else-if="activeTab === 'password'" class="tab-pane">
          <h2 class="pane-title">Change Account Password</h2>
          <p class="pane-desc">Regularly updating your password keeps your purchase details secure.</p>

          <form @submit.prevent="changePassword" class="dashboard-card password-card">
            <div class="form-group">
              <label>Current Password *</label>
              <input v-model="passForm.currentPassword" type="password" required placeholder="••••••••">
            </div>
            <div class="form-group">
              <label>New Password *</label>
              <input v-model="passForm.newPassword" type="password" required placeholder="Minimum 6 characters">
            </div>
            <div class="form-group">
              <label>Confirm New Password *</label>
              <input v-model="passForm.confirmPassword" type="password" required placeholder="••••••••">
            </div>

            <p v-if="passError" class="error-msg"><i class="fas fa-exclamation-circle"></i> {{ passError }}</p>
            <p v-if="passSuccess" class="success-msg"><i class="fas fa-check-circle"></i> {{ passSuccess }}</p>

            <div class="pane-actions">
              <button type="submit" class="btn-primary" :disabled="loadingPassword">
                {{ loadingPassword ? 'Updating...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const config = useRuntimeConfig();
const API = config.public.apiBase;
const router = useRouter();

const activeTab = ref('dashboard');

// --- Forms ---
const profileForm = reactive({ name: '', phone: '', city: '', address: '' });
const passForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });

// --- Lists ---
const orders = ref([]);
const savedAddresses = ref([]);

// --- Loading / Errors ---
const loadingOrders = ref(false);
const loadingProfile = ref(false);
const loadingPassword = ref(false);
const passError = ref('');
const passSuccess = ref('');

// --- Shipping Address Management ---
const showAddressForm = ref(false);
const editingAddressIndex = ref(null);
const addressForm = reactive({ name: '', phone: '', email: '', address: '', city: '', district: '', zip: '', label: '' });

// --- Counts ---
const pendingOrdersCount = computed(() => {
  return orders.value.filter(o => o.status === 'pending').length;
});

// --- Formatting ---
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- Lifecycle ---
onMounted(async () => {
  if (auth.isLoggedIn) {
    // Fill profile fields
    profileForm.name = auth.user?.name || '';
    profileForm.phone = auth.user?.phone || '';
    profileForm.city = auth.user?.city || '';
    profileForm.address = auth.user?.address || '';

    // Load saved addresses from localStorage
    const local = localStorage.getItem('storefront_addresses');
    if (local) savedAddresses.value = JSON.parse(local);

    // Fetch order history
    fetchOrders();
  }
});

// --- Fetch Orders ---
const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const list = await $fetch(`${API}/storefront/orders`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    orders.value = list || [];
  } catch (err) {
    console.error(err);
  } finally {
    loadingOrders.value = false;
  }
};

// --- Edit Profile ---
const updateProfile = async () => {
  loadingProfile.value = true;
  try {
    const updatedUser = await $fetch(`${API}/storefront/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: profileForm
    });
    auth.user = updatedUser;
    alert('Profile updated successfully!');
  } catch (err) {
    alert(err.data?.error || 'Failed to update profile');
  } finally {
    loadingProfile.value = false;
  }
};

// --- Password Update ---
const changePassword = async () => {
  passError.value = '';
  passSuccess.value = '';
  if (passForm.newPassword !== passForm.confirmPassword) {
    passError.value = 'Passwords do not match';
    return;
  }

  loadingPassword.value = true;
  try {
    const res = await $fetch(`${API}/storefront/change-password`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: {
        currentPassword: passForm.currentPassword,
        newPassword:     passForm.newPassword
      }
    });
    passSuccess.value = res.message || 'Password changed successfully!';
    passForm.currentPassword = '';
    passForm.newPassword = '';
    passForm.confirmPassword = '';
  } catch (err) {
    passError.value = err.data?.error || 'Current password incorrect';
  } finally {
    loadingPassword.value = false;
  }
};

// --- Saved Address Management ---
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
};

const editAddress = (idx) => {
  editingAddressIndex.value = idx;
  Object.assign(addressForm, savedAddresses.value[idx]);
  showAddressForm.value = true;
};

const deleteAddress = (idx) => {
  savedAddresses.value.splice(idx, 1);
  localStorage.setItem('storefront_addresses', JSON.stringify(savedAddresses.value));
};

// --- Logout ---
const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

useHead({ title: 'Customer Profile Dashboard' });
</script>

<style scoped>
.profile-page { padding: 3rem 0 5rem; }

/* Not logged in block */
.not-logged-in { text-align: center; max-width: 460px; margin: 4rem auto; padding: 3rem 2rem; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.lock-icon { font-size: 3.5rem; color: #9ca3af; margin-bottom: 1.5rem; }
.not-logged-in h2 { font-size: 1.5rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
.not-logged-in p { color: #6b7280; margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5; }

/* Profile Layout */
.profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start; }

/* Sidebar Navigation */
.profile-sidebar { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; }
.user-profile-header { display: flex; align-items: center; gap: 1rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f3f4f6; margin-bottom: 1.25rem; }
.avatar-circle { width: 50px; height: 50px; border-radius: 50%; background: #eef2ff; color: #6366f1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.user-meta h3 { font-size: 0.95rem; font-weight: 800; color: #111827; }
.user-role { font-size: 0.72rem; color: #6b7280; font-weight: 500; }

.sidebar-menu { display: flex; flex-direction: column; gap: 0.5rem; }
.sidebar-menu li { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.875rem; font-weight: 600; color: #4b5563; cursor: pointer; transition: all 0.2s; }
.sidebar-menu li:hover { background: #f9fafb; color: #111827; }
.sidebar-menu li.active { background: #6366f1; color: #fff; }
.sidebar-menu li.logout-btn { color: #ef4444; border-top: 1px solid #f3f4f6; margin-top: 0.5rem; padding-top: 1rem; border-radius: 0; }
.sidebar-menu li.logout-btn:hover { background: #fee2e2; color: #ef4444; }

/* Main Content Area */
.profile-content { display: flex; flex-direction: column; gap: 1.5rem; }
.pane-title { font-size: 1.5rem; font-weight: 800; color: #111827; margin-bottom: 0.25rem; }
.pane-desc { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; }
.dashboard-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-2px); border-color: #6366f1; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.stat-icon.purple { background: #f5f3ff; color: #7c3aed; }
.stat-icon.blue { background: #eff6ff; color: #2563eb; }
.stat-icon.green { background: #ecfdf5; color: #059669; }
.stat-info h3 { font-size: 1.4rem; font-weight: 800; color: #111827; }
.stat-info p { font-size: 0.78rem; color: #6b7280; font-weight: 500; }

/* Form Layouts */
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.col-span-2 { grid-column: span 2; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #4b5563; }
.form-group input { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
.form-group input:focus { border-color: #6366f1; }
.disabled-input { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
.pane-actions { display: flex; justify-content: flex-end; }

/* Shipping Addresses Manager */
.pane-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.btn-primary-sm { background: #6366f1; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
.btn-primary-sm:hover { background: #4f46e5; }
.address-inline-form { margin-bottom: 1.5rem; }
.form-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }

.addresses-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.address-item-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: border-color 0.2s; }
.address-item-card:hover { border-color: #6366f1; }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.addr-label { font-size: 0.7rem; font-weight: 700; background: #eef2ff; color: #4f46e5; padding: 0.15rem 0.5rem; border-radius: 99px; }
.card-actions { display: flex; gap: 0.6rem; }
.card-actions button { background: none; border: none; font-size: 0.85rem; cursor: pointer; color: #9ca3af; transition: color 0.2s; }
.card-actions button:hover { color: #4b5563; }
.card-details p { font-size: 0.82rem; line-height: 1.45; color: #4b5563; }

/* Change Password view */
.password-card { display: flex; flex-direction: column; gap: 1.25rem; max-width: 480px; }
.success-msg { font-size: 0.8rem; color: #059669; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
.error-msg { font-size: 0.8rem; color: #ef4444; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }

/* Order history list */
.loading-state { text-align: center; padding: 3rem; color: #9ca3af; font-size: 0.9rem; }
.empty-orders { text-align: center; padding: 4rem; color: #9ca3af; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.empty-orders i { font-size: 3rem; color: #d1d5db; }
.empty-orders h3 { font-size: 1.1rem; font-weight: 700; color: #374151; }

.orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
.order-receipt-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
.receipt-header { background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.order-id { font-size: 0.95rem; font-weight: 800; color: #111827; margin-right: 0.75rem; }
.order-date { font-size: 0.78rem; color: #6b7280; font-weight: 500; }

.receipt-badges { display: flex; gap: 0.5rem; }
.status-badge { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 99px; }
.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.shipped { background: #dbeafe; color: #2563eb; }
.status-badge.delivered { background: #d1fae5; color: #059669; }
.status-badge.cancelled { background: #fee2e2; color: #ef4444; }

.pay-badge { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 99px; }
.pay-badge.unpaid { background: #fee2e2; color: #b91c1c; }
.pay-badge.paid { background: #ecfdf5; color: #047857; }

.receipt-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid #f3f4f6; }
.receipt-items { display: flex; flex-direction: column; gap: 0.5rem; }
.receipt-item { display: flex; justify-content: space-between; font-size: 0.85rem; color: #374151; }
.receipt-item .item-qty { color: #6b7280; font-size: 0.78rem; margin-left: 0.5rem; }
.receipt-item .item-price { font-weight: 600; color: #111827; }

.receipt-meta { font-size: 0.78rem; color: #6b7280; line-height: 1.5; border-top: 1px dashed #e5e7eb; padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.15rem; }

.receipt-footer { padding: 1rem 1.5rem; background: #fafafa; display: flex; justify-content: space-between; align-items: center; }
.receipt-footer span { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
.receipt-footer strong { font-size: 1.1rem; color: #6366f1; font-weight: 800; }

.btn-outline { background: #fff; border: 1.5px solid #d1d5db; color: #374151; padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { border-color: #6366f1; color: #6366f1; }

@media (max-width: 900px) {
  .profile-layout { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
  .addresses-grid { grid-template-columns: 1fr; }
}
</style>
