<template>
  <div class="menus-admin-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Navigation Menu Management</h1>
        <p class="text-muted">Configure storefront top navigation menus and footer information links dynamically.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add Menu Link
      </button>
    </div>

    <div class="grid-2">
      <!-- Top Menu links card -->
      <div class="card">
        <div class="flex-header mb-3">
          <h3><i class="fas fa-bars text-primary"></i> Top Navigation Links</h3>
        </div>
        <div class="table-container" v-if="!loading">
          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Order</th>
                <th>Link Name</th>
                <th>URL Link</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in topMenus" :key="menu.id">
                <td class="text-center fw-bold">{{ menu.sortOrder }}</td>
                <td><span class="fw-bold">{{ menu.name }}</span></td>
                <td><span class="text-muted font-mono">{{ menu.url }}</span></td>
                <td class="text-end">
                  <div class="actions">
                    <button @click="openModal(menu)" class="btn-icon edit" title="Edit Link"><i class="fas fa-edit"></i></button>
                    <button @click="deleteMenu(menu.id)" class="btn-icon delete" title="Delete Link"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
              <tr v-if="topMenus.length === 0">
                <td colspan="4" class="text-center py-4 text-muted">No top menu items defined.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-lg color-primary"></i>
        </div>
      </div>

      <!-- Footer links card -->
      <div class="card">
        <div class="flex-header mb-3">
          <h3><i class="fas fa-list text-primary"></i> Footer Info Links</h3>
        </div>
        <div class="table-container" v-if="!loading">
          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Order</th>
                <th>Link Name</th>
                <th>URL Link</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in footerMenus" :key="menu.id">
                <td class="text-center fw-bold">{{ menu.sortOrder }}</td>
                <td><span class="fw-bold">{{ menu.name }}</span></td>
                <td><span class="text-muted font-mono">{{ menu.url }}</span></td>
                <td class="text-end">
                  <div class="actions">
                    <button @click="openModal(menu)" class="btn-icon edit" title="Edit Link"><i class="fas fa-edit"></i></button>
                    <button @click="deleteMenu(menu.id)" class="btn-icon delete" title="Delete Link"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
              <tr v-if="footerMenus.length === 0">
                <td colspan="4" class="text-center py-4 text-muted">No footer links defined.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-lg color-primary"></i>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>{{ editingMenu ? 'Edit Menu Link' : 'Add Menu Link' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveMenu" class="modal-form">
          <div class="input-group">
            <label>Link Label Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Products, FAQs">
          </div>
          <div class="input-group">
            <label>URL Link Path</label>
            <input v-model="form.url" type="text" required placeholder="e.g. /products, /about">
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Menu Type</label>
              <select v-model="form.type">
                <option value="top">Top Navigation Menu</option>
                <option value="footer">Footer Info Links</option>
              </select>
            </div>
            <div class="input-group">
              <label>Sort Order</label>
              <input v-model="form.sortOrder" type="number" required placeholder="0">
            </div>
          </div>

          <div class="modal-footer mt-4">
            <button type="button" @click="closeModal" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">Save Link</span>
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
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingMenu = ref(null);
const menus = ref([]);

const form = reactive({
  name: '',
  url: '',
  type: 'top',
  sortOrder: 0
});

const fetchMenus = async () => {
  loading.value = true;
  try {
    const res = await api.get('/menus');
    menus.value = res || [];
  } catch (err) {
    console.error('Failed to fetch menus:', err);
  } finally {
    loading.value = false;
  }
};

const topMenus = computed(() => {
  return menus.value.filter(m => m.type === 'top');
});

const footerMenus = computed(() => {
  return menus.value.filter(m => m.type === 'footer');
});

const openModal = (menu = null) => {
  editingMenu.value = menu;
  if (menu) {
    form.name = menu.name;
    form.url = menu.url;
    form.type = menu.type;
    form.sortOrder = menu.sortOrder;
  } else {
    form.name = '';
    form.url = '';
    form.type = 'top';
    form.sortOrder = menus.value.length ? Math.max(...menus.value.map(m => m.sortOrder)) + 10 : 1;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingMenu.value = null;
};

const saveMenu = async () => {
  saving.value = true;
  try {
    if (editingMenu.value) {
      await api.put(`/menus/${editingMenu.value.id}`, form);
    } else {
      await api.post('/menus', form);
    }
    showModal.value = false;
    fetchMenus();
  } catch (err) {
    alert(err.data?.error || 'Failed to save menu link');
  } finally {
    saving.value = false;
  }
};

const deleteMenu = async (id) => {
  if (confirm('Are you sure you want to delete this menu link?')) {
    try {
      await api.delete(`/menus/${id}`);
      fetchMenus();
    } catch (err) {
      alert(err.data?.error || 'Failed to delete menu link');
    }
  }
};

onMounted(fetchMenus);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 992px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.flex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
