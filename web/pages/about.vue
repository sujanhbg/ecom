<template>
  <div class="static-page container fade-in">
    <div class="page-header-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1>{{ page?.title || 'About Us' }}</h1>
        <p>Learn more about our mission, our history, and our wholesale e-commerce business model.</p>
      </div>
    </div>

    <div class="page-content-card mt-5">
      <div v-if="!loading" class="content-body" v-html="page?.content"></div>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const page = ref(null);
const loading = ref(true);

const fetchPage = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/pages/about`);
    page.value = data;
  } catch (e) {
    console.error('Failed to load about page:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPage);

useHead(() => ({
  title: page.value?.metaTitle || page.value?.title || 'About Us — Demo Store',
  meta: [
    { name: 'description', content: page.value?.metaDescription || 'Learn more about our company background and B2B wholesale platform.' },
    { name: 'keywords', content: page.value?.metaKeywords || 'B2B, wholesale, packaging' }
  ]
}));
</script>

<style scoped>
.static-page {
  padding-top: 30px;
  padding-bottom: 50px;
}

.page-header-banner {
  position: relative;
  background-image: linear-gradient(135deg, #4ecdc4, #6366f1);
  border-radius: 12px;
  padding: 60px 40px;
  color: white;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
  text-align: center;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.banner-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.page-content-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.content-body :deep(h3) {
  font-size: 1.5rem;
  color: #1f2937;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
}

.content-body :deep(h3)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary-color, #ff6b6b);
  border-radius: 2px;
}

.content-body :deep(p) {
  font-size: 1.05rem;
  line-height: 1.75;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.content-body :deep(ul) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.content-body :deep(li) {
  font-size: 1.025rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 0.5rem;
  list-style-type: disc;
}

.color-primary {
  color: #6366f1;
}

@media (max-width: 768px) {
  .page-header-banner {
    padding: 40px 20px;
  }
  .banner-content h1 {
    font-size: 2rem;
  }
  .page-content-card {
    padding: 24px;
  }
}
</style>
