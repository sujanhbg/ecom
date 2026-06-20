<template>
  <div class="permissions-page fade-in">
    <div class="page-header mb-4">
      <h1>Module-Based Permissions</h1>
      <p class="text-muted">Manage roles and their access to system modules.</p>
    </div>

    <div class="grid-layout">
      <!-- Roles List -->
      <div class="card">
        <h3>Roles</h3>
        <div class="role-list mt-3">
          <div v-for="role in roles" :key="role.id" 
               :class="['role-item', { 'active': selectedRole?.id === role.id }]"
               @click="selectRole(role)">
            <div>
              <div class="fw-bold">{{ role.name }}</div>
              <div class="text-muted small">{{ role.description }}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <!-- Module Permissions -->
      <div class="card" v-if="selectedRole">
        <div class="card-header d-flex justify-content-between align-items-center mb-4">
          <h3>Permissions for {{ selectedRole.name }}</h3>
          <button @click="savePermissions" class="btn btn-primary btn-sm" :disabled="saving">
            Save Changes
          </button>
        </div>

        <div class="modules-grid">
          <div v-for="mod in modules" :key="mod" class="module-card">
            <h4 class="module-title">{{ mod }}</h4>
            <div class="permissions-list">
              <label v-for="perm in getPermsForModule(mod)" :key="perm.id" class="perm-checkbox">
                <input type="checkbox" :value="perm.id" v-model="selectedPermIds">
                <span>{{ perm.action }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="card empty-state" v-else>
        <i class="fas fa-shield-alt fa-3x text-muted mb-3"></i>
        <p>Select a role from the left to manage permissions.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' });
const api = useApi();
const roles = ref([]);
const allPermissions = ref([]);
const selectedRole = ref(null);
const selectedPermIds = ref([]);
const saving = ref(false);

const modules = computed(() => {
  const mods = new Set();
  allPermissions.value.forEach(p => mods.add(p.module));
  return Array.from(mods);
});

const getPermsForModule = (mod) => {
  return allPermissions.value.filter(p => p.module === mod);
};

const fetchData = async () => {
  const [rRes, pRes] = await Promise.all([
    api.get('/permissions/roles'),
    api.get('/permissions/permissions')
  ]);
  roles.value = rRes;
  allPermissions.value = pRes;
};

const selectRole = (role) => {
  selectedRole.value = role;
  selectedPermIds.value = role.Permissions.map(p => p.id);
};

const savePermissions = async () => {
  saving.value = true;
  try {
    await api.post('/permissions/assign', {
      roleId: selectedRole.value.id,
      permissionIds: selectedPermIds.value
    });
    alert('Permissions updated successfully');
    fetchData();
  } catch (err) {
    alert('Failed to update');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.grid-layout { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; }
.role-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 0.75rem; cursor: pointer; transition: all 0.2s; }
.role-item:hover { background: rgba(99, 102, 241, 0.05); border-color: var(--primary); }
.role-item.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
.modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.module-card { background: var(--background); padding: 1rem; border-radius: var(--radius); }
.module-title { text-transform: capitalize; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.75rem; color: var(--primary); }
.perm-checkbox { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0; cursor: pointer; font-size: 0.9rem; text-transform: capitalize; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem; color: var(--text-muted); }
</style>
