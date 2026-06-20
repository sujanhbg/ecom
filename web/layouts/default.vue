<template>
  <div>
    <header>
      <div class="header-top">
        <div class="container">
          <!-- Hamburger menu toggle for mobile -->
          <button class="mobile-menu-toggle" @click="isMobileMenuOpen = true" aria-label="Open menu">
            <i class="fas fa-bars"></i>
          </button>

          <div class="logo">
            <nuxt-link to="/">
              <img src="/icons/logo_256.png" alt="Demo-store" class="header-logo" />
            </nuxt-link>
          </div>
          
          <form @submit.prevent="handleSearch" class="search-bar">
            <input v-model="searchQuery" type="text" placeholder="Search for products, categories..." />
            <button type="submit"><i class="fas fa-search"></i></button>
          </form>
          
          <div class="header-actions">
            <NuxtLink :to="auth.isLoggedIn ? '/profile' : '/login'" class="action-item">
              <div class="action-icon-wrap">
                <i class="far fa-user"></i>
              </div>
              <span class="action-label">{{ auth.isLoggedIn ? auth.userName : 'Log in / Sign up' }}</span>
            </NuxtLink>
            <NuxtLink to="/wishlist" class="action-item">
              <div class="action-icon-wrap">
                <i class="far fa-heart"></i>
                <span v-if="cart.wishlistCount" class="badge-count">{{ cart.wishlistCount }}</span>
              </div>
              <span class="action-label">Wishlist</span>
            </NuxtLink>
            <NuxtLink to="/cart" class="action-item">
              <div class="action-icon-wrap">
                <i class="fas fa-shopping-cart"></i>
                <span v-if="cart.cartCount" class="badge-count">{{ cart.cartCount }}</span>
              </div>
              <span class="action-label">Cart</span>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <nav class="header-nav">
        <div class="container nav-container">
          <div class="categories-dropdown" ref="catDropdown">
            <div
              class="dropdown-header"
              @click="toggleCat"
              :class="{ 'is-open': catOpen }"
            >
              <i class="fas fa-bars"></i>
              <span>Browse Categories</span>
              <i class="fas fa-angle-down chevron" :class="{ rotated: catOpen }"></i>
            </div>
            <Transition name="cat-drop">
              <ul class="dropdown-list" v-show="catOpen">
                <li v-for="cat in categories" :key="cat.id" :class="{ 'has-children': cat.children && cat.children.length }">
                  <nuxt-link :to="`/products?categoryId=${cat.id}`" @click="catOpen = false">
                    <span class="cat-link-content">
                      <i :class="getCatIcon(cat.name)"></i>
                      <span>{{ cat.name }}</span>
                    </span>
                    <i v-if="cat.children && cat.children.length" class="fas fa-chevron-right submenu-chevron"></i>
                  </nuxt-link>
                  
                  <!-- Level 2 Submenu -->
                  <ul v-if="cat.children && cat.children.length" class="submenu-list">
                    <li v-for="sub in cat.children" :key="sub.id" :class="{ 'has-children': sub.children && sub.children.length }">
                      <nuxt-link :to="`/products?categoryId=${sub.id}`" @click="catOpen = false">
                        <span>{{ sub.name }}</span>
                        <i v-if="sub.children && sub.children.length" class="fas fa-chevron-right submenu-chevron"></i>
                      </nuxt-link>
                      
                      <!-- Level 3 Submenu -->
                      <ul v-if="sub.children && sub.children.length" class="submenu-list">
                        <li v-for="subSub in sub.children" :key="subSub.id">
                          <nuxt-link :to="`/products?categoryId=${subSub.id}`" @click="catOpen = false">
                            <span>{{ subSub.name }}</span>
                          </nuxt-link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </Transition>
          </div>
          <ul class="main-menu">
            <li v-for="link in topMenus" :key="'top-' + link.id">
              <template v-if="isExternal(link.url)">
                <a :href="link.url" target="_blank" rel="noopener">{{ link.name }}</a>
              </template>
              <template v-else>
                <nuxt-link :to="link.url">{{ link.name }}</nuxt-link>
              </template>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    <!-- Mobile Drawer Overlay -->
    <div v-show="isMobileMenuOpen" class="mobile-drawer-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Mobile Drawer -->
    <Transition name="slide-drawer">
      <aside class="mobile-drawer" v-show="isMobileMenuOpen">
        <div class="drawer-header">
          <img src="/icons/logo_256.png" alt="Demo-store" class="drawer-logo" />
          <button class="drawer-close" @click="isMobileMenuOpen = false" aria-label="Close menu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="drawer-content">
          <div class="drawer-section">
            <h4 class="drawer-section-title">Main Menu</h4>
            <ul class="drawer-menu">
              <li v-for="link in topMenus" :key="'mob-top-' + link.id">
                <template v-if="isExternal(link.url)">
                  <a :href="link.url" target="_blank" rel="noopener" @click="isMobileMenuOpen = false">
                    <i :class="getMenuIcon(link.name)"></i> {{ link.name }}
                  </a>
                </template>
                <template v-else>
                  <nuxt-link :to="link.url" @click="isMobileMenuOpen = false">
                    <i :class="getMenuIcon(link.name)"></i> {{ link.name }}
                  </nuxt-link>
                </template>
              </li>
            </ul>
          </div>

          <div class="drawer-section">
            <h4 class="drawer-section-title">Categories</h4>
            <ul class="drawer-menu">
              <template v-for="cat in categories" :key="'mob-' + cat.id">
                <li>
                  <nuxt-link :to="`/products?categoryId=${cat.id}`" @click="isMobileMenuOpen = false">
                    <i :class="getCatIcon(cat.name)"></i> <strong>{{ cat.name }}</strong>
                  </nuxt-link>
                </li>
                <!-- Level 2 Mobile -->
                <template v-if="cat.children && cat.children.length">
                  <template v-for="sub in cat.children" :key="'mob-sub-' + sub.id">
                    <li class="mobile-submenu-item">
                      <nuxt-link :to="`/products?categoryId=${sub.id}`" @click="isMobileMenuOpen = false">
                        <i class="fas fa-angle-right"></i> {{ sub.name }}
                      </nuxt-link>
                    </li>
                    <!-- Level 3 Mobile -->
                    <template v-if="sub.children && sub.children.length">
                      <li v-for="subSub in sub.children" :key="'mob-subsub-' + subSub.id" class="mobile-subsubmenu-item">
                        <nuxt-link :to="`/products?categoryId=${subSub.id}`" @click="isMobileMenuOpen = false">
                          <i class="fas fa-angle-double-right"></i> {{ subSub.name }}
                        </nuxt-link>
                      </li>
                    </template>
                  </template>
                </template>
              </template>
            </ul>
          </div>

          <div class="drawer-section drawer-account">
            <h4 class="drawer-section-title">Account</h4>
            <ul class="drawer-menu">
              <li v-if="auth.isLoggedIn">
                <nuxt-link to="/profile" @click="isMobileMenuOpen = false">
                  <i class="fas fa-user"></i> {{ auth.userName }}
                </nuxt-link>
              </li>
              <li v-else>
                <nuxt-link to="/login" @click="isMobileMenuOpen = false">
                  <i class="fas fa-sign-in-alt"></i> Log in / Sign up
                </nuxt-link>
              </li>
              <li v-if="auth.isLoggedIn">
                <a href="#" @click.prevent="auth.logout(); isMobileMenuOpen = false">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </Transition>

    <main class="container">
      <slot />
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-features">
          <div class="feature-item">
            <i class="fas fa-headset"></i>
            <div>
              <h4>SUPPORT</h4>
              <p>CALL US 9am-7pm</p>
            </div>
          </div>
          <div class="feature-item">
            <i class="fas fa-truck"></i>
            <div>
              <h4>SHIPPING</h4>
              <p>70 tk* Inside Dhaka City</p>
            </div>
          </div>
          <div class="feature-item">
            <i class="fas fa-exchange-alt"></i>
            <div>
              <h4>EXCHANGE</h4>
              <p>Faulty products will be exchanged</p>
            </div>
          </div>
          <div class="feature-item">
            <i class="fas fa-shield-alt"></i>
            <div>
              <h4>SECURE</h4>
              <p>Cash on Delivery All over Bangladesh</p>
            </div>
          </div>
        </div>
        
        <div class="footer-content">
          <div class="footer-about">
            <h2>Demo-store</h2>
            <p>Your Trusted Wholesale and B2B Business Partner. Providing the best packaging and retail products across the country.</p>
            <div class="footer-social">
              <a href="#"><i class="fab fa-facebook-f"></i></a>
              <a href="#"><i class="fab fa-instagram"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          
          <div class="footer-links">
            <div>
              <h4>Essential Machines</h4>
              <ul>
                <li><a href="#">Weight Machine</a></li>
                <li><a href="#">Numbering Machine</a></li>
                <li><a href="#">Packaging Essential</a></li>
                <li><a href="#">Tissue Bags</a></li>
              </ul>
            </div>
            <div>
              <h4>Printing & Box</h4>
              <ul>
                <li><a href="#">Customized Box</a></li>
                <li><a href="#">Regular Box</a></li>
                <li><a href="#">Die Cut Box</a></li>
                <li><a href="#">Shoe Box</a></li>
              </ul>
            </div>
            <div>
              <h4>Information</h4>
              <ul>
                <li v-for="link in footerMenus" :key="'foot-' + link.id">
                  <template v-if="isExternal(link.url)">
                    <a :href="link.url" target="_blank" rel="noopener">{{ link.name }}</a>
                  </template>
                  <template v-else>
                    <nuxt-link :to="link.url">{{ link.name }}</nuxt-link>
                  </template>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>363/1 Elephant Road, Dhaka-1205. Near Eastern Mollika Shopping Complex</span>
              </li>
              <li>
                <i class="fas fa-phone-alt"></i>
                <span>+88-01567865139</span>
              </li>
              <li>
                <i class="fas fa-envelope"></i>
                <span>support@demostore.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="container">
          <p>Copyright © 2026 Demo-store</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '~/stores/cart';
import { useAuthStore } from '~/stores/auth';

const cart = useCartStore();
const auth = useAuthStore();
const route = useRoute();
const config = useRuntimeConfig();

// ─── Dynamic Menus ─────────────────────────────────────────────────────────
const menus = ref([]);
const fetchMenus = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/menus`);
    menus.value = data || [];
  } catch (e) {
    console.error('Failed to fetch menus:', e);
  }
};

const topMenus = computed(() => {
  return menus.value.filter(m => m.type === 'top');
});

const footerMenus = computed(() => {
  return menus.value.filter(m => m.type === 'footer');
});

const isExternal = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};

const menuIconMap = {
  home: 'fas fa-home',
  product: 'fas fa-shopping-bag',
  shop: 'fas fa-shopping-bag',
  about: 'fas fa-info-circle',
  contact: 'fas fa-envelope',
  faq: 'fas fa-question-circle',
  delivery: 'fas fa-truck',
  rule: 'fas fa-truck',
  default: 'fas fa-link'
};

const getMenuIcon = (name) => {
  if (!name) return menuIconMap.default;
  const key = Object.keys(menuIconMap).find(k => name.toLowerCase().includes(k));
  return menuIconMap[key] || menuIconMap.default;
};

// ─── Search Bar ────────────────────────────────────────────────────────────
const searchQuery = ref(route.query.search || '');
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/products?search=${encodeURIComponent(searchQuery.value.trim())}`);
  } else {
    navigateTo('/products');
  }
};

// Keep search input synced with router query changes
watch(() => route.query.search, (val) => {
  searchQuery.value = val || '';
});

// ─── Mobile Drawer ─────────────────────────────────────────────────────────
const isMobileMenuOpen = ref(false);

// ─── Category List ─────────────────────────────────────────────────────────
const categories = ref([]);
const fetchCategories = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/categories`);
    categories.value = data || [];
  } catch (e) {
    console.error('Failed to fetch categories:', e);
  }
};

const catIconMap = {
  electronics: 'fas fa-laptop', fashion: 'fas fa-tshirt', home: 'fas fa-home',
  sports: 'fas fa-dumbbell', grocery: 'fas fa-apple-alt', smartphones: 'fas fa-mobile-alt',
  laptops: 'fas fa-laptop-code', accessories: 'fas fa-headphones', default: 'fas fa-th-large'
};

const getCatIcon = (name) => {
  if (!name) return catIconMap.default;
  const key = Object.keys(catIconMap).find(k => name.toLowerCase().includes(k));
  return catIconMap[key] || catIconMap.default;
};

// ─── Category dropdown (Desktop) ───────────────────────────────────────────
const isHome = computed(() => route.path === '/');
const catOpen = ref(false);
const catDropdown = ref(null);

// On home page: always open. On other pages: closed by default.
watch(isHome, (home) => {
  catOpen.value = home;
}, { immediate: true });

// Also close when navigating away from home
watch(() => route.path, () => {
  if (route.path !== '/') catOpen.value = false;
});

const toggleCat = () => {
  catOpen.value = !catOpen.value;
};

// Click outside to close (only matters on non-home pages)
const handleClickOutside = (e) => {
  if (catDropdown.value && !catDropdown.value.contains(e.target)) {
    if (!isHome.value) catOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside, true);
  await Promise.all([
    fetchCategories(),
    fetchMenus()
  ]);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<style>
.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  padding: 0 3px;
  position: absolute;
  top: -6px;
  right: -8px;
}

.action-icon-wrap {
  position: relative;
  display: inline-flex;
}

/* Chevron rotation when open */
.chevron {
  transition: transform 0.25s ease;
}
.chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown-header cursor always pointer */
.dropdown-header {
  cursor: pointer;
  user-select: none;
}

/* Non-home: header shows a subtle hover hint */
.dropdown-header:hover {
  opacity: 0.9;
}

/* Slide transition for the dropdown list */
.cat-drop-enter-active,
.cat-drop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.cat-drop-enter-from,
.cat-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Styling for nested multilevel menu */
.dropdown-list li {
  position: relative;
}

.header-nav .dropdown-list li a {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}

.cat-link-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.submenu-chevron {
  font-size: 11px;
  color: #999;
}

.dropdown-list li .submenu-list {
  position: absolute;
  top: 0;
  left: 100%;
  width: 250px;
  background-color: var(--white);
  border: 1px solid #eee;
  border-radius: 0 8px 8px 8px;
  box-shadow: 8px 8px 24px rgba(0, 0, 0, 0.12);
  display: none;
  flex-direction: column;
  z-index: 101;
}

.dropdown-list li:hover > .submenu-list {
  display: flex;
}

/* Mobile drawer submenu styling */
.mobile-submenu-item {
  padding-left: 20px;
}
.mobile-subsubmenu-item {
  padding-left: 35px;
}
</style>
