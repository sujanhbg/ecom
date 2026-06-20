<template>
  <div class="static-page container fade-in">
    <div class="page-header-banner">
      <div class="banner-content">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about bulk packaging, logistics, orders, and payments.</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="faq-search-wrapper mt-4">
      <div class="search-input-group">
        <i class="fas fa-search search-icon"></i>
        <input v-model="searchQuery" type="text" placeholder="Search for questions (e.g. delivery, bulk discounts)..." class="faq-search-input">
      </div>
    </div>

    <!-- FAQ Accordion List -->
    <div class="faq-accordion-container mt-4">
      <div v-if="!loading">
        <div v-for="(faq, idx) in filteredFaqs" :key="faq.id" class="faq-item shadow-sm">
          <button @click="toggleFaq(idx)" class="faq-question-btn" :aria-expanded="faq.isOpen ? 'true' : 'false'">
            <span class="faq-question-text">{{ faq.question }}</span>
            <span class="faq-icon-indicator" :class="{ 'rotated': faq.isOpen }">
              <i class="fas fa-chevron-down"></i>
            </span>
          </button>
          
          <Transition name="faq-slide">
            <div v-show="faq.isOpen" class="faq-answer-panel">
              <div class="faq-answer-content" v-html="faq.answer"></div>
            </div>
          </Transition>
        </div>

        <div v-if="filteredFaqs.length === 0" class="empty-faq text-center py-5">
          <i class="fas fa-search-minus fa-3x text-muted mb-3"></i>
          <p>No FAQs match your search query. Try typing something else!</p>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const faqs = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const fetchFaqs = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/faqs`);
    faqs.value = (data || []).map(item => ({
      ...item,
      isOpen: false
    }));
  } catch (e) {
    console.error('Failed to load FAQs:', e);
  } finally {
    loading.value = false;
  }
};

const toggleFaq = (index) => {
  filteredFaqs.value[index].isOpen = !filteredFaqs.value[index].isOpen;
};

const filteredFaqs = computed(() => {
  if (!searchQuery.value.trim()) return faqs.value;
  const q = searchQuery.value.toLowerCase().trim();
  return faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(q) || 
    faq.answer.toLowerCase().includes(q)
  );
});

onMounted(fetchFaqs);

useHead({
  title: 'FAQs — Demo Store',
  meta: [
    { name: 'description', content: 'Frequently asked questions regarding B2B buying, bulk orders, delivery timelines, and logistics support.' }
  ]
});
</script>

<style scoped>
.static-page {
  padding-top: 30px;
  padding-bottom: 50px;
}

.page-header-banner {
  position: relative;
  background-image: linear-gradient(135deg, #10b981, #059669);
  border-radius: 12px;
  padding: 60px 40px;
  color: white;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
  text-align: center;
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

.faq-search-wrapper {
  max-width: 650px;
  margin: 0 auto;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20px;
  color: #9ca3af;
  font-size: 1.1rem;
}

.faq-search-input {
  width: 100%;
  padding: 16px 20px 16px 54px;
  border: 1.5px solid #e5e7eb;
  background-color: white;
  border-radius: 99px;
  font-size: 1.05rem;
  outline: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  transition: all 0.25s ease;
}

.faq-search-input:focus {
  border-color: #10b981;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
}

.faq-accordion-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  transition: transform 0.2s, box-shadow 0.2s;
}

.faq-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.04);
}

.faq-question-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  background: white;
  border: none;
  cursor: pointer;
  text-align: left;
  outline: none;
}

.faq-question-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1f2937;
  padding-right: 20px;
}

.faq-icon-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 0.85rem;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.faq-icon-indicator.rotated {
  background-color: #10b981;
  color: white;
  transform: rotate(180deg);
}

.faq-answer-panel {
  border-top: 1px solid #f3f4f6;
  background-color: #fafafa;
}

.faq-answer-content {
  padding: 24px 28px;
  font-size: 1.025rem;
  line-height: 1.7;
  color: #4b5563;
}

.faq-answer-content :deep(p) {
  margin-bottom: 0.75rem;
}
.faq-answer-content :deep(p):last-child {
  margin-bottom: 0;
}
.faq-answer-content :deep(strong) {
  color: #1f2937;
}

/* Slide Transition */
.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: max-height 0.28s ease, opacity 0.28s ease;
  max-height: 500px;
  overflow: hidden;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.color-primary {
  color: #10b981;
}

.empty-faq {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .page-header-banner {
    padding: 40px 20px;
  }
  .banner-content h1 {
    font-size: 2rem;
  }
  .faq-question-btn {
    padding: 16px 20px;
  }
  .faq-question-text {
    font-size: 1rem;
  }
  .faq-answer-content {
    padding: 16px 20px;
  }
}
</style>
