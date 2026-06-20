<template>
  <div class="products-listing container">
    <div class="listing-header">
      <h1 class="page-title">
        {{ activeCategory ? formatTitle(activeCategory.name) : (featuredOnly ? '⭐ Featured Products' : 'All Products') }}
      </h1>
      <span class="total-count">{{ total }} products</span>
    </div>

    <!-- Filters bar -->
    <div class="filters-bar">
      <div class="filter-search">
        <i class="fas fa-search"></i>
        <input v-model="filters.search" type="text" placeholder="Search products..." @input="debouncedFetch">
      </div>
      <div class="filter-group">
        <select v-model="filters.categoryId" @change="doFetch">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select v-model="filters.sort" @change="doFetch">
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="products-grid">
      <div v-for="n in 12" :key="n" class="skeleton-card"></div>
    </div>
    <div v-else-if="products.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>No products found</p>
      <button @click="resetFilters" class="btn-reset">Clear Filters</button>
    </div>
    <div v-else class="products-grid">
      <ProductCard v-for="p in products" :key="p.id" :product="p" />
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="filters.page === 1" @click="changePage(filters.page - 1)" class="page-btn">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">Page {{ filters.page }} of {{ totalPages }}</span>
      <button :disabled="filters.page === totalPages" @click="changePage(filters.page + 1)" class="page-btn">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, provide, watch } from 'vue';

const config = useRuntimeConfig();
const API = config.public.apiBase;
const IMG = config.public.imageBase;
const route = useRoute();

const resolveImg = (path) => {
  if (!path) return 'https://picsum.photos/400/400?random=1';
  if (path.startsWith('http')) return path;
  return `${IMG}${path.startsWith('/') ? path : '/' + path}`;
};
provide('resolveImg', resolveImg);

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const total = ref(0);
const totalPages = ref(1);

const filters = reactive({
  search: route.query.search || '',
  categoryId: route.query.categoryId || '',
  featured: route.query.featured === 'true' ? 'true' : '',
  sort: route.query.sort || 'newest',
  page: 1,
  limit: 20
});

const featuredOnly = computed(() => filters.featured === 'true');
const activeCategory = computed(() => categories.value.find(c => c.id == filters.categoryId) || null);

const doFetch = async () => {
  loading.value = true;
  const params = new URLSearchParams({
    status: 'active',
    limit: filters.limit,
    page: filters.page,
  });
  if (filters.search)     params.append('search', filters.search);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.featured)   params.append('featured', filters.featured);
  if (filters.sort)       params.append('sort', filters.sort);

  try {
    const res = await $fetch(`${API}/products?${params}`);
    products.value = res.data || [];
    total.value = res.total || 0;
    totalPages.value = res.pages || 1;
  } catch (e) {
    console.error(e);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

let debounceTimer = null;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  filters.page = 1;
  debounceTimer = setTimeout(doFetch, 400);
};

const changePage = (p) => { filters.page = p; doFetch(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
const resetFilters = () => { filters.search = ''; filters.categoryId = ''; filters.featured = ''; filters.page = 1; doFetch(); };

const formatTitle = (name) => {
  return name ? name.replace(/^[—\s\u00A0\-]+/g, '') : '';
};

const flattenCategories = (list, depth = 0) => {
  const flat = [];
  list.forEach(item => {
    flat.push({
      id: item.id,
      name: '— '.repeat(depth) + item.name
    });
    if (item.children && item.children.length) {
      flat.push(...flattenCategories(item.children, depth + 1));
    }
  });
  return flat;
};

onMounted(async () => {
  const catsTree = await $fetch(`${API}/categories`);
  categories.value = flattenCategories(catsTree);
  doFetch();
});

useHead({ title: 'Products — Demo Store' });
</script>

<style scoped>
.products-listing { padding: 2rem 0 4rem; }
.listing-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #111827; }
.total-count { font-size: 0.85rem; color: #9ca3af; }

.filters-bar { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.filter-search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 0.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 0 0.75rem; background: #fff; }
.filter-search i { color: #9ca3af; }
.filter-search input { border: none; outline: none; flex: 1; padding: 0.6rem 0; font-size: 0.875rem; }
.filter-group { display: flex; gap: 0.75rem; }
.filter-group select { border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 0.6rem 1rem; font-size: 0.875rem; background: #fff; color: #374151; cursor: pointer; }
.filter-group select:focus { outline: none; border-color: #6366f1; }

.products-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; }
.skeleton-card { height: 300px; border-radius: 16px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }

.empty-state { text-align: center; padding: 4rem; color: #9ca3af; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; color: #d1d5db; }
.btn-reset { margin-top: 1rem; padding: 0.5rem 1.25rem; border-radius: 8px; background: #6366f1; color: #fff; border: none; cursor: pointer; font-weight: 600; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 3rem; }
.page-btn { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #e5e7eb; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #374151; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.875rem; color: #6b7280; font-weight: 500; }

@media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); } .filter-group { flex-wrap: wrap; } }
</style>
