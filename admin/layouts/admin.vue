<template>
  <div class="admin-layout">
    <!-- Sidebar Overlay for Mobile -->
    <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Sidebar -->
    <aside :class="['sidebar', { 'collapsed': isCollapsed, 'mobile-open': isMobileMenuOpen }]">
      <div class="sidebar-header">
        <NuxtLink to="/admin/dashboard" class="sidebar-brand">
          <div v-if="!isCollapsed" class="brand-full animate-fade-in">
            <img src="/icons/logo_256.png" alt="logo" class="admin-logo" />
            
          </div>
          <div v-else class="brand-collapsed animate-fade-in">
            <img src="/icons/icon_64.png" alt="S Logo" class="admin-logo-collapsed" />
          </div>
        </NuxtLink>
        <button @click="isCollapsed = !isCollapsed" class="toggle-btn d-none-mobile">
          <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
        <button @click="isMobileMenuOpen = false" class="toggle-btn d-only-mobile">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path" 
          class="nav-item" 
          active-class="active"
          @click="isMobileMenuOpen = false"
        >
          <i :class="item.icon"></i>
          <span v-if="!isCollapsed">{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="auth.logout" class="nav-item logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!isCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-wrapper">
      <header class="top-header glass">
        <div class="header-left">
          <button @click="isMobileMenuOpen = true" class="menu-mobile-btn d-only-mobile">
            <i class="fas fa-bars"></i>
          </button>
          <h3>{{ currentPageTitle }}</h3>
        </div>
        <div class="header-right">
          <div class="user-profile" v-if="auth.user">
            <div class="user-info text-end">
              <span class="user-name">{{ auth.user.name }}</span>
              <span class="user-role">{{ auth.user.role }}</span>
            </div>
            <img :src="auth.user.avatar || 'https://ui-avatars.com/api/?name=' + auth.user.name" alt="Avatar" class="avatar shadow" @click="navigateTo('/admin/profile')">
          </div>
        </div>
      </header>

      <section class="content-body">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
const auth = useAuthStore();
const isCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const route = useRoute();

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'fas fa-th-large' },
  { name: 'Products', path: '/admin/products', icon: 'fas fa-box' },
  { name: 'Categories', path: '/admin/categories', icon: 'fas fa-tags' },
  { name: 'Orders', path: '/admin/orders', icon: 'fas fa-shopping-cart' },
  { name: 'Accounting', path: '/admin/accounting', icon: 'fas fa-file-invoice-dollar' },
  { name: 'Suppliers', path: '/admin/suppliers', icon: 'fas fa-truck-loading' },
  { name: 'Users', path: '/admin/users', icon: 'fas fa-users' },
  { name: 'Staff', path: '/admin/staff', icon: 'fas fa-user-shield' },
  { name: 'Permissions', path: '/admin/permissions', icon: 'fas fa-lock' },
  { name: 'Marketing', path: '/admin/marketing', icon: 'fas fa-bullhorn' },
  { name: 'Pages', path: '/admin/pages', icon: 'fas fa-file-alt' },
  { name: 'FAQs', path: '/admin/faqs', icon: 'fas fa-question-circle' },
  { name: 'Settings', path: '/admin/settings', icon: 'fas fa-cog' },
  { name: 'Menus', path: '/admin/menus', icon: 'fas fa-bars' },
];

const currentPageTitle = computed(() => {
  const current = navItems.find(item => route.path === item.path);
  return current ? current.name : 'Admin Panel';
});

onMounted(() => {
  auth.fetchProfile();
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background-color: var(--sidebar);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.brand-full {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.admin-logo-collapsed {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.toggle-btn {
  background: transparent;
  color: white;
  font-size: 0.8rem;
  opacity: 0.7;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  gap: 1rem;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-item i {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.nav-item:hover, .nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: white;
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  text-align: left;
  border-radius: 0;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 99;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.content-body {
  padding: 2rem;
  flex: 1;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    height: 100vh;
    z-index: 1001;
    width: 280px !important;
  }
  
  .sidebar.mobile-open {
    left: 0;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }

  .top-header {
    padding: 0 1rem;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .menu-mobile-btn {
    background: transparent;
    font-size: 1.25rem;
    color: var(--text-main);
  }

  .user-info {
    display: none;
  }

  .content-body {
    padding: 1rem;
  }

  .d-none-mobile {
    display: none !important;
  }

  .d-only-mobile {
    display: block !important;
  }
}

.d-only-mobile {
  display: none;
}
</style>
