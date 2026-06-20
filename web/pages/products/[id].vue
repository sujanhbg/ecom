<template>
  <div class="product-detail-page container">

    <!-- Loading -->
    <div v-if="loading" class="detail-loading">
      <div class="skeleton-detail-img"></div>
      <div class="skeleton-detail-info">
        <div class="sk sk-title"></div>
        <div class="sk sk-price"></div>
        <div class="sk sk-text"></div>
        <div class="sk sk-text"></div>
        <div class="sk sk-btn"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="detail-error">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Product not found</h2>
      <NuxtLink to="/products" class="back-link"><i class="fas fa-arrow-left"></i> Browse Products</NuxtLink>
    </div>

    <!-- Product -->
    <template v-else-if="product">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <NuxtLink to="/">Home</NuxtLink>
        <span>/</span>
        <NuxtLink to="/products">Products</NuxtLink>
        <span v-if="product.Category">/</span>
        <NuxtLink v-if="product.Category" :to="`/products?categoryId=${product.Category.id}`">{{ product.Category.name }}</NuxtLink>
        <span>/</span>
        <span class="current">{{ product.name }}</span>
      </nav>

      <div class="detail-grid">
        <!-- ── Left: Image Gallery ── -->
        <div class="gallery-col">
          <!-- Main image -->
          <div class="main-img-wrap">
            <img :src="activeImg" :alt="product.name" class="main-img" @click="openLightbox(activeImgIdx)">
            <!-- discount badge -->
            <span v-if="discount > 0" class="gallery-badge">-{{ discount }}%</span>
          </div>

          <!-- Thumbnails -->
          <div class="thumbs" v-if="allImages.length > 1">
            <div
              v-for="(img, i) in allImages"
              :key="i"
              class="thumb"
              :class="{ active: activeImgIdx === i }"
              @click="activeImgIdx = i"
            >
              <img :src="resolveImg(img)" :alt="'thumb '+i">
            </div>
          </div>

          <!-- Videos -->
          <div class="videos-section" v-if="videos.length">
            <h4 class="sub-heading"><i class="fas fa-play-circle"></i> Product Videos</h4>
            <div class="videos-row">
              <video v-for="(v, i) in videos" :key="i" :src="resolveImg(v)" controls class="product-video"></video>
            </div>
          </div>
        </div>

        <!-- ── Right: Product Info ── -->
        <div class="info-col">
          <!-- Category & Status -->
          <div class="info-meta">
            <NuxtLink v-if="product.Category" :to="`/products?categoryId=${product.Category.id}`" class="info-cat">
              {{ product.Category.name }}
            </NuxtLink>
            <span :class="['status-pill', product.status]">{{ product.status }}</span>
          </div>

          <h1 class="product-name">{{ product.name }}</h1>

          <!-- Sold + Stock -->
          <div class="sold-stock">
            <span v-if="soldQty > 0" class="sold-count"><i class="fas fa-fire"></i> {{ soldQty }} sold</span>
            <span class="divider" v-if="soldQty > 0 && product.stock > 0">·</span>
            <span v-if="product.stock <= 0" class="stock-pill out">Out of Stock</span>
            <span v-else-if="product.stock <= 5" class="stock-pill low">Only {{ product.stock }} left!</span>
            <span v-else class="stock-pill ok"><i class="fas fa-check-circle"></i> In Stock ({{ product.stock }})</span>
          </div>

          <!-- SKU -->
          <p class="sku-line" v-if="product.sku">SKU: <strong>{{ product.sku }}</strong></p>

          <!-- Price -->
          <div class="price-block">
            <span class="price-main">৳{{ Number(selectedPrice).toLocaleString() }}</span>
            <span v-if="product.comparePrice" class="price-compare">৳{{ Number(product.comparePrice).toLocaleString() }}</span>
            <span v-if="discount > 0" class="save-tag">Save {{ discount }}%</span>
          </div>

          <!-- Variations -->
          <div class="variations-block" v-if="product.variations?.length">
            <div class="var-label">Select Variation:</div>
            <div class="var-options">
              <button
                v-for="v in product.variations"
                :key="v.id"
                :class="['var-option', { selected: selectedVariation?.id === v.id, out: v.stock <= 0 }]"
                @click="selectVariation(v)"
                :disabled="v.stock <= 0"
                :title="v.stock <= 0 ? 'Out of stock' : ''"
              >
                {{ v.name }}
                <span v-if="v.stock <= 0" class="var-out">✕</span>
              </button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="qty-block">
            <div class="qty-label">Quantity:</div>
            <div class="qty-control">
              <button class="qty-btn" @click="qty = Math.max(1, qty - 1)">-</button>
              <input v-model.number="qty" type="number" min="1" :max="maxQty" class="qty-input">
              <button class="qty-btn" @click="qty = Math.min(maxQty, qty + 1)">+</button>
            </div>
          </div>

          <!-- Actions -->
          <div class="action-btns">
            <button class="btn-primary-lg" :disabled="product.stock <= 0" @click="addToCart">
              <i class="fas fa-shopping-cart"></i>
              {{ product.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>
            <button :class="['btn-wish', { wished: isWished }]" @click="toggleWish" :title="isWished ? 'Remove from wishlist' : 'Save to wishlist'">
              <i :class="isWished ? 'fas fa-heart' : 'far fa-heart'"></i>
              {{ isWished ? 'Wishlisted' : 'Wishlist' }}
            </button>
          </div>

          <!-- Toast feedback -->
          <Transition name="toast">
            <div v-if="showToast" class="cart-toast">
              <i class="fas fa-check-circle"></i> Added to cart!
            </div>
          </Transition>

          <!-- Meta info -->
          <div class="product-meta-grid">
            <div v-if="product.unit" class="meta-row"><span>Unit</span><strong>{{ product.unit }}</strong></div>
            <div v-if="product.Supplier" class="meta-row"><span>Brand / Supplier</span><strong>{{ product.Supplier.name }}</strong></div>
            <div class="meta-row"><span>Category</span><strong>{{ product.Category?.name || '—' }}</strong></div>
          </div>

          <!-- Description -->
          <div class="description-block" v-if="product.description">
            <h3 class="sub-heading">Description</h3>
            <p class="desc-text">{{ product.description }}</p>
          </div>
        </div>
      </div>

      <!-- Lightbox -->
      <Transition name="fade">
        <div v-if="lightbox.open" class="lightbox" @click.self="lightbox.open = false">
          <button class="lb-close" @click="lightbox.open = false"><i class="fas fa-times"></i></button>
          <button class="lb-prev" @click="lbPrev"><i class="fas fa-chevron-left"></i></button>
          <img :src="resolveImg(allImages[lightbox.idx])" class="lb-img">
          <button class="lb-next" @click="lbNext"><i class="fas fa-chevron-right"></i></button>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCartStore } from '~/stores/cart';

const route  = useRoute();
const config = useRuntimeConfig();
const API = config.public.apiBase;
const IMG = config.public.imageBase;

const resolveImg = (path) => {
  if (!path) return 'https://picsum.photos/600/600?random=99';
  if (path.startsWith('http')) return path;
  return `${IMG}${path.startsWith('/') ? path : '/' + path}`;
};

const parseArr = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  try { const p = JSON.parse(val); return Array.isArray(p) ? p.filter(Boolean) : []; } catch { return []; }
};

// ─── Data ───────────────────────────────────────────────────────────────────
const product = ref(null);
const loading = ref(true);
const error   = ref(false);

const { data, pending, error: fetchErr } = await useFetch(`${API}/products/${route.params.id}`);
product.value = data.value;
loading.value  = false;
if (fetchErr.value) error.value = true;

useHead(() => ({
  title: product.value?.metaTitle || (product.value ? `${product.value.name} — Demo Store` : 'Product — Demo Store'),
  meta: [
    { name: 'description', content: product.value?.metaDescription || product.value?.description || 'View details and B2B pricing for this product.' }
  ]
}));

// ─── Gallery ────────────────────────────────────────────────────────────────
const activeImgIdx = ref(0);
const allImages = computed(() => {
  if (!product.value) return [];
  const imgs = [product.value.image, ...parseArr(product.value.images)].filter(Boolean);
  return imgs.length ? imgs : [''];
});
const videos = computed(() => parseArr(product.value?.videos));
const activeImg = computed(() => resolveImg(allImages.value[activeImgIdx.value]));

// ─── Lightbox ────────────────────────────────────────────────────────────────
const lightbox = reactive({ open: false, idx: 0 });
const openLightbox = (i) => { lightbox.idx = i; lightbox.open = true; };
const lbPrev = () => lightbox.idx = (lightbox.idx - 1 + allImages.value.length) % allImages.value.length;
const lbNext = () => lightbox.idx = (lightbox.idx + 1) % allImages.value.length;

// ─── Pricing / Variations ────────────────────────────────────────────────────
const selectedVariation = ref(null);
const selectVariation = (v) => {
  selectedVariation.value = selectedVariation.value?.id === v.id ? null : v;
  qty.value = 1;
  if (v.image) activeImgIdx.value = 0;
};
const selectedPrice = computed(() => selectedVariation.value?.price || product.value?.price || 0);
const maxQty = computed(() => selectedVariation.value?.stock || product.value?.stock || 1);
const discount = computed(() => {
  if (!product.value?.comparePrice) return 0;
  return Math.round((1 - product.value.price / product.value.comparePrice) * 100);
});
const soldQty = computed(() => Number(product.value?.soldQuantity) || 0);

// ─── Cart / Wishlist ─────────────────────────────────────────────────────────
const cart = useCartStore();
const qty = ref(1);
const showToast = ref(false);
const isWished = computed(() => cart.isInWishlist(product.value?.id));

const addToCart = () => {
  cart.addToCart(product.value, qty.value, selectedVariation.value);
  showToast.value = true;
  setTimeout(() => showToast.value = false, 2000);
};

const toggleWish = () => cart.toggleWishlist(product.value);
</script>

<style scoped>
.product-detail-page { padding: 2rem 0 4rem; min-height: 60vh; }

/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #9ca3af; margin-bottom: 2rem; flex-wrap: wrap; }
.breadcrumb a { color: #6b7280; text-decoration: none; }
.breadcrumb a:hover { color: #6366f1; }
.breadcrumb .current { color: #374151; font-weight: 500; }

/* Layout */
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }

/* ── Gallery ── */
.gallery-col { position: sticky; top: 80px; }
.main-img-wrap { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 1; background: #f9fafb; border: 1px solid #e5e7eb; cursor: zoom-in; }
.main-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.main-img-wrap:hover .main-img { transform: scale(1.04); }
.gallery-badge { position: absolute; top: 1rem; left: 1rem; background: #ef4444; color: #fff; font-size: 0.8rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; }

.thumbs { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.thumb { width: 68px; height: 68px; border-radius: 10px; overflow: hidden; border: 2px solid #e5e7eb; cursor: pointer; transition: border-color 0.2s; }
.thumb.active { border-color: #6366f1; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.sub-heading { font-size: 0.9rem; font-weight: 700; color: #374151; margin: 1rem 0 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
.videos-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.product-video { width: 100%; max-width: 280px; border-radius: 12px; border: 1px solid #e5e7eb; }

/* ── Info ── */
.info-col { }
.info-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.info-cat { font-size: 0.75rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.06em; text-decoration: none; background: #eef2ff; padding: 0.2rem 0.6rem; border-radius: 999px; }
.info-cat:hover { background: #e0e7ff; }
.status-pill { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 999px; text-transform: capitalize; }
.status-pill.active   { background: #d1fae5; color: #065f46; }
.status-pill.inactive { background: #fee2e2; color: #991b1b; }
.status-pill.draft    { background: #fef3c7; color: #92400e; }

.product-name { font-size: 1.75rem; font-weight: 800; color: #111827; line-height: 1.3; margin-bottom: 0.75rem; }

.sold-stock { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.sold-count { color: #f97316; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
.divider { color: #d1d5db; }
.stock-pill { font-weight: 600; padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.8rem; }
.stock-pill.ok  { background: #d1fae5; color: #065f46; }
.stock-pill.low { background: #fef3c7; color: #92400e; }
.stock-pill.out { background: #fee2e2; color: #991b1b; }

.sku-line { font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.75rem; }

.price-block { display: flex; align-items: baseline; gap: 0.75rem; margin: 1rem 0; }
.price-main    { font-size: 2rem; font-weight: 800; color: #111827; }
.price-compare { font-size: 1.1rem; color: #9ca3af; text-decoration: line-through; }
.save-tag { font-size: 0.75rem; font-weight: 700; background: #fef3c7; color: #92400e; padding: 0.2rem 0.6rem; border-radius: 999px; }

/* Variations */
.variations-block { margin-bottom: 1.25rem; }
.var-label { font-size: 0.8rem; font-weight: 600; color: #6b7280; margin-bottom: 0.5rem; }
.var-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.var-option {
  padding: 0.4rem 1rem; border-radius: 8px; border: 1.5px solid #e5e7eb;
  font-size: 0.85rem; font-weight: 500; cursor: pointer;
  background: #fff; color: #374151; transition: all 0.2s; position: relative;
}
.var-option:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.var-option.selected { border-color: #6366f1; background: #eef2ff; color: #4f46e5; font-weight: 700; }
.var-option.out { opacity: 0.4; cursor: not-allowed; }
.var-out { position: absolute; top: -4px; right: -4px; font-size: 0.6rem; background: #ef4444; color: #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }

/* Quantity */
.qty-block { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.qty-label { font-size: 0.85rem; font-weight: 600; color: #6b7280; }
.qty-control { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.qty-btn { width: 36px; height: 36px; background: #f9fafb; border: none; font-size: 1.1rem; cursor: pointer; color: #374151; transition: background 0.2s; }
.qty-btn:hover { background: #eef2ff; color: #6366f1; }
.qty-input { width: 50px; height: 36px; text-align: center; border: none; border-left: 1.5px solid #e5e7eb; border-right: 1.5px solid #e5e7eb; font-size: 0.95rem; font-weight: 600; }

/* Action Buttons */
.action-btns { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.btn-primary-lg {
  flex: 1; min-width: 160px; padding: 0.85rem 1.5rem; border-radius: 12px;
  background: #6366f1; color: #fff; font-size: 0.95rem; font-weight: 700;
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary-lg:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); }
.btn-primary-lg:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; transform: none; }
.btn-wish {
  padding: 0.85rem 1.25rem; border-radius: 12px; border: 1.5px solid #e5e7eb;
  background: #fff; color: #6b7280; font-size: 0.9rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s;
}
.btn-wish:hover, .btn-wish.wished { border-color: #ef4444; color: #ef4444; background: #fff5f5; }

/* Toast */
.cart-toast {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;
  padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 600;
  margin-bottom: 0.5rem;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* Meta grid */
.product-meta-grid { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 1.25rem 0; }
.meta-row { display: flex; justify-content: space-between; padding: 0.6rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.85rem; }
.meta-row:last-child { border-bottom: none; }
.meta-row span { color: #6b7280; }
.meta-row strong { color: #111827; }

.description-block { margin-top: 1.5rem; }
.desc-text { font-size: 0.9rem; line-height: 1.75; color: #4b5563; }

/* Lightbox */
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}
.lb-img { max-width: 85vw; max-height: 85vh; border-radius: 12px; object-fit: contain; }
.lb-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.15); color: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lb-prev, .lb-next { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.15); color: #fff; border: none; width: 44px; height: 44px; border-radius: 50%; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lb-prev { left: 1rem; } .lb-next { right: 1rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Loading Skeletons */
.detail-loading { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem 0; }
.skeleton-detail-img { aspect-ratio: 1; border-radius: 20px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; }
.skeleton-detail-info { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
.sk { border-radius: 8px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; }
.sk-title { height: 36px; width: 80%; } .sk-price { height: 48px; width: 40%; } .sk-text { height: 14px; } .sk-btn { height: 48px; border-radius: 12px; }
@keyframes shimmer { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* Error */
.detail-error { text-align: center; padding: 4rem 0; color: #6b7280; }
.detail-error i { font-size: 3rem; color: #fbbf24; display: block; margin-bottom: 1rem; }
.back-link { display: inline-flex; align-items: center; gap: 0.4rem; color: #6366f1; font-weight: 600; text-decoration: none; margin-top: 1rem; }

/* Responsive */
@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .gallery-col { position: static; }
  .product-name { font-size: 1.35rem; }
  .price-main { font-size: 1.5rem; }
}
</style>
