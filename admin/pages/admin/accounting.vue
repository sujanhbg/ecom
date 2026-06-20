<template>
  <div class="accounting-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Accounting</h1>
        <p class="text-muted">Monitor cash flow, revenue, and expenses.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add Transaction
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid mb-4">
      <div class="card stat-card border-l-success">
        <div class="stat-label">Total Income</div>
        <div class="stat-value text-success">{{ summary.income }} BDT</div>
      </div>
      <div class="card stat-card border-l-danger">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value text-danger">{{ summary.expense }} BDT</div>
      </div>
      <div class="card stat-card border-l-warning">
        <div class="stat-label">Refunds</div>
        <div class="stat-value text-warning">{{ summary.refund }} BDT</div>
      </div>
      <div class="card stat-card border-l-primary">
        <div class="stat-label">Net Profit</div>
        <div class="stat-value text-primary">{{ summary.profit }} BDT</div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center mb-4">
        <h3>Transactions</h3>
        <div class="filters d-flex gap-2">
          <select v-model="filters.type" @change="fetchData" class="sm-select">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Amount</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in transactions" :key="t.id">
              <td>{{ t.date }}</td>
              <td>
                <span :class="['badge', getTypeBadge(t.type)]">{{ t.type }}</span>
              </td>
              <td>{{ t.category }}</td>
              <td>{{ t.description }}</td>
              <td>
                <span v-if="t.orderId" class="text-primary fw-bold">#ORD-{{ t.orderId }}</span>
                <span v-else>{{ t.reference || '-' }}</span>
              </td>
              <td :class="t.type === 'expense' ? 'text-danger' : 'text-success'">
                {{ t.type === 'expense' ? '-' : '+' }}{{ t.amount }} BDT
              </td>
              <td class="text-end">
                <button @click="deleteTransaction(t.id)" class="btn-icon delete sm"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Transaction Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>Record Transaction</h3>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveTransaction">
          <div class="grid-2">
            <div class="input-group">
              <label>Type</label>
              <select v-model="form.type" required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div class="input-group">
              <label>Amount (BDT)</label>
              <input v-model="form.amount" type="number" step="0.01" required>
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Category</label>
              <input v-model="form.category" type="text" placeholder="e.g. Sales, Rent, Inventory" required>
            </div>
            <div class="input-group">
              <label>Date</label>
              <input v-model="form.date" type="date" required>
            </div>
          </div>
          <div class="input-group">
            <label>Reference / Order #</label>
            <input v-model="form.reference" type="text">
          </div>
          <div class="input-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' });

const api = useApi();
const transactions = ref([]);
const summary = ref({ income: 0, expense: 0, refund: 0, profit: 0 });
const showModal = ref(false);
const filters = reactive({ type: '', page: 1 });

const form = reactive({
  type: 'income',
  amount: 0,
  category: '',
  date: new Date().toISOString().substr(0, 10),
  description: '',
  reference: ''
});

const fetchData = async () => {
  const [tRes, sRes] = await Promise.all([
    api.get('/transactions', { params: filters }),
    api.get('/transactions/summary')
  ]);
  transactions.value = tRes.data;
  summary.value = sRes;
};

const saveTransaction = async () => {
  try {
    await api.post('/transactions', form);
    showModal.value = false;
    fetchData();
  } catch (err) {
    alert('Failed to save');
  }
};

const deleteTransaction = async (id) => {
  if (confirm('Delete this record?')) {
    await api.delete(`/transactions/${id}`);
    fetchData();
  }
};

const getTypeBadge = (type) => {
  if (type === 'income') return 'badge-success';
  if (type === 'expense') return 'badge-danger';
  return 'badge-warning';
};

const openModal = () => {
  Object.assign(form, {
    type: 'income', amount: 0, category: '', 
    date: new Date().toISOString().substr(0, 10), 
    description: '', reference: ''
  });
  showModal.value = true;
};

onMounted(fetchData);
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.stat-card { padding: 1.5rem; border-left: 5px solid transparent; }
.border-l-success { border-left-color: #10b981; }
.border-l-danger { border-left-color: #ef4444; }
.border-l-warning { border-left-color: #f59e0b; }
.border-l-primary { border-left-color: var(--primary); }
.stat-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 600; }
.stat-value { font-size: 1.5rem; font-weight: 800; }
.sm-select { padding: 0.5rem; border-radius: var(--radius); border: 1px solid var(--border); }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }
.text-warning { color: #f59e0b; }
.text-primary { color: var(--primary); }
</style>
