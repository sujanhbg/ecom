<template>
  <div class="orders-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Orders</h1>
        <p class="text-muted">Track customer orders, payments, and shipping status.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="filters-grid">
        <input v-model="filters.search" type="text" placeholder="Order ID or Tracking #" @input="fetchOrders">
        <select v-model="filters.status" @change="fetchOrders">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Courier</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td><span class="fw-bold">#{{ order.orderNumber }}</span></td>
              <td>{{ order.User?.name || 'Guest' }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ order.total }} BDT</td>
              <td>
                <span :class="['badge', getStatusBadge(order.status)]">{{ order.status }}</span>
              </td>
              <td>
                <div v-if="order.CourierService" class="courier-chip">
                  <i class="fas fa-truck"></i> {{ order.CourierService.name }}
                </div>
                <span v-else class="text-muted small">Not assigned</span>
              </td>
              <td class="text-end">
                <button @click="viewOrder(order)" class="btn btn-sm btn-outline">Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <Transition name="modal">
    <div v-if="selectedOrder" class="modal-overlay" @click.self="selectedOrder = null">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>Order Details: #{{ selectedOrder.orderNumber }}</h3>
          <button @click="selectedOrder = null" class="close-btn">&times;</button>
        </div>
        
        <div class="order-detail-grid">
          <!-- Main Info -->
          <div class="main-info">
            <div class="section mb-4">
              <h4>Items</h4>
              <div class="order-items mt-2">
                <div v-for="item in selectedOrder.OrderItems" :key="item.id" class="order-item-row">
                  <img :src="item.Product?.image || 'https://placehold.co/40'" alt="Img">
                  <div class="item-details">
                    <div class="fw-bold">{{ item.productName }}</div>
                    <div class="small text-muted">{{ item.quantity }} x {{ item.price }} BDT</div>
                  </div>
                  <div class="item-total fw-bold">{{ item.total }} BDT</div>
                </div>
              </div>
              <div class="order-summary mt-3">
                <div class="summary-row"><span>Subtotal</span><span>{{ selectedOrder.subtotal }} BDT</span></div>
                <div class="summary-row"><span>Shipping</span><span>{{ selectedOrder.shippingCost }} BDT</span></div>
                <div class="summary-row total"><span>Total</span><span>{{ selectedOrder.total }} BDT</span></div>
              </div>
            </div>

            <div class="section">
              <h4>Shipping Address</h4>
              <p class="mt-2 text-muted">{{ selectedOrder.shippingAddress }}</p>
            </div>
          </div>

          <!-- Actions / Sidebar -->
          <div class="sidebar-info">
            <div class="action-card card mb-4">
              <h4>Manage Status</h4>
              <div class="input-group mt-3">
                <label>Order Status</label>
                <select v-model="selectedOrder.status" @change="updateOrderStatus">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="input-group">
                <label>Courier Service</label>
                <select v-model="selectedOrder.courierId" @change="updateOrderCourier">
                  <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="input-group">
                <label>Tracking Number</label>
                <div class="d-flex gap-2">
                  <input v-model="selectedOrder.trackingNumber" type="text">
                  <button @click="updateTracking" class="btn btn-primary sm">Set</button>
                </div>
              </div>
            </div>

            <div class="card bg-light">
              <h4>Customer Info</h4>
              <div class="mt-2">
                <div class="fw-bold">{{ selectedOrder.User?.name }}</div>
                <div class="small text-muted">{{ selectedOrder.User?.email }}</div>
                <div class="small text-muted">{{ selectedOrder.User?.phone }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' });

const api = useApi();
const orders = ref([]);
const couriers = ref([]);
const selectedOrder = ref(null);
const filters = reactive({ search: '', status: '', page: 1 });

const fetchOrders = async () => {
  const res = await api.get('/orders', { params: filters });
  orders.value = res.data;
};

const fetchCouriers = async () => {
  couriers.value = await api.get('/orders/couriers/list');
};

const viewOrder = async (order) => {
  selectedOrder.value = await api.get(`/orders/${order.id}`);
};

const updateOrderStatus = async () => {
  await api.put(`/orders/${selectedOrder.value.id}`, { status: selectedOrder.value.status });
  fetchOrders();
};

const updateOrderCourier = async () => {
  await api.put(`/orders/${selectedOrder.value.id}`, { courierId: selectedOrder.value.courierId });
  fetchOrders();
};

const updateTracking = async () => {
  await api.put(`/orders/${selectedOrder.value.id}`, { trackingNumber: selectedOrder.value.trackingNumber });
  alert('Tracking updated');
};

const formatDate = (date) => new Date(date).toLocaleDateString();

const getStatusBadge = (status) => {
  const maps = {
    pending: 'badge-warning',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    shipped: 'badge-info',
  };
  return maps[status] || 'badge-secondary';
};

onMounted(() => {
  fetchOrders();
  fetchCouriers();
});
</script>

<style scoped>
.filters-grid { display: grid; grid-template-columns: 1fr 200px; gap: 1rem; }
.courier-chip { display: inline-flex; align-items: center; gap: 0.5rem; background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

/* Modal Panel — slides in from the right, full height, responsive width */
.modal-panel {
  position: relative;
  background: var(--surface);
  height: 100vh;
  width: clamp(50%, 65vw, 80%);
  max-width: 960px;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* On smaller screens go wider */
@media (max-width: 900px) {
  .modal-panel { width: clamp(70%, 80vw, 90%); }
}
@media (max-width: 640px) {
  .modal-panel { width: 100%; }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--background);
  border: 1px solid var(--border);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s;
}
.close-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

/* Scrollable body */
.order-detail-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 768px) {
  .order-detail-grid { grid-template-columns: 1fr; }
}

.order-item-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
.order-item-row img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
.item-details { flex: 1; }
.order-summary { border-top: 2px solid var(--border); padding-top: 1rem; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.summary-row.total { font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-top: 1rem; }
.section h4 { border-left: 4px solid var(--primary); padding-left: 0.75rem; }

/* Slide-in transition */
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateX(100%);
}
.modal-enter-active,
.modal-leave-active {
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
}
</style>
