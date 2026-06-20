<template>
  <div class="page-wrapper container">
    <h1 class="page-title"><i class="fas fa-shopping-cart"></i> Shopping Cart</h1>

    <!-- Empty -->
    <div v-if="cart.items.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-cart-shopping"></i></div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything yet.</p>
      <NuxtLink to="/products" class="btn-primary">
        <i class="fas fa-arrow-left"></i> Continue Shopping
      </NuxtLink>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-layout">
      <!-- Items -->
      <div class="cart-items">
        <div class="cart-header-row">
          <span>Product</span><span>Price</span><span>Qty</span><span>Total</span><span></span>
        </div>

        <div v-for="item in cart.items" :key="item.key" class="cart-item">
          <!-- Image -->
          <div class="item-img-wrap">
            <img :src="resolveImg(item.product.image)" :alt="item.product.name">
          </div>

          <!-- Name + variation -->
          <div class="item-info">
            <NuxtLink :to="`/products/${item.product.id}`" class="item-name">{{ item.product.name }}</NuxtLink>
            <span v-if="item.variation" class="item-variation">{{ item.variation.name }}</span>
            <span class="item-cat">{{ item.product.Category?.name }}</span>
          </div>

          <!-- Unit price -->
          <div class="item-price">৳{{ Number(item.variation?.price || item.product.price).toLocaleString() }}</div>

          <!-- Qty control -->
          <div class="item-qty">
            <button class="qty-btn" @click="cart.updateQty(item.key, item.quantity - 1)">-</button>
            <input
              type="number" min="1"
              :value="item.quantity"
              @change="e => cart.updateQty(item.key, +e.target.value)"
              class="qty-input"
            >
            <button class="qty-btn" @click="cart.updateQty(item.key, item.quantity + 1)">+</button>
          </div>

          <!-- Row total -->
          <div class="item-total">
            ৳{{ Number((item.variation?.price || item.product.price) * item.quantity).toLocaleString() }}
          </div>

          <!-- Remove -->
          <button class="item-remove" @click="cart.removeFromCart(item.key)" title="Remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>

        <!-- Actions row -->
        <div class="cart-actions">
          <NuxtLink to="/products" class="btn-outline"><i class="fas fa-arrow-left"></i> Continue Shopping</NuxtLink>
          <button class="btn-danger-sm" @click="cart.clearCart()"><i class="fas fa-times"></i> Clear Cart</button>
        </div>
      </div>

      <!-- Summary sidebar -->
      <div class="cart-summary">
        <h3 class="summary-title">Order Summary</h3>

        <div class="summary-line">
          <span>Subtotal ({{ cart.cartCount }} items)</span>
          <strong>৳{{ Number(cart.cartTotal).toLocaleString() }}</strong>
        </div>
        <div class="summary-line">
          <span>Shipping</span>
          <span class="shipping-note">Calculated at checkout</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-line total-line">
          <span>Estimated Total</span>
          <strong>৳{{ Number(cart.cartTotal).toLocaleString() }}</strong>
        </div>

        <NuxtLink to="/checkout" class="btn-checkout">
          <i class="fas fa-lock"></i> Proceed to Checkout
        </NuxtLink>

        <div class="secure-note">
          <i class="fas fa-shield-alt"></i> Secure checkout · SSL encrypted
        </div>

        <!-- Wishlist quick-view -->
        <div class="wishlist-promo" v-if="cart.wishlist.length">
          <NuxtLink to="/wishlist">
            <i class="far fa-heart"></i> You have {{ cart.wishlist.length }} item(s) in your wishlist
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart';

const cart = useCartStore();
const config = useRuntimeConfig();
const IMG = config.public.imageBase;

const resolveImg = (path) => {
  if (!path) return 'https://picsum.photos/80/80';
  if (path.startsWith('http')) return path;
  return `${IMG}${path.startsWith('/') ? path : '/' + path}`;
};

useHead({ title: 'Shopping Cart — Demo Store' });
</script>

<style scoped>
.page-wrapper { padding: 2rem 0 4rem; }
.page-title { font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.6rem; }
.page-title i { color: #6366f1; }

/* Empty */
.empty-state { text-align: center; padding: 5rem 1rem; }
.empty-icon { font-size: 4rem; color: #d1d5db; margin-bottom: 1.5rem; }
.empty-state h2 { font-size: 1.4rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem; }
.empty-state p { color: #9ca3af; margin-bottom: 1.5rem; }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: #6366f1; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; text-decoration: none; transition: background 0.2s; }
.btn-primary:hover { background: #4f46e5; }

/* Layout */
.cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }

/* Items table */
.cart-items { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
.cart-header-row { display: grid; grid-template-columns: 80px 1fr 120px 120px 100px 40px; gap: 1rem; padding: 0.85rem 1.25rem; background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }

.cart-item { display: grid; grid-template-columns: 80px 1fr 120px 120px 100px 40px; gap: 1rem; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
.cart-item:last-of-type { border-bottom: none; }
.cart-item:hover { background: #fafafa; }

.item-img-wrap { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0; }
.item-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

.item-info { display: flex; flex-direction: column; gap: 0.2rem; }
.item-name { font-size: 0.9rem; font-weight: 600; color: #111827; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-name:hover { color: #6366f1; }
.item-variation { font-size: 0.72rem; background: #eef2ff; color: #4f46e5; padding: 0.1rem 0.4rem; border-radius: 4px; width: fit-content; }
.item-cat { font-size: 0.72rem; color: #9ca3af; }

.item-price { font-size: 0.9rem; color: #374151; font-weight: 500; }
.item-total { font-size: 0.95rem; font-weight: 700; color: #111827; }

/* Qty control */
.item-qty { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 8px; overflow: hidden; width: fit-content; }
.qty-btn { width: 30px; height: 32px; background: #f9fafb; border: none; font-size: 1rem; cursor: pointer; color: #374151; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
.qty-btn:hover { background: #eef2ff; color: #6366f1; }
.qty-input { width: 42px; height: 32px; text-align: center; border: none; border-left: 1.5px solid #e5e7eb; border-right: 1.5px solid #e5e7eb; font-size: 0.9rem; font-weight: 600; }

.item-remove { width: 32px; height: 32px; border-radius: 8px; background: none; border: 1px solid #fecaca; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: all 0.2s; }
.item-remove:hover { background: #fee2e2; }

/* Actions row */
.cart-actions { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: #f9fafb; border-top: 1px solid #e5e7eb; }
.btn-outline { display: inline-flex; align-items: center; gap: 0.4rem; border: 1.5px solid #e5e7eb; color: #374151; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.btn-outline:hover { border-color: #6366f1; color: #6366f1; }
.btn-danger-sm { display: inline-flex; align-items: center; gap: 0.4rem; border: 1.5px solid #fecaca; color: #ef4444; background: none; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-danger-sm:hover { background: #fee2e2; }

/* Summary */
.cart-summary { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; position: sticky; top: 80px; }
.summary-title { font-size: 1.1rem; font-weight: 800; color: #111827; margin-bottom: 1.25rem; }
.summary-line { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #374151; margin-bottom: 0.75rem; }
.shipping-note { font-size: 0.75rem; color: #6366f1; font-style: italic; }
.summary-divider { border: none; border-top: 1px dashed #e5e7eb; margin: 1rem 0; }
.total-line { font-size: 1rem; font-weight: 700; }
.total-line strong { font-size: 1.2rem; color: #111827; }

.btn-checkout { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.85rem; border-radius: 12px; background: #6366f1; color: #fff; font-size: 0.95rem; font-weight: 700; text-decoration: none; margin-top: 1.25rem; transition: background 0.2s, transform 0.15s; }
.btn-checkout:hover { background: #4f46e5; transform: translateY(-1px); }

.secure-note { text-align: center; font-size: 0.72rem; color: #9ca3af; margin-top: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
.secure-note i { color: #10b981; }

.wishlist-promo { margin-top: 1rem; border-top: 1px solid #f3f4f6; padding-top: 1rem; }
.wishlist-promo a { font-size: 0.8rem; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 0.4rem; }
.wishlist-promo a:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-header-row, .cart-item { grid-template-columns: 64px 1fr auto; }
  .cart-header-row span:nth-child(2), .cart-header-row span:nth-child(3),
  .cart-header-row span:nth-child(4), .item-price, .item-total { display: none; }
}
</style>
