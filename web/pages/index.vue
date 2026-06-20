<template>
  <div class="home-page">

    <!-- Hero Slider -->
    <section class="hero-slider">
      <div class="slider-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="(slide, i) in slides" :key="i" class="slide-item" :style="{ background: slide.bg }">
          <div class="container slide-inner">
            <div class="slide-text">
              <span class="slide-badge">{{ slide.badge }}</span>
              <h1>{{ slide.title }}</h1>
              <p>{{ slide.sub }}</p>
              <NuxtLink :to="`/products?categoryId=${slide.catId}`" class="hero-btn">
                Shop Now <i class="fas fa-arrow-right"></i>
              </NuxtLink>
            </div>
            <div class="slide-img-wrap">
              <img :src="slide.img" :alt="slide.title" class="slide-img">
            </div>
          </div>
        </div>
      </div>
      <div class="slider-dots">
        <button v-for="(s, i) in slides" :key="i" :class="['dot', { active: currentSlide === i }]" @click="goTo(i)"></button>
      </div>
      <button class="slider-arrow prev" @click="prev"><i class="fas fa-chevron-left"></i></button>
      <button class="slider-arrow next" @click="next"><i class="fas fa-chevron-right"></i></button>
    </section>

    <!-- Trust Bar -->
    <section class="trust-bar">
      <div class="container trust-grid">
        <div class="trust-item"><i class="fas fa-shipping-fast"></i><span>Free Shipping over ৳1000</span></div>
        <div class="trust-item"><i class="fas fa-undo"></i><span>Easy Returns</span></div>
        <div class="trust-item"><i class="fas fa-lock"></i><span>Secure Payment</span></div>
        <div class="trust-item"><i class="fas fa-headset"></i><span>24/7 Support</span></div>
      </div>
    </section>

    <!-- Category Browsing -->
    <section class="section container">
      <div class="section-head">
        <h2 class="section-title">Browse Categories</h2>
        <NuxtLink to="/products" class="see-all">View All <i class="fas fa-arrow-right"></i></NuxtLink>
      </div>
      <div v-if="catLoading" class="skeleton-row">
        <div v-for="n in 6" :key="n" class="skeleton-cat"></div>
      </div>
      <div v-else class="cat-grid">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?categoryId=${cat.id}`"
          class="cat-card"
        >
          <div class="cat-icon-wrap">
            <i :class="catIcon(cat.name)"></i>
          </div>
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-count" v-if="cat.children?.length">{{ cat.children.length }} sub</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section container">
      <div class="section-head">
        <h2 class="section-title">⭐ Featured Products</h2>
        <NuxtLink to="/products?featured=true" class="see-all">See All <i class="fas fa-arrow-right"></i></NuxtLink>
      </div>
      <div v-if="featuredLoading" class="skeleton-row">
        <div v-for="n in 4" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else class="products-row">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- Category Sections — one per top-level category -->
    <template v-for="cat in categoryProducts" :key="cat.id">
      <section class="section container" v-if="cat.products.length">
        <div class="section-head">
          <h2 class="section-title">{{ cat.name }}</h2>
          <NuxtLink :to="`/products?categoryId=${cat.id}`" class="see-all">See All <i class="fas fa-arrow-right"></i></NuxtLink>
        </div>
        <div class="products-row">
          <ProductCard v-for="p in cat.products" :key="p.id" :product="p" />
        </div>
      </section>
    </template>

    <!-- New Arrivals -->
    <section class="section container">
      <div class="section-head">
        <h2 class="section-title">🆕 New Arrivals</h2>
        <NuxtLink to="/products" class="see-all">See All <i class="fas fa-arrow-right"></i></NuxtLink>
      </div>
      <div v-if="newLoading" class="skeleton-row">
        <div v-for="n in 5" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else class="products-row">
        <ProductCard v-for="p in newArrivals" :key="p.id" :product="p" />
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const config = useRuntimeConfig();
const API = config.public.apiBase;
const IMG = config.public.imageBase;

// ─── Slider ────────────────────────────────────────────────────────────────
const currentSlide = ref(0);
let timer = null;

const slides = [
  { badge: 'Hot Deals', title: 'Summer Electronics Sale', sub: 'Up to 30% off on smartphones & laptops', bg: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', catId: '', img: 'https://picsum.photos/id/48/600/400' },
  { badge: 'New Arrivals', title: 'Fashion Forward Collection', sub: 'Latest trends for men & women', bg: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)', catId: '', img: 'https://picsum.photos/id/338/600/400' },
  { badge: 'Best Value', title: 'Home & Living Essentials', sub: 'Complete your home with premium goods', bg: 'linear-gradient(135deg,#7c2d12 0%,#9a3412 100%)', catId: '', img: 'https://picsum.photos/id/292/600/400' },
  { badge: 'Top Picks', title: 'Sports & Outdoor Gear', sub: 'Gear up for your next adventure', bg: 'linear-gradient(135deg,#1e3a5f 0%,#1e4976 100%)', catId: '', img: 'https://picsum.photos/id/401/600/400' },
];

const goTo = (i) => { currentSlide.value = i; resetTimer(); };
const next = () => { currentSlide.value = (currentSlide.value + 1) % slides.length; resetTimer(); };
const prev = () => { currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length; resetTimer(); };
const resetTimer = () => { clearInterval(timer); timer = setInterval(next, 5000); };

// ─── Categories ────────────────────────────────────────────────────────────
const categories = ref([]);
const catLoading = ref(true);

const catIconMap = {
  electronics: 'fas fa-laptop', fashion: 'fas fa-tshirt', home: 'fas fa-home',
  sports: 'fas fa-dumbbell', grocery: 'fas fa-apple-alt', smartphones: 'fas fa-mobile-alt',
  laptops: 'fas fa-laptop-code', accessories: 'fas fa-headphones', default: 'fas fa-th-large'
};

const catIcon = (name) => {
  const key = Object.keys(catIconMap).find(k => name.toLowerCase().includes(k));
  return catIconMap[key] || catIconMap.default;
};

// ─── Products ──────────────────────────────────────────────────────────────
const featured = ref([]);
const featuredLoading = ref(true);
const newArrivals = ref([]);
const newLoading = ref(true);
const categoryProducts = ref([]);

const resolveImg = (path) => {
  if (!path) return 'https://picsum.photos/400/400?random=1';
  if (path.startsWith('http')) return path;
  return `${IMG}${path}`;
};

// Expose globally for ProductCard
provide('resolveImg', resolveImg);

const settings = ref(null);

const fetchAll = async () => {
  try {
    // settings
    const settingsRes = await $fetch(`${API}/settings`);
    settings.value = settingsRes;

    // categories
    const cats = await $fetch(`${API}/categories`);
    categories.value = cats;
    slides[0].catId = cats[0]?.id || '';
    slides[1].catId = cats[1]?.id || '';

    // featured
    const featRes = await $fetch(`${API}/products?featured=true&status=active&limit=8`);
    featured.value = featRes.data || [];
    featuredLoading.value = false;

    // new arrivals
    const newRes = await $fetch(`${API}/products?status=active&limit=10`);
    newArrivals.value = newRes.data || [];
    newLoading.value = false;

    // per-category products (top 4 each)
    const catProds = await Promise.all(
      cats.slice(0, 5).map(async (cat) => {
        const res = await $fetch(`${API}/products?categoryId=${cat.id}&status=active&limit=4`);
        return { id: cat.id, name: cat.name, products: res.data || [] };
      })
    );
    categoryProducts.value = catProds;
    catLoading.value = false;
  } catch (e) {
    console.error(e);
    catLoading.value = false;
    featuredLoading.value = false;
    newLoading.value = false;
  }
};

onMounted(() => {
  fetchAll();
  timer = setInterval(next, 5000);
});
onUnmounted(() => clearInterval(timer));

useHead(() => ({
  title: settings.value?.siteTitle || 'Demo Store — Shop Online',
  meta: [
    { name: 'description', content: settings.value?.metaDescription || 'Shop electronics, fashion, home & more at the best prices.' },
    { name: 'keywords', content: settings.value?.metaKeywords || 'B2B, wholesale, packaging' }
  ]
}));
</script>

<style scoped>
/* ─── Hero Slider ─────────────────────────────────────────────────────────── */
.hero-slider {
  position: relative;
  overflow: hidden;
  height: 420px;
}
.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(.4,0,.2,1);
}
.slide-item {
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.slide-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2rem;
  height: 100%;
}
.slide-text { color: #fff; padding: 2rem 0; }
.slide-badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}
.slide-text h1 { font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.75rem; }
.slide-text p  { font-size: 1rem; opacity: 0.85; margin-bottom: 1.5rem; }
.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  color: #1e1b4b;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.hero-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
.slide-img-wrap { display: flex; justify-content: flex-end; }
.slide-img { width: 100%; max-width: 400px; height: 340px; object-fit: cover; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.slider-dots { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.4rem; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.4); border: none; cursor: pointer; transition: width 0.3s, background 0.3s; }
.dot.active { width: 24px; background: #fff; }
.slider-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
.slider-arrow:hover { background: rgba(255,255,255,0.3); }
.slider-arrow.prev { left: 1rem; }
.slider-arrow.next { right: 1rem; }

/* ─── Trust Bar ────────────────────────────────────────────────────────────── */
.trust-bar { background: #f8f9ff; border-bottom: 1px solid #e8e8f0; }
.trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; padding: 0; }
.trust-item { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; border-right: 1px solid #e8e8f0; font-size: 0.875rem; font-weight: 500; color: #374151; }
.trust-item:last-child { border-right: none; }
.trust-item i { font-size: 1.4rem; color: #6366f1; flex-shrink: 0; }

/* ─── Section Layout ───────────────────────────────────────────────────────── */
.section { padding: 3rem 0; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-title { font-size: 1.4rem; font-weight: 800; color: #111827; }
.see-all { font-size: 0.875rem; color: #6366f1; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.35rem; }
.see-all:hover { text-decoration: underline; }

/* ─── Category Grid ─────────────────────────────────────────────────────── */
.cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
.cat-card {
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  padding: 1.25rem 0.75rem; border-radius: 16px;
  background: #fff; border: 1px solid #e5e7eb;
  text-decoration: none; transition: all 0.2s;
  text-align: center;
}
.cat-card:hover { border-color: #6366f1; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(99,102,241,0.12); }
.cat-icon-wrap { width: 52px; height: 52px; border-radius: 14px; background: #eef2ff; display: flex; align-items: center; justify-content: center; }
.cat-icon-wrap i { font-size: 1.4rem; color: #6366f1; }
.cat-name { font-size: 0.8rem; font-weight: 600; color: #374151; }
.cat-count { font-size: 0.7rem; color: #9ca3af; }

/* ─── Products Row ──────────────────────────────────────────────────────── */
.products-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; }

/* ─── Skeletons ─────────────────────────────────────────────────────────── */
.skeleton-row { display: flex; gap: 1rem; }
.skeleton-card { flex: 1; height: 300px; border-radius: 16px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; }
.skeleton-cat  { flex: 1; height: 100px; border-radius: 16px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .products-row { grid-template-columns: repeat(4, 1fr); }
  .cat-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 768px) {
  .hero-slider { height: 320px; }
  .slide-inner { grid-template-columns: 1fr; }
  .slide-img-wrap { display: none; }
  .slide-text h1 { font-size: 1.5rem; }
  .trust-grid { grid-template-columns: repeat(2, 1fr); }
  .products-row { grid-template-columns: repeat(2, 1fr); }
  .cat-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 480px) {
  .products-row { grid-template-columns: repeat(2, 1fr); }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .trust-grid { grid-template-columns: 1fr; }
}
</style>
