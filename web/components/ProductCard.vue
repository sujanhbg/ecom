<template>
  <div class="product-card" @click="goDetail">
    <!-- Badges -->
    <div class="card-badges">
      <span v-if="discount > 0" class="badge-discount">-{{ discount }}%</span>
      <span v-if="product.featured" class="badge-featured">⭐ Featured</span>
    </div>

    <!-- Wishlist button -->
    <button class="wishlist-btn" :class="{ active: isWished }" @click.stop="toggleWish" :title="isWished ? 'Remove from wishlist' : 'Add to wishlist'">
      <i :class="isWished ? 'fas fa-heart' : 'far fa-heart'"></i>
    </button>

    <!-- Image -->
    <div class="card-img-wrap">
      <img :src="imgSrc" :alt="product.name" loading="lazy">
    </div>

    <!-- Info -->
    <div class="card-body">
      <span class="card-category">{{ product.Category?.name || 'General' }}</span>
      <h3 class="card-title" :title="product.name">{{ product.name }}</h3>

      <!-- Sold count -->
      <div class="card-sold" v-if="soldQty > 0">
        <i class="fas fa-fire text-orange"></i> {{ soldQty }} sold
      </div>

      <!-- Price -->
      <div class="card-price">
        <span class="price-current">৳{{ Number(product.price).toLocaleString() }}</span>
        <span v-if="product.comparePrice" class="price-old">৳{{ Number(product.comparePrice).toLocaleString() }}</span>
      </div>

      <!-- Stock pill -->
      <div class="card-stock">
        <span v-if="product.stock <= 0" class="stock-out">Out of Stock</span>
        <span v-else-if="product.stock <= 5" class="stock-low">Only {{ product.stock }} left</span>
        <span v-else class="stock-ok">In Stock</span>
      </div>

      <!-- Add to Cart -->
      <button
        class="btn-cart"
        :disabled="product.stock <= 0"
        @click.stop="addCart"
      >
        <i class="fas fa-cart-plus"></i>
        {{ product.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useCartStore } from '~/stores/cart';

const props = defineProps({
  product: { type: Object, required: true }
});

const cart = useCartStore();
const router = useRouter();
const resolveImg = inject('resolveImg', (p) => p || 'https://picsum.photos/400/400');

const imgSrc = computed(() => resolveImg(props.product.image));

const discount = computed(() => {
  if (!props.product.comparePrice) return 0;
  return Math.round((1 - props.product.price / props.product.comparePrice) * 100);
});

const soldQty = computed(() => Number(props.product.soldQuantity) || 0);

const isWished = computed(() => cart.isInWishlist(props.product.id));

const toggleWish = () => cart.toggleWishlist(props.product);
const addCart = () => cart.addToCart(props.product);
const goDetail = () => router.push(`/products/${props.product.id}`);
</script>

<style scoped>
.product-card {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  border-color: #a5b4fc;
  box-shadow: 0 12px 32px rgba(99,102,241,0.12);
  transform: translateY(-4px);
}

/* Badges */
.card-badges {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  display: flex;
  gap: 0.3rem;
  z-index: 2;
  flex-wrap: wrap;
}
.badge-discount, .badge-featured {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.badge-discount { background: #ef4444; color: #fff; }
.badge-featured  { background: #fbbf24; color: #78350f; }

/* Wishlist */
.wishlist-btn {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 2;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: 1px solid #e5e7eb;
  color: #9ca3af;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s;
  cursor: pointer;
}
.wishlist-btn:hover, .wishlist-btn.active { color: #ef4444; border-color: #ef4444; background: #fff5f5; }

/* Image */
.card-img-wrap { aspect-ratio: 1; overflow: hidden; background: #f9fafb; }
.card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.product-card:hover .card-img-wrap img { transform: scale(1.05); }

/* Body */
.card-body { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
.card-category { font-size: 0.68rem; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.06em; }
.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.card-sold { font-size: 0.72rem; color: #f97316; font-weight: 600; }
.text-orange { color: #f97316; margin-right: 3px; }

.card-price { display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.25rem; }
.price-current { font-size: 1.05rem; font-weight: 800; color: #111827; }
.price-old { font-size: 0.8rem; color: #9ca3af; text-decoration: line-through; }

.card-stock { font-size: 0.72rem; font-weight: 500; }
.stock-ok  { color: #16a34a; }
.stock-low { color: #d97706; }
.stock-out { color: #dc2626; }

.btn-cart {
  margin-top: auto;
  width: 100%;
  padding: 0.6rem;
  border-radius: 10px;
  background: #6366f1;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: background 0.2s, transform 0.15s;
}
.btn-cart:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
.btn-cart:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
</style>
