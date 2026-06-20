<template>
  <div class="categories-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Categories</h1>
        <p class="text-muted">Manage product categories and sub-items hierarchy.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add Category
      </button>
    </div>

    <div class="grid-layout">
      <!-- Category Tree -->
      <div class="card tree-card">
        <div class="card-header mb-3">
          <h3>Category Structure</h3>
        </div>
        <div class="tree-container" v-if="!loading">
          <div v-for="cat in categories" :key="cat.id" class="tree-item">
            <div class="tree-node parent">
              <div class="node-info">
                <i class="fas fa-folder text-warning"></i>
                <span class="fw-bold">{{ cat.name }}</span>
                <span class="badge badge-secondary ml-2">{{ cat.children?.length || 0 }} sub</span>
              </div>
              <div class="node-actions">
                <button @click="openModal(cat)" class="btn-icon edit sm" title="Edit"><i class="fas fa-edit"></i></button>
                <button @click="deleteCategory(cat.id)" class="btn-icon delete sm" title="Delete"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <!-- Sub items -->
            <div class="tree-children" v-if="cat.children?.length">
              <div v-for="sub in cat.children" :key="sub.id" class="tree-node child">
                <div class="node-info">
                  <i class="fas fa-chevron-right text-muted small"></i>
                  <span>{{ sub.name }}</span>
                </div>
                <div class="node-actions">
                  <button @click="openModal(sub)" class="btn-icon edit sm" title="Edit"><i class="fas fa-edit"></i></button>
                  <button @click="deleteCategory(sub.id)" class="btn-icon delete sm" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="categories.length === 0" class="text-center py-5 text-muted">
            No categories created yet.
          </div>
        </div>
        <div v-else class="text-center py-5">
          <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
        </div>
      </div>

      <!-- Quick Stats/Info -->
      <div class="info-sidebar">
        <div class="card mb-4 bg-primary text-white info-card">
          <h4>Organization Tip</h4>
          <p class="small opacity-80">Use sub-categories to help customers find products faster. Limit to 2 levels for better UX.</p>
        </div>
        <div class="card">
          <h4>Category Legend</h4>
          <div class="legend-item mt-2">
            <div class="dot bg-warning"></div>
            <span>Parent Category</span>
          </div>
          <div class="legend-item">
            <div class="dot bg-secondary"></div>
            <span>Sub-item / Level 2</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>{{ editingCategory ? 'Edit Category' : 'Add New Category' }}</h3>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveCategory" class="modal-form">
          <div class="input-group">
            <label>Category Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Electronics" @input="onNameInput">
          </div>
          <div class="input-group">
            <label>Slug (URL key)</label>
            <input v-model="form.slug" type="text" placeholder="electronics-gadgets">
            <small class="text-muted">Unique identifier for the URL.</small>
          </div>
          <div class="input-group">
            <label>Parent Category (Optional)</label>
            <select v-model="form.parentId">
              <option :value="null">Main Category (Root)</option>
              <option v-for="cat in parentOptions" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Sort Order</label>
              <input v-model="form.sortOrder" type="number">
            </div>
            <div class="input-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">Save Category</span>
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

const config = useRuntimeConfig();
const imageUrl = config.public.imageUrl;

// Helper: resolve image path → full URL
const resolveImage = (path) => {
  if (!path) return `${imageUrl}/placeholder.png`;
  if (path.startsWith('http')) return path;
  return `${imageUrl}/${path}`;
};

const api = useApi();
const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingCategory = ref(null);
const saving = ref(false);

const form = reactive({
  name: '',
  slug: '',
  parentId: null,
  sortOrder: 0,
  status: 'active'
});

const parentOptions = computed(() => {
  // Only allow categories that are not the current one being edited
  // and only main categories (to keep depth at 2)
  return categories.value.filter(c => {
    const isSelf = editingCategory.value && c.id === editingCategory.value.id;
    const isRoot = !c.parentId;
    return !isSelf && isRoot;
  });
});

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    categories.value = res;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  } finally {
    loading.value = false;
  }
};

const onNameInput = () => {
  if (!editingCategory.value) {
    form.slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  }
};

const openModal = (cat = null) => {
  editingCategory.value = cat;
  if (cat) {
    Object.keys(form).forEach(key => {
      form[key] = cat[key] !== undefined ? cat[key] : (key === 'parentId' ? null : '');
    });
  } else {
    Object.keys(form).forEach(key => {
      form[key] = key === 'parentId' ? null : (key === 'status' ? 'active' : (key === 'sortOrder' ? 0 : ''));
    });
  }
  showModal.value = true;
};

const saveCategory = async () => {
  saving.value = true;
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value.id}`, form);
    } else {
      await api.post('/categories', form);
    }
    showModal.value = false;
    fetchCategories();
  } catch (err) {
    alert(err.data?.error || 'Failed to save category');
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (id) => {
  if (confirm('Are you sure? Sub-categories will be moved to root.')) {
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.data?.error || 'Failed to delete category');
    }
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.tree-item {
  margin-bottom: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.tree-node {
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  transition: all 0.2s;
}

.tree-node.parent {
  background: rgba(99, 102, 241, 0.02);
}

.tree-node.child {
  padding-left: 3rem;
  border-top: 1px solid var(--border);
  font-size: 0.95rem;
}

.tree-node:hover {
  background: rgba(99, 102, 241, 0.05);
}

.node-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon.sm {
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.info-card {
  padding: 1.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.close-btn {
  font-size: 1.5rem;
  background: transparent;
  color: var(--text-muted);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.ml-2 { margin-left: 0.5rem; }
.opacity-80 { opacity: 0.8; }

@media (max-width: 992px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
  .info-sidebar {
    order: -1;
  }
}
</style>
