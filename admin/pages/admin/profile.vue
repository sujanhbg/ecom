<template>
  <div class="profile-page fade-in">
    <div class="grid-layout">
      <!-- Profile Info -->
      <div class="card profile-info-card">
        <h3>Profile Information</h3>
        <p class="text-muted mb-4">Update your account details and profile picture.</p>

        <form @submit.prevent="updateProfile">
          <div class="avatar-upload">
            <div class="avatar-wrapper shadow">
              <img :src="avatarPreview || auth.user?.avatar || 'https://ui-avatars.com/api/?name=' + auth.user?.name" alt="Avatar">
              <label for="avatar-input" class="upload-btn">
                <i class="fas fa-camera"></i>
              </label>
              <input id="avatar-input" type="file" @change="onFileChange" hidden accept="image/*">
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Full Name</label>
              <input v-model="profileForm.name" type="text" required>
            </div>
            <div class="input-group">
              <label>Email Address</label>
              <input v-model="profileForm.email" type="email" required>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Phone Number</label>
              <input v-model="profileForm.phone" type="text">
            </div>
            <div class="input-group">
              <label>City</label>
              <input v-model="profileForm.city" type="text">
            </div>
          </div>

          <div class="input-group">
            <label>Address</label>
            <textarea v-model="profileForm.address" rows="3"></textarea>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="updatingProfile">
            <span v-if="!updatingProfile">Save Changes</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>
      </div>

      <!-- Password Change -->
      <div class="card password-card">
        <h3>Change Password</h3>
        <p class="text-muted mb-4">Ensure your account is using a long, random password to stay secure.</p>

        <form @submit.prevent="changePassword">
          <div class="input-group">
            <label>Current Password</label>
            <input v-model="passwordForm.currentPassword" type="password" required>
          </div>
          <div class="input-group">
            <label>New Password</label>
            <input v-model="passwordForm.newPassword" type="password" required>
          </div>
          <div class="input-group">
            <label>Confirm New Password</label>
            <input v-model="passwordForm.confirmPassword" type="password" required>
          </div>

          <div v-if="passError" class="error-msg mb-3">{{ passError }}</div>
          <div v-if="passSuccess" class="success-msg mb-3">{{ passSuccess }}</div>

          <button type="submit" class="btn btn-primary" :disabled="updatingPassword">
            <span v-if="!updatingPassword">Update Password</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
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

const auth = useAuthStore();
const api = useApi();

const profileForm = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  address: auth.user?.address || '',
  city: auth.user?.city || '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const avatarFile = ref(null);
const avatarPreview = ref(null);
const updatingProfile = ref(false);
const updatingPassword = ref(false);
const passError = ref('');
const passSuccess = ref('');

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
  }
};

const updateProfile = async () => {
  updatingProfile.value = true;
  try {
    const formData = new FormData();
    Object.keys(profileForm).forEach(key => formData.append(key, profileForm[key]));
    if (avatarFile.value) formData.append('avatar', avatarFile.value);

    const updatedUser = await api.put('/auth/profile', formData);
    auth.user = updatedUser;
    alert('Profile updated successfully!');
  } catch (err) {
    alert(err.data?.error || 'Failed to update profile');
  } finally {
    updatingProfile.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passError.value = 'Passwords do not match';
    return;
  }

  updatingPassword.value = true;
  passError.value = '';
  passSuccess.value = '';

  try {
    await api.put('/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    passSuccess.value = 'Password updated successfully!';
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (err) {
    passError.value = err.data?.error || 'Failed to update password';
  } finally {
    updatingPassword.value = false;
  }
};
</script>

<style scoped>
.grid-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
}

.upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.success-msg {
  color: #15803d;
  background: #dcfce7;
  padding: 0.75rem;
  border-radius: var(--radius);
  font-size: 0.85rem;
}

.error-msg {
  color: #b91c1c;
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: var(--radius);
  font-size: 0.85rem;
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>
