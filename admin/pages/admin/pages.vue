<template>
  <div class="pages-admin-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Page Content Management</h1>
        <p class="text-muted">Edit and manage details for static pages on the storefront (About Us, Contact Us, Delivery Rules).</p>
      </div>
    </div>

    <!-- Pages List -->
    <div class="card">
      <div class="table-container" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Page Key</th>
              <th>Page Title</th>
              <th>Last Updated</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="page in pages" :key="page.id">
              <td>
                <span class="badge badge-secondary fw-bold">{{ page.key }}</span>
              </td>
              <td><span class="fw-bold">{{ page.title }}</span></td>
              <td>{{ new Date(page.updatedAt).toLocaleString() }}</td>
              <td class="text-end">
                <button @click="openEditModal(page)" class="btn btn-sm btn-outline text-primary" title="Edit Page Content">
                  <i class="fas fa-edit"></i> Edit Content
                </button>
              </td>
            </tr>
            <tr v-if="pages.length === 0">
              <td colspan="4" class="text-center py-5">No pages found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card max-width-large">
        <div class="modal-header">
          <h3>Edit Content: {{ editingPage?.title }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="savePage" class="modal-form">
          <div class="input-group">
            <label>Page Title</label>
            <input v-model="form.title" type="text" required>
          </div>
          
          <!-- SEO Settings Section -->
          <div class="seo-settings-section mt-3 mb-3">
            <h4 class="seo-section-title mb-2"><i class="fas fa-search"></i> Page SEO Meta Tags</h4>
            <div class="grid-2">
              <div class="input-group">
                <label>Meta Title (SEO)</label>
                <input v-model="form.metaTitle" type="text" placeholder="Default is Page Title">
              </div>
              <div class="input-group">
                <label>Meta Keywords (SEO)</label>
                <input v-model="form.metaKeywords" type="text" placeholder="e.g. wholesale, contact, support">
              </div>
            </div>
            <div class="input-group mt-2">
              <label>Meta Description (SEO)</label>
              <textarea v-model="form.metaDescription" rows="2" placeholder="Write a search engine friendly summary..."></textarea>
            </div>
          </div>
          <div class="input-group">
            <div class="flex-header label-row">
              <label>Page Content (HTML/Plain Text)</label>
              <div class="tab-selectors">
                <button type="button" :class="['tab-btn', { 'active': activeTab === 'edit' }]" @click="activeTab = 'edit'">Write</button>
                <button type="button" :class="['tab-btn', { 'active': activeTab === 'preview' }]" @click="activeTab = 'preview'">Preview</button>
              </div>
            </div>
            
            <div v-show="activeTab === 'edit'">
              <textarea v-model="form.content" rows="12" class="form-textarea code-font" required placeholder="Write HTML content here..."></textarea>
              <span class="text-muted small mt-1 block"><i class="fas fa-info-circle"></i> Basic HTML tags are supported (e.g. &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;).</span>
            </div>
            
            <div v-show="activeTab === 'preview'" class="html-preview-box">
              <h3 class="preview-title">{{ form.title }}</h3>
              <div class="preview-body" v-html="form.content"></div>
            </div>
          </div>

          <div class="modal-footer mt-4">
            <button type="button" @click="closeModal" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">Save Changes</span>
              <i v-else class="fas fa-spinner fa-spin"></i>
            </button>
          </div>
        </form>
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
const pages = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingPage = ref(null);
const activeTab = ref('edit'); // 'edit' or 'preview'

const form = reactive({
  title: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: ''
});

const fetchPages = async () => {
  loading.value = true;
  try {
    const res = await api.get('/pages');
    pages.value = res;
  } catch (err) {
    console.error('Failed to fetch pages:', err);
  } finally {
    loading.value = false;
  }
};

const openEditModal = (page) => {
  editingPage.value = page;
  form.title = page.title;
  form.content = page.content;
  form.metaTitle = page.metaTitle || '';
  form.metaDescription = page.metaDescription || '';
  form.metaKeywords = page.metaKeywords || '';
  activeTab.value = 'edit';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingPage.value = null;
};

const savePage = async () => {
  if (!editingPage.value) return;
  saving.value = true;
  try {
    await api.put(`/pages/${editingPage.value.key}`, form);
    showModal.value = false;
    fetchPages();
  } catch (err) {
    alert(err.data?.error || 'Failed to save page content');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchPages);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.max-width-large {
  max-width: 900px !important;
  width: 100%;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.tab-selectors {
  display: flex;
  background: var(--background);
  padding: 2px;
  border-radius: 6px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
}

.tab-btn.active {
  background: var(--surface);
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.code-font {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.html-preview-box {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.preview-title {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.preview-body :deep(h3) {
  font-size: 1.15rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.preview-body :deep(p) {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.preview-body :deep(ul), .preview-body :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.preview-body :deep(li) {
  margin-bottom: 0.4rem;
}

.block {
  display: block;
}

.seo-section-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--primary);
  margin-top: 1.5rem;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 0.4rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
