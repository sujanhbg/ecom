<template>
  <div class="settings-admin-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Global Site Settings</h1>
        <p class="text-muted">Manage global meta tags and SEO configurations for the storefront home page.</p>
      </div>
    </div>

    <div class="card max-width-medium">
      <h3 class="mb-4"><i class="fas fa-search-plus"></i> Homepage SEO Settings</h3>
      <form @submit.prevent="saveSettings" class="settings-form" v-if="!loading">
        <div class="input-group">
          <label>Homepage Site Title</label>
          <input v-model="form.siteTitle" type="text" required placeholder="e.g. My B2B Wholesale Store — Best Packaging Solutions">
          <span class="text-muted small mt-1 block">This is displayed as the browser tab title on the home page.</span>
        </div>

        <div class="input-group">
          <label>Homepage Meta Description</label>
          <textarea v-model="form.metaDescription" rows="4" required placeholder="e.g. Your trustedwholesale business partner. Providing top quality packaging boxes and bags all over Bangladesh..."></textarea>
          <span class="text-muted small mt-1 block">A short summary of the website (150-160 characters recommended) for search engines.</span>
        </div>

        <div class="input-group">
          <label>Homepage Meta Keywords</label>
          <input v-model="form.metaKeywords" type="text" placeholder="e.g. B2B, wholesale, packaging, boxes, bags, Bangladesh">
          <span class="text-muted small mt-1 block">Comma-separated list of keywords that define your store niche.</span>
        </div>

        <div class="form-footer mt-4">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="!saving"><i class="fas fa-save"></i> Save Settings</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </div>
      </form>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const api = useApi();
const loading = ref(false);
const saving = ref(false);

const form = reactive({
  siteTitle: '',
  metaDescription: '',
  metaKeywords: ''
});

const fetchSettings = async () => {
  loading.value = true;
  try {
    const res = await api.get('/settings');
    form.siteTitle = res.siteTitle || '';
    form.metaDescription = res.metaDescription || '';
    form.metaKeywords = res.metaKeywords || '';
  } catch (err) {
    console.error('Failed to fetch settings:', err);
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.put('/settings', form);
    alert('Site settings updated successfully!');
  } catch (err) {
    alert(err.data?.error || 'Failed to update settings');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchSettings);
</script>

<style scoped>
.max-width-medium {
  max-width: 700px;
  width: 100%;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.block {
  display: block;
}
</style>
