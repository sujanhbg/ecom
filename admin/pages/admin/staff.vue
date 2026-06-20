<template>
  <div class="staff-page fade-in">
    <div class="page-header mb-4">
      <h1>Staff Management</h1>
      <button @click="openModal()" class="btn btn-primary">Add Staff Member</button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in staff" :key="s.id">
              <td><span class="fw-bold">{{ s.name }}</span></td>
              <td>{{ s.email }}</td>
              <td><span class="badge badge-secondary">{{ s.role }}</span></td>
              <td><span :class="['badge', s.status === 'active' ? 'badge-success' : 'badge-danger']">{{ s.status }}</span></td>
              <td class="text-end">
                <button @click="deleteStaff(s.id)" class="btn-icon delete sm"><i class="fas fa-trash"></i></button>
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
const staff = ref([]);

const fetchStaff = async () => {
  const res = await api.get('/staff');
  staff.value = res.data;
};

const deleteStaff = async (id) => {
  if (confirm('Delete this staff member?')) {
    await api.delete(`/staff/${id}`);
    fetchStaff();
  }
};

onMounted(fetchStaff);
</script>
