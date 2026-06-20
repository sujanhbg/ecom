<template>
  <div class="suppliers-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Suppliers</h1>
        <p class="text-muted">Manage your product suppliers and their contact information.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add New Supplier
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4 filters-card">
      <div class="filters-grid">
        <div class="input-group mb-0">
          <input v-model="filters.search" type="text" placeholder="Search by name or company..." @input="debouncedFetch">
        </div>
        <div class="input-group mb-0">
          <select v-model="filters.status" @change="fetchSuppliers">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Suppliers Table -->
    <div class="card">
      <div class="table-container" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Name & Company</th>
              <th>Contact Info</th>
              <th>Location</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in suppliers" :key="supplier.id">
              <td>
                <div class="supplier-info">
                  <div class="avatar-text">{{ supplier.name.charAt(0) }}</div>
                  <div>
                    <div class="fw-bold">{{ supplier.name }}</div>
                    <div class="text-muted small">{{ supplier.company }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="contact-item"><i class="fas fa-envelope"></i> {{ supplier.email }}</div>
                <div class="contact-item"><i class="fas fa-phone"></i> {{ supplier.phone }}</div>
              </td>
              <td>
                <div>{{ supplier.address }}</div>
                <div class="text-muted small">{{ supplier.city }}, {{ supplier.country }}</div>
              </td>
              <td>
                <span :class="['badge', supplier.status === 'active' ? 'badge-success' : 'badge-danger']">
                  {{ supplier.status }}
                </span>
              </td>
              <td class="text-end">
                <div class="actions">
                  <button @click="openModal(supplier)" class="btn-icon edit" title="Edit"><i class="fas fa-edit"></i></button>
                  <button @click="deleteSupplier(supplier.id)" class="btn-icon delete" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="suppliers.length === 0">
              <td colspan="5" class="text-center py-5">No suppliers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>

      <!-- Pagination -->
      <div class="pagination mt-4" v-if="totalPages > 1">
        <button :disabled="filters.page === 1" @click="changePage(filters.page - 1)" class="btn btn-sm btn-outline">Prev</button>
        <span class="px-3">Page {{ filters.page }} of {{ totalPages }}</span>
        <button :disabled="filters.page === totalPages" @click="changePage(filters.page + 1)" class="btn btn-sm btn-outline">Next</button>
      </div>
    </div>

    <!-- Supplier Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>{{ editingSupplier ? 'Edit Supplier' : 'Add New Supplier' }}</h3>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveSupplier" class="modal-form">
          <div class="grid-2">
            <div class="input-group">
              <label>Full Name</label>
              <input v-model="form.name" type="text" required placeholder="John Doe">
            </div>
            <div class="input-group">
              <label>Company Name</label>
              <input v-model="form.company" type="text" required placeholder="Acme Corp">
            </div>
          </div>
          
          <div class="grid-2">
            <div class="input-group">
              <label>Email Address</label>
              <input v-model="form.email" type="email" required placeholder="john@example.com">
            </div>
            <div class="input-group">
              <label>Phone Number</label>
              <input v-model="form.phone" type="text" required placeholder="+8801700000000">
            </div>
          </div>

          <div class="input-group">
            <label>Full Address</label>
            <input v-model="form.address" type="text" required placeholder="123 Main St">
          </div>

          <div class="grid-2">
            <div class="input-group">
              <label>City</label>
              <input v-model="form.city" type="text" required placeholder="Dhaka">
            </div>
            <div class="input-group">
              <label>Country</label>
              <input v-model="form.country" type="text" required placeholder="Bangladesh">
            </div>
          </div>

          <div class="input-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">Save Supplier</span>
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
const suppliers = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingSupplier = ref(null);
const totalPages = ref(1);

const filters = reactive({
  search: '',
  status: '',
  page: 1,
  limit: 10
});

const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Bangladesh',
  status: 'active'
});

const fetchSuppliers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/suppliers', { params: filters });
    suppliers.value = res.data;
    totalPages.value = res.pages;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = useDebounce(fetchSuppliers, 500);

const changePage = (p) => {
  filters.page = p;
  fetchSuppliers();
};

const openModal = (supplier = null) => {
  editingSupplier.value = supplier;
  if (supplier) {
    Object.keys(form).forEach(key => form[key] = supplier[key] || '');
  } else {
    Object.keys(form).forEach(key => form[key] = key === 'country' ? 'Bangladesh' : (key === 'status' ? 'active' : ''));
  }
  showModal.value = true;
};

const saveSupplier = async () => {
  saving.value = true;
  try {
    if (editingSupplier.value) {
      await api.put(`/suppliers/${editingSupplier.value.id}`, form);
    } else {
      await api.post('/suppliers', form);
    }
    showModal.value = false;
    fetchSuppliers();
  } catch (err) {
    alert(err.data?.error || 'Failed to save supplier');
  } finally {
    saving.value = false;
  }
};

const deleteSupplier = async (id) => {
  if (confirm('Are you sure you want to delete this supplier?')) {
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.data?.error || 'Failed to delete supplier');
    }
  }
};

onMounted(() => {
  fetchSuppliers();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.supplier-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-text {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.contact-item i {
  width: 14px;
  color: var(--primary);
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  font-size: 1.5rem;
  background: transparent;
  color: var(--text-muted);
}

.grid-2 { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 1rem; 
}

@media (min-width: 640px) {
  .grid-2 { grid-template-columns: 1fr 1fr; }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>
