<template>
  <div class="page-wrapper container">
    <h1 class="page-title"><i class="fas fa-heart"></i> My Wishlist</h1>

    <!-- Empty -->
    <div v-if="cart.wishlist.length === 0" class="empty-state">
      <div class="empty-icon"><i class="far fa-heart"></i></div>
      <h2>Your wishlist is empty</h2>
      <p>Save items you love and come back to them anytime.</p>
      <NuxtLink to="/products" class="btn-primary">
        <i class="fas fa-arrow-left"></i> Discover Products
      </NuxtLink>
    </div>

    <!-- Wishlist grid -->
    <div v-else>
      <div class="wish-actions-bar">
        <span class="wish-count">{{ cart.wishlist.length }} item(s) saved</span>
        <button class="btn-add-all" @click="addAllToCart">
          <i class="fas fa-cart-plus"></i> Add All to Cart
        </button>
      </div>

      <div class="wish-grid">
        <div v-for="product in cart.wishlist" :key="product.id" class="wish-card">
          <!-- Remove -->
          <button class="wish-remove" @click="cart.toggleWishlist(product)" title="Remove from wishlist">
            <i class="fas fa-times"></i>
          </button>

          <!-- Image -->
          <NuxtLink :to="`/products/${product.id}`" class="wish-img-wrap">
            <img :src="resolveImg(product.image)" :alt="product.name">
            <div class="wish-overlay"><i class="fas fa-eye"></i> View</div>
          </NuxtLink>

          <!-- Info -->
          <div class="wish-body">
            <span class="wish-cat">{{ product.Category?.name || 'Product' }}</span>
            <NuxtLink :to="`/products/${product.id}`" class="wish-name">{{ product.name }}</NuxtLink>

            <!-- Price -->
            <div class="wish-price">
              <span class="price-main">৳{{ Number(product.price).toLocaleString() }}</span>
              <span v-if="product.comparePrice" class="price-old">৳{{ Number(product.comparePrice).toLocaleString() }}</span>
            </div>

            <!-- Sold -->
            <div v-if="Number(product.soldQuantity) > 0" class="wish-sold">
              <i class="fas fa-fire"></i> {{ product.soldQuantity }} sold
            </div>

            <!-- Stock -->
            <span :class="['wish-stock', product.stock > 0 ? 'in' : 'out']">
              {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
            </span>

            <!-- CTA -->
            <div class="wish-ctas">
              <button
                class="btn-cart-sm"
                :disabled="product.stock <= 0"
                @click="addOne(product)"
              >
                <i class="fas fa-cart-plus"></i>
                {{ product.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart added toast -->
    <Transition name="toast">
      <div v-if="toastVisible" class="global-toast">
        <i class="fas fa-check-circle"></i> Added to cart!
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '~/stores/cart';

const cart = useCartStore();
const config = useRuntimeConfig();
const IMG = config.public.imageBase;

const resolveImg = (path) => {
  if (!path) return 'https://picsum.photos/300/300';
  if (path.startsWith('http')) return path;
  return `${IMG}${path.startsWith('/') ? path : '/' + path}`;
};

const toastVisible = ref(false);
const showToast = () => {
  toastVisible.value = true;
  setTimeout(() => toastVisible.value = false, 2000);
};

const addOne = (product) => {
  cart.addToCart(product);
  showToast();
};

const addAllToCart = () => {
  cart.wishlist.forEach(p => {
    if (p.stock > 0) cart.addToCart(p);
  });
  showToast();
};

useHead({ title: 'Wishlist — Demo Store' });
</script>

<style scoped>
.page-wrapper { padding: 2rem 0 4rem; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; }
.page-title i { color: #ef4444; }

/* Empty */
.empty-state { text-align: center; padding: 5rem 1rem; }
.empty-icon { font-size: 4rem; color: #fca5a5; margin-bottom: 1.5rem; }
.empty-state h2 { font-size: 1.4rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem; }
.empty-state p { color: #9ca3af; margin-bottom: 1.5rem; }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: #6366f1; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; text-decoration: none; }
.btn-primary:hover { background: #4f46e5; }

/* Actions bar */
.wish-actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.wish-count { font-size: 0.9rem; color: #6b7280; font-weight: 500; }
.btn-add-all { display: inline-flex; align-items: center; gap: 0.5rem; background: #6366f1; color: #fff; border: none; padding: 0.65rem 1.25rem; border-radius: 10px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-add-all:hover { background: #4f46e5; }

/* Grid */
.wish-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; }

/* Card */
.wish-card { position: relative; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; transition: all 0.25s; }
.wish-card:hover { border-color: #a5b4fc; box-shadow: 0 12px 32px rgba(99,102,241,0.12); transform: translateY(-3px); }

.wish-remove { position: absolute; top: 0.6rem; right: 0.6rem; z-index: 2; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid #fecaca; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.wish-remove:hover { background: #fee2e2; }

.wish-img-wrap { display: block; aspect-ratio: 1; overflow: hidden; background: #f9fafb; position: relative; }
.wish-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.wish-card:hover .wish-img-wrap img { transform: scale(1.05); }
.wish-overlay { position: absolute; inset: 0; background: rgba(99,102,241,0.7); color: #fff; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem; opacity: 0; transition: opacity 0.25s; }
.wish-card:hover .wish-overlay { opacity: 1; }

.wish-body { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.3rem; }
.wish-cat { font-size: 0.68rem; color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.wish-name { font-size: 0.875rem; font-weight: 600; color: #111827; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.wish-name:hover { color: #6366f1; }

.wish-price { display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.25rem; }
.price-main { font-size: 1rem; font-weight: 800; color: #111827; }
.price-old { font-size: 0.78rem; color: #9ca3af; text-decoration: line-through; }

.wish-sold { font-size: 0.72rem; color: #f97316; font-weight: 600; }
.wish-stock { font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 999px; width: fit-content; }
.wish-stock.in  { background: #d1fae5; color: #065f46; }
.wish-stock.out { background: #fee2e2; color: #991b1b; }

.wish-ctas { margin-top: 0.5rem; }
.btn-cart-sm { width: 100%; padding: 0.55rem; border-radius: 8px; background: #6366f1; color: #fff; font-size: 0.8rem; font-weight: 600; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem; transition: background 0.2s; }
.btn-cart-sm:hover:not(:disabled) { background: #4f46e5; }
.btn-cart-sm:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

/* Toast */
.global-toast { position: fixed; bottom: 2rem; right: 2rem; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; padding: 0.75rem 1.25rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 999; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }

@media (max-width: 1024px) { .wish-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px) { .wish-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
