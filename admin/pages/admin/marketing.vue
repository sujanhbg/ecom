<template>
  <div class="marketing-page fade-in">
    <div class="page-header mb-4">
      <h1>Marketing & Promotions</h1>
      <button @click="openModal()" class="btn btn-primary">Create Promotion</button>
    </div>

    <div class="grid-2">
      <!-- Promotions List -->
      <div class="card">
        <h3>Active Promotions</h3>
        <div class="promo-list mt-3">
          <div v-for="promo in promotions" :key="promo.id" class="promo-card mb-3">
            <div class="promo-info">
              <div class="promo-code">{{ promo.code }}</div>
              <div class="promo-title fw-bold">{{ promo.title }}</div>
              <div class="promo-desc text-muted small">{{ promo.description }}</div>
            </div>
            <div class="promo-stats text-end">
              <div class="promo-value text-primary fw-bold">
                {{ promo.type === 'percentage' ? promo.value + '%' : promo.value + ' BDT' }} OFF
              </div>
              <div class="small text-muted">{{ promo.usedCount }} uses</div>
              <span :class="['badge', promo.status === 'active' ? 'badge-success' : 'badge-secondary']">{{ promo.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Subscribers -->
      <div class="card">
        <h3>Newsletter Subscribers</h3>
        <div class="table-container mt-3">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in subscribers" :key="sub.id">
                <td>{{ sub.email }}</td>
                <td><span class="badge badge-success">{{ sub.status }}</span></td>
                <td>{{ new Date(sub.subscribedAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Promo Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>Create New Promotion</h3>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="savePromo">
          <div class="input-group">
            <label>Title</label>
            <input v-model="form.title" type="text" required>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Promo Code</label>
              <input v-model="form.code" type="text" required placeholder="SUMMER20">
            </div>
            <div class="input-group">
              <label>Type</label>
              <select v-model="form.type">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Value</label>
              <input v-model="form.value" type="number" required>
            </div>
            <div class="input-group">
              <label>Min Order Amount</label>
              <input v-model="form.minOrderAmount" type="number">
            </div>
          </div>
          <div class="input-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="2"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' });
const api = useApi();
const promotions = ref([]);
const subscribers = ref([]);
const showModal = ref(false);

const form = reactive({
  title: '', code: '', type: 'percentage', value: 0, minOrderAmount: 0, description: '', status: 'active'
});

const fetchData = async () => {
  const [pRes, sRes] = await Promise.all([
    api.get('/marketing/promotions'),
    api.get('/marketing/subscribers')
  ]);
  promotions.value = pRes;
  subscribers.value = sRes.data;
};

const openModal = () => {
  Object.assign(form, { title: '', code: '', type: 'percentage', value: 0, minOrderAmount: 0, description: '', status: 'active' });
  showModal.value = true;
};

const savePromo = async () => {
  await api.post('/marketing/promotions', form);
  showModal.value = false;
  fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
.promo-card { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; background: var(--background); border-radius: var(--radius); border: 1px dashed var(--border); }
.promo-code { display: inline-block; padding: 0.25rem 0.75rem; background: var(--primary); color: white; border-radius: 6px; font-weight: 700; font-size: 0.8rem; margin-bottom: 0.5rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
</style>
