<template>
  <div class="dashboard fade-in">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ stat.label }}</p>
          <h2 class="stat-value">{{ stat.value }}</h2>
        </div>
      </div>
    </div>

    <div class="dashboard-charts grid-2">
      <!-- Recent Orders -->
      <div class="card">
        <div class="card-header">
          <h3>Recent Orders</h3>
          <NuxtLink to="/admin/orders" class="btn btn-sm">View All</NuxtLink>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in data?.recentOrders" :key="order.id">
                <td>#{{ order.orderNumber }}</td>
                <td>{{ order.User?.name }}</td>
                <td>{{ order.total }} BDT</td>
                <td>
                  <span :class="['badge', getStatusBadge(order.status)]">{{ order.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div class="card">
        <div class="card-header">
          <h3>Low Stock Alert</h3>
          <NuxtLink to="/admin/products" class="btn btn-sm">Manage Inventory</NuxtLink>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in data?.lowStockProducts" :key="product.id">
                <td class="product-td">
                  <img :src="product.image || 'https://placehold.co/40'" alt="Img" class="mini-img">
                  <span>{{ product.name }}</span>
                </td>
                <td>{{ product.sku }}</td>
                <td>
                  <span class="text-danger fw-bold">{{ product.stock }}</span>
                </td>
                <td>
                  <button class="btn-icon"><i class="fas fa-plus"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
const { data, refresh } = await useAsyncData('dashboard-stats', () => api.get('/dashboard'));

const stats = computed(() => [
  { label: 'Total Revenue', value: (data.value?.totalRevenue || 0) + ' BDT', icon: 'fas fa-dollar-sign', color: '#10b981' },
  { label: 'Total Orders', value: data.value?.totalOrders || 0, icon: 'fas fa-shopping-bag', color: '#6366f1' },
  { label: 'Total Products', value: data.value?.totalProducts || 0, icon: 'fas fa-box', color: '#f59e0b' },
  { label: 'Total Clients', value: data.value?.totalUsers || 0, icon: 'fas fa-users', color: '#3b82f6' },
]);

const getStatusBadge = (status) => {
  switch (status) {
    case 'delivered': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'cancelled': return 'badge-danger';
    default: return 'badge-secondary';
  }
};
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.product-td {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}
</style>
