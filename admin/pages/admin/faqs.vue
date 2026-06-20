<template>
  <div class="faqs-admin-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>FAQs Management</h1>
        <p class="text-muted">Manage Frequently Asked Questions (FAQs) displayed on the storefront.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add New FAQ
      </button>
    </div>

    <!-- FAQs Table -->
    <div class="card">
      <div class="table-container" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Sort Order</th>
              <th>Question</th>
              <th>Answer Snippet</th>
              <th class="text-end" style="width: 150px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="faq in faqs" :key="faq.id">
              <td class="text-center font-bold">{{ faq.sortOrder }}</td>
              <td><span class="fw-bold">{{ faq.question }}</span></td>
              <td class="text-muted text-truncate" style="max-width: 400px;">{{ getSnippet(faq.answer) }}</td>
              <td class="text-end">
                <div class="actions">
                  <button @click="openModal(faq)" class="btn-icon edit" title="Edit FAQ">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteFaq(faq.id)" class="btn-icon delete" title="Delete FAQ">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="faqs.length === 0">
              <td colspan="4" class="text-center py-5">No FAQs found. Add some using the button above.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>
    </div>

    <!-- FAQ Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>{{ editingFaq ? 'Edit FAQ' : 'Add New FAQ' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveFaq" class="modal-form">
          <div class="input-group">
            <label>Question</label>
            <input v-model="form.question" type="text" required placeholder="e.g. How long does shipping take?">
          </div>
          <div class="input-group">
            <label>Answer (supports basic HTML tags)</label>
            <textarea v-model="form.answer" rows="6" required placeholder="e.g. Shipping inside Dhaka takes 2-3 business days..."></textarea>
          </div>
          <div class="input-group">
            <label>Sort Order</label>
            <input v-model="form.sortOrder" type="number" required placeholder="0">
            <span class="text-muted small mt-1 block">Lower numbers will be displayed first.</span>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">Save FAQ</span>
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
const faqs = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingFaq = ref(null);

const form = reactive({
  question: '',
  answer: '',
  sortOrder: 0
});

const fetchFaqs = async () => {
  loading.value = true;
  try {
    const res = await api.get('/faqs');
    faqs.value = res;
  } catch (err) {
    console.error('Failed to fetch FAQs:', err);
  } finally {
    loading.value = false;
  }
};

const getSnippet = (text) => {
  if (!text) return '';
  // Strip simple HTML tags for text snippet
  const clean = text.replace(/<[^>]*>/g, '');
  return clean.length > 80 ? clean.substring(0, 80) + '...' : clean;
};

const openModal = (faq = null) => {
  editingFaq.value = faq;
  if (faq) {
    form.question = faq.question;
    form.answer = faq.answer;
    form.sortOrder = faq.sortOrder;
  } else {
    form.question = '';
    form.answer = '';
    form.sortOrder = faqs.value.length ? Math.max(...faqs.value.map(f => f.sortOrder)) + 10 : 0;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingFaq.value = null;
};

const saveFaq = async () => {
  saving.value = true;
  try {
    if (editingFaq.value) {
      await api.put(`/faqs/${editingFaq.value.id}`, form);
    } else {
      await api.post('/faqs', form);
    }
    showModal.value = false;
    fetchFaqs();
  } catch (err) {
    alert(err.data?.error || 'Failed to save FAQ');
  } finally {
    saving.value = false;
  }
};

const deleteFaq = async (id) => {
  if (confirm('Are you sure you want to delete this FAQ?')) {
    try {
      await api.delete(`/faqs/${id}`);
      fetchFaqs();
    } catch (err) {
      alert(err.data?.error || 'Failed to delete FAQ');
    }
  }
};

onMounted(fetchFaqs);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  color: var(--text-muted);
}

.btn-icon.edit:hover { background: #e0e7ff; color: var(--primary); }
.btn-icon.delete:hover { background: #fee2e2; color: var(--accent); }

.block {
  display: block;
}
</style>
