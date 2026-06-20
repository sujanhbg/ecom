<template>
  <div class="static-page container fade-in">
    <div class="page-header-banner">
      <div class="banner-content">
        <h1>{{ page?.title || 'Contact Us' }}</h1>
        <p>Get in touch with us for bulk orders, customization queries, or generic questions.</p>
      </div>
    </div>

    <div class="contact-grid mt-5">
      <!-- Contact Info Card -->
      <div class="page-content-card info-card">
        <div v-if="!loading" class="content-body" v-html="page?.content"></div>
        <div v-else class="text-center py-5">
          <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
        </div>

        <div class="social-channels mt-4">
          <h4>Connect with us</h4>
          <div class="social-icons">
            <a href="#" class="social-btn facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-btn instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-btn twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-btn youtube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>

      <!-- Contact Message Form -->
      <div class="page-content-card form-card">
        <h3>Send us a Message</h3>
        <p class="text-muted small mb-4">Complete the form below and we will get back to you within 24 hours.</p>
        
        <form @submit.prevent="sendMessage" class="contact-form">
          <div class="input-row">
            <div class="form-group">
              <label>Your Name</label>
              <input v-model="form.name" type="text" required placeholder="John Doe">
            </div>
            <div class="form-group">
              <label>Your Email</label>
              <input v-model="form.email" type="email" required placeholder="john@example.com">
            </div>
          </div>
          <div class="form-group">
            <label>Subject</label>
            <input v-model="form.subject" type="text" required placeholder="Bulk Order Query, Return, etc.">
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea v-model="form.message" rows="5" required placeholder="Write your message here..."></textarea>
          </div>
          <button type="submit" class="btn-submit" :disabled="sending">
            <span v-if="!sending"><i class="far fa-paper-plane"></i> Send Message</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const page = ref(null);
const loading = ref(true);
const sending = ref(false);

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const fetchPage = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/pages/contact`);
    page.value = data;
  } catch (e) {
    console.error('Failed to load contact page:', e);
  } finally {
    loading.value = false;
  }
};

const sendMessage = async () => {
  sending.value = true;
  // Mock sending message
  setTimeout(() => {
    sending.value = false;
    alert('Thank you! Your message has been sent successfully. We will get back to you shortly.');
    form.name = '';
    form.email = '';
    form.subject = '';
    form.message = '';
  }, 1000);
};

onMounted(fetchPage);

useHead(() => ({
  title: page.value?.metaTitle || page.value?.title || 'Contact Us — Demo Store',
  meta: [
    { name: 'description', content: page.value?.metaDescription || 'Contact our B2B wholesale customer support team via phone, email, or contact form.' },
    { name: 'keywords', content: page.value?.metaKeywords || 'B2B, wholesale, packaging' }
  ]
}));
</script>

<style scoped>
.static-page {
  padding-top: 30px;
  padding-bottom: 50px;
}

.page-header-banner {
  position: relative;
  background-image: linear-gradient(135deg, #ff6b6b, #ff8e53);
  border-radius: 12px;
  padding: 60px 40px;
  color: white;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.15);
  text-align: center;
}

.banner-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.banner-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 30px;
}

.page-content-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.info-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.content-body :deep(p) {
  font-size: 1.05rem;
  line-height: 1.75;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.content-body :deep(strong) {
  color: #1f2937;
}

.social-channels h4 {
  font-size: 1.1rem;
  color: #1f2937;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-btn {
  display: inline-flex;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  transition: transform 0.2s, filter 0.2s;
}

.social-btn:hover {
  transform: translateY(-2px);
  filter: brightness(0.9);
}

.social-btn.facebook { background-color: #1877f2; }
.social-btn.instagram { background-image: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aec 90%); }
.social-btn.twitter { background-color: #1da1f2; }
.social-btn.youtube { background-color: #ff0000; }

.form-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-group input, .form-group textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: #ff6b6b;
}

.btn-submit {
  align-self: flex-start;
  padding: 0.85rem 2rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(255, 107, 107, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 107, 107, 0.3);
}

.color-primary {
  color: #ff6b6b;
}

@media (max-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header-banner {
    padding: 40px 20px;
  }
  .banner-content h1 {
    font-size: 2rem;
  }
  .page-content-card {
    padding: 24px;
  }
  .input-row {
    grid-template-columns: 1fr;
  }
}
</style>
