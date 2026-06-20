<template>
  <div class="users-page fade-in">
    <div class="page-header mb-4">
      <h1>User & Client Management</h1>
      <div class="header-actions">
        <div class="input-group mb-0">
          <input v-model="filters.search" type="text" placeholder="Search by name or email..." @input="fetchUsers">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Joined</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name" alt="Avatar">
                  <span class="fw-bold">{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td>{{ user.city }}{{ user.country ? ', ' + user.country : '' }}</td>
              <td>
                <span :class="['badge', user.status === 'active' ? 'badge-success' : 'badge-danger']">{{ user.status }}</span>
              </td>
              <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
              <td class="text-end">
                <button @click="toggleStatus(user)" class="btn-icon sm" :title="user.status === 'active' ? 'Deactivate' : 'Activate'">
                  <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' });
const api = useApi();
const users = ref([]);
const filters = reactive({ search: '', role: 'client' });

const fetchUsers = async () => {
  const res = await api.get('/users', { params: filters });
  users.value = res.data;
};

const toggleStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  await api.put(`/users/${user.id}`, { status: newStatus });
  fetchUsers();
};

onMounted(fetchUsers);
</script>

<style scoped>
.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.user-cell img { width: 32px; height: 32px; border-radius: 50%; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
</style>
