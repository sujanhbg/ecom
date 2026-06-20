<template>
  <div class="products-page fade-in">
    <div class="page-header mb-4">
      <div class="header-info">
        <h1>Products</h1>
        <p class="text-muted">Manage your store inventory, variations, and media.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add New Product
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4 filters-card">
      <div class="filters-grid">
        <div class="input-group mb-0">
          <input v-model="filters.search" type="text" placeholder="Search products..." @input="debouncedFetch">
        </div>
        <div class="input-group mb-0">
          <select v-model="filters.categoryId" @change="fetchProducts">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="input-group mb-0">
          <select v-model="filters.status" @change="fetchProducts">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card">
      <div class="table-container" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <div class="product-info">
                  <img :src="resolveImage(product.image)" alt="Img">
                  <div>
                    <div class="fw-bold">{{ product.name }}</div>
                    <div class="text-muted small">{{ product.unit }} | {{ product.variations?.length || 0 }} variations</div>
                  </div>
                </div>
              </td>
              <td>{{ product.sku }}</td>
              <td>{{ product.Category?.name || 'N/A' }}</td>
              <td>{{ product.price }} BDT</td>
              <td>
                <span :class="product.stock <= 5 ? 'text-danger fw-bold' : ''">{{ product.stock }}</span>
              </td>
              <td>
                <span :class="['badge', getStatusBadge(product.status)]">{{ product.status }}</span>
              </td>
              <td class="text-end">
                <div class="actions">
                  <button @click="openDetail(product)" class="btn-icon view" title="View Details"><i class="fas fa-eye"></i></button>
                  <button @click="openModal(product)" class="btn-icon edit" title="Edit"><i class="fas fa-edit"></i></button>
                  <button @click="deleteProduct(product.id)" class="btn-icon delete" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="7" class="text-center py-5">No products found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x color-primary"></i>
      </div>

      <!-- Pagination -->
      <div class="pagination mt-4" v-if="totalPages > 1">
        <button :disabled="filters.page === 1" @click="changePage(filters.page - 1)" class="btn btn-sm btn-outline">Prev</button>
        <span class="px-3">Page {{ filters.page }} of {{ totalPages }}</span>
        <button :disabled="filters.page === totalPages" @click="changePage(filters.page + 1)" class="btn btn-sm btn-outline">Next</button>
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveProduct" class="modal-form">
          <!-- Basic Info -->
          <div class="section-title">Basic Information</div>
          <div class="input-group">
            <label>Product Name</label>
            <input v-model="form.name" type="text" required>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>SKU</label>
              <input v-model="form.sku" type="text" placeholder="Auto-generated if empty">
            </div>
            <div class="input-group">
              <label>Unit</label>
              <input v-model="form.unit" type="text" placeholder="pcs, set, kg, etc.">
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Category</label>
              <select v-model="form.categoryId" required>
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Supplier</label>
              <select v-model="form.supplierId">
                <option value="">Select Supplier</option>
                <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
              </select>
            </div>
          </div>
          <div class="grid-3">
            <div class="input-group">
              <label>Cost Price</label>
              <input v-model="form.costPrice" type="number" step="0.01">
            </div>
            <div class="input-group">
              <label>Selling Price</label>
              <input v-model="form.price" type="number" step="0.01" required>
            </div>
            <div class="input-group">
              <label>Stock</label>
              <input v-model="form.stock" type="number" required>
            </div>
          </div>

          <!-- Media Section -->
          <div class="section-title">Product Media</div>
          <div class="media-upload-grid">
            <div class="input-group">
              <label>Main Image (Auto-resized 1200x1200px)</label>
              <input type="file" @change="onFileChange($event, 'image')" accept="image/*">
              <div v-if="previews.image || form.image" class="preview-box">
                <img :src="previews.image || resolveImage(form.image)" alt="Preview">
              </div>
            </div>
            <div class="input-group">
              <label>Gallery Images (Multiple)</label>
              <input type="file" multiple @change="onFileChange($event, 'gallery')" accept="image/*">
              <div class="gallery-previews">
                <div v-for="(img, idx) in previews.gallery" :key="'new-gal-'+idx" class="mini-preview position-relative">
                  <img :src="img" alt="Gallery">
                  <button type="button" class="remove-media-btn-mini" @click="removeNewGalleryImage(idx)" title="Remove image">&times;</button>
                </div>
                <div v-for="(img, idx) in (Array.isArray(form.images) ? form.images : [])" :key="'ex-gal-'+idx" class="mini-preview position-relative">
                  <img :src="resolveImage(img)" alt="Existing">
                  <button type="button" class="remove-media-btn-mini" @click="removeExistingGalleryImage(idx)" title="Remove image">&times;</button>
                </div>
              </div>
            </div>
            <div class="input-group">
              <label>Videos (Multiple)</label>
              <input type="file" multiple @change="onFileChange($event, 'videos')" accept="video/*">
              <div class="video-previews mt-2">
                <!-- New videos previews -->
                <div v-for="(vid, idx) in previews.videos" :key="'new-vid-'+idx" class="video-item position-relative">
                  <video :src="vid" controls class="video-thumb"></video>
                  <button type="button" class="remove-media-btn" @click="removeNewVideo(idx)" title="Remove video">&times;</button>
                </div>
                <!-- Existing saved videos -->
                <div v-for="(vid, idx) in (Array.isArray(form.videos) ? form.videos : [])" :key="'ex-vid-'+idx" class="video-item position-relative">
                  <video :src="resolveVideo(vid)" controls class="video-thumb"></video>
                  <button type="button" class="remove-media-btn" @click="removeExistingVideo(idx)" title="Remove video">&times;</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Variations Section -->
          <div class="section-title flex-header">
            <span>Product Variations</span>
            <button type="button" class="btn btn-sm btn-outline" @click="addVariation">
              <i class="fas fa-plus"></i> Add Variation
            </button>
          </div>
          <div class="variations-list">
            <div v-for="(v, idx) in form.variations" :key="idx" class="variation-item card">
              <div class="variation-grid">
                <div class="input-group">
                  <label>Name</label>
                  <input v-model="v.name" type="text" placeholder="e.g. XL, Red" required>
                </div>
                <div class="input-group">
                  <label>Price</label>
                  <input v-model="v.price" type="number" step="0.01" placeholder="Override price">
                </div>
                <div class="input-group">
                  <label>Stock</label>
                  <input v-model="v.stock" type="number" required>
                </div>
                <div class="input-group">
                  <label>Variation Image</label>
                  <input type="file" @change="onVariationFileChange($event, idx)" accept="image/*">
                  <div v-if="v.preview || v.image" class="mini-preview mt-2">
                    <img :src="v.preview || resolveImage(v.image)" alt="Var Img">
                  </div>
                </div>
                <button type="button" class="remove-var" @click="removeVariation(idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="input-group mt-4">
            <label>Description</label>
            <textarea v-model="form.description" rows="4"></textarea>
          </div>

          <!-- Product SEO Meta Tags -->
          <div class="seo-settings-section mt-3 mb-3">
            <h4 class="seo-section-title mb-2"><i class="fas fa-search"></i> Product SEO Meta Tags</h4>
            <div class="input-group">
              <label>Meta Title (SEO)</label>
              <input v-model="form.metaTitle" type="text" placeholder="Default is Product Name">
            </div>
            <div class="input-group mt-2">
              <label>Meta Description (SEO)</label>
              <textarea v-model="form.metaDescription" rows="2" placeholder="Write a search engine friendly summary..."></textarea>
            </div>
          </div>

          <div class="input-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="!saving">Save Product</span>
              <i v-else class="fas fa-spinner fa-spin"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Product Detail Drawer -->
  <Transition name="drawer">
    <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
      <div class="detail-drawer">
        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <span :class="['badge', getStatusBadge(viewProduct?.status)]">{{ viewProduct?.status }}</span>
            <h3>{{ viewProduct?.name }}</h3>
          </div>
          <div class="drawer-header-actions">
            <button @click="openModal(viewProduct); closeDetail()" class="btn btn-sm btn-outline"><i class="fas fa-edit"></i> Edit</button>
            <button @click="closeDetail" class="close-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>

        <!-- Main image + meta -->
        <div class="drawer-hero">
          <div class="hero-img-wrap">
            <img :src="resolveImage(viewProduct?.image)" :alt="viewProduct?.name" class="hero-img">
          </div>
          <div class="hero-meta">
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label"><i class="fas fa-barcode"></i> SKU</span>
                <span class="meta-value">{{ viewProduct?.sku || '—' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><i class="fas fa-tag"></i> Category</span>
                <span class="meta-value">{{ viewProduct?.Category?.name || 'N/A' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><i class="fas fa-truck"></i> Supplier</span>
                <span class="meta-value">{{ viewProduct?.Supplier?.name || 'N/A' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><i class="fas fa-box"></i> Unit</span>
                <span class="meta-value">{{ viewProduct?.unit || '—' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><i class="fas fa-coins"></i> Cost Price</span>
                <span class="meta-value">{{ viewProduct?.costPrice || 0 }} BDT</span>
              </div>
              <div class="meta-item highlight">
                <span class="meta-label"><i class="fas fa-money-bill"></i> Sell Price</span>
                <span class="meta-value price">{{ viewProduct?.price }} BDT</span>
              </div>
              <div class="meta-item" :class="viewProduct?.stock <= 5 ? 'danger' : ''">
                <span class="meta-label"><i class="fas fa-warehouse"></i> Stock</span>
                <span class="meta-value">{{ viewProduct?.stock }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="drawer-section" v-if="viewProduct?.description">
          <div class="section-label">Description</div>
          <p class="description-text">{{ viewProduct.description }}</p>
        </div>

        <!-- Gallery -->
        <div class="drawer-section" v-if="Array.isArray(viewProduct?.images) && viewProduct.images.length">
          <div class="section-label">Gallery ({{ viewProduct.images.length }} images)</div>
          <div class="gallery-grid">
            <div v-for="(img, i) in viewProduct.images" :key="i" class="gallery-cell">
              <img :src="resolveImage(img)" :alt="'Gallery '+i">
            </div>
          </div>
        </div>

        <!-- Videos -->
        <div class="drawer-section" v-if="Array.isArray(viewProduct?.videos) && viewProduct.videos.length">
          <div class="section-label">Videos ({{ viewProduct.videos.length }})</div>
          <div class="video-row">
            <div v-for="(vid, i) in viewProduct.videos" :key="i" class="video-card">
              <video :src="resolveVideo(vid)" controls></video>
            </div>
          </div>
        </div>

        <!-- Variations -->
        <div class="drawer-section" v-if="viewProduct?.variations?.length">
          <div class="section-label">Variations ({{ viewProduct.variations.length }})</div>
          <div class="variations-table">
            <div class="var-row var-head">
              <span>Name</span><span>Price</span><span>Stock</span><span>Image</span>
            </div>
            <div v-for="v in viewProduct.variations" :key="v.id" class="var-row">
              <span class="fw-bold">{{ v.name }}</span>
              <span>{{ v.price || viewProduct.price }} BDT</span>
              <span :class="v.stock <= 5 ? 'text-danger' : ''">{{ v.stock }}</span>
              <span>
                <img v-if="v.image" :src="resolveImage(v.image)" class="var-thumb">
                <span v-else class="text-muted small">—</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          <span class="text-muted small">ID: {{ viewProduct?.id }} &nbsp;·&nbsp; Created: {{ viewProduct?.createdAt ? new Date(viewProduct.createdAt).toLocaleDateString() : '—' }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const config = useRuntimeConfig();
const imageUrl = config.public.imageUrl;
const videoUrl = config.public.videoUrl;

// Helper: resolve image path → full URL
// Paths from backend look like: /uploads/products/filename.webp
const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Strip any double-slash and ensure clean join
  return `${imageUrl}${path.startsWith('/') ? path : '/' + path}`;
};

// Helper: resolve video path → full URL
const resolveVideo = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${videoUrl}${path.startsWith('/') ? path : '/' + path}`;
};

// Helper: safely parse a JSON array field from the DB
// The DB JSON column can come back as a string OR already-parsed array
const parseJsonArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed.filter(Boolean) : []; }
    catch { return []; }
  }
  return [];
};

const api = useApi();
const products = ref([]);
const categories = ref([]);
const suppliers = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const showDetail = ref(false);
const viewProduct = ref(null);

const openDetail = (product) => {
  // Normalize JSON array fields so we always get a real array, not a string
  viewProduct.value = {
    ...product,
    images: parseJsonArray(product.images),
    videos: parseJsonArray(product.videos)
  };
  showDetail.value = true;
  document.body.style.overflow = 'hidden';
};

const closeDetail = () => {
  showDetail.value = false;
  viewProduct.value = null;
  document.body.style.overflow = '';
};
const editingProduct = ref(null);
const totalPages = ref(1);

const filters = reactive({
  search: '',
  categoryId: '',
  status: '',
  page: 1,
  limit: 10
});

const form = reactive({
  name: '',
  sku: '',
  unit: 'pcs',
  categoryId: '',
  supplierId: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  description: '',
  status: 'active',
  image: null,
  images: [],
  videos: [],
  variations: [],
  metaTitle: '',
  metaDescription: ''
});

const files = reactive({
  image: null,
  gallery: [],
  videos: []
});

const previews = reactive({
  image: null,
  gallery: [],
  videos: []
});

const fetchProducts = async () => {
  loading.value = true;
  try {
    const res = await api.get('/products', { params: filters });
    products.value = res.data;
    totalPages.value = res.pages;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const flattenCategories = (list, depth = 0) => {
  const flat = [];
  list.forEach(item => {
    flat.push({
      id: item.id,
      name: '— '.repeat(depth) + item.name
    });
    if (item.children && item.children.length) {
      flat.push(...flattenCategories(item.children, depth + 1));
    }
  });
  return flat;
};

const fetchCategories = async () => {
  const res = await api.get('/categories');
  categories.value = flattenCategories(res);
};

const fetchSuppliers = async () => {
  const res = await api.get('/suppliers');
  suppliers.value = res.data;
};

const debouncedFetch = useDebounce(fetchProducts, 500);

const changePage = (p) => {
  filters.page = p;
  fetchProducts();
};

const addVariation = () => {
  form.variations.push({
    name: '',
    price: null,
    stock: 0,
    image: null,
    preview: null,
    file: null
  });
};

const removeVariation = (idx) => {
  form.variations.splice(idx, 1);
};

const onFileChange = (e, type) => {
  const selected = e.target.files;
  if (!selected.length) return;

  if (type === 'image') {
    files.image = selected[0];
    previews.image = URL.createObjectURL(selected[0]);
  } else if (type === 'gallery') {
    files.gallery = Array.from(selected);
    previews.gallery = files.gallery.map(f => URL.createObjectURL(f));
  } else if (type === 'videos') {
    files.videos = Array.from(selected);
    previews.videos = files.videos.map(f => URL.createObjectURL(f));
  }
};

const removeNewGalleryImage = (idx) => {
  files.gallery.splice(idx, 1);
  previews.gallery.splice(idx, 1);
};

const removeExistingGalleryImage = (idx) => {
  form.images.splice(idx, 1);
};

const removeNewVideo = (idx) => {
  files.videos.splice(idx, 1);
  previews.videos.splice(idx, 1);
};

const removeExistingVideo = (idx) => {
  form.videos.splice(idx, 1);
};

const onVariationFileChange = (e, idx) => {
  const file = e.target.files[0];
  if (!file) return;
  form.variations[idx].file = file;
  form.variations[idx].preview = URL.createObjectURL(file);
};

const openModal = (product = null) => {
  editingProduct.value = product;
  
  // Reset previews and files
  previews.image = null;
  previews.gallery = [];
  previews.videos = [];
  files.image = null;
  files.gallery = [];
  files.videos = [];

  if (product) {
    Object.keys(form).forEach(key => {
      if (key === 'variations') {
        form.variations = product.variations?.map(v => ({ ...v, preview: null, file: null })) || [];
      } else if (key === 'images' || key === 'videos') {
        // Always normalize to a real array — DB JSON can return a raw string
        form[key] = parseJsonArray(product[key]);
      } else {
        form[key] = product[key] || (key === 'price' || key === 'stock' || key === 'costPrice' ? 0 : '');
      }
    });
  } else {
    Object.keys(form).forEach(key => {
      if (key === 'variations') form.variations = [];
      else if (key === 'images' || key === 'videos') form[key] = [];
      else form[key] = key === 'unit' ? 'pcs' : (key === 'status' ? 'active' : (key === 'price' || key === 'stock' || key === 'costPrice' ? 0 : ''));
    });
  }
  showModal.value = true;
};

const saveProduct = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    
    // Append basic fields
    Object.keys(form).forEach(key => {
      if (key !== 'variations' && key !== 'images' && key !== 'videos' && key !== 'image') {
        formData.append(key, form[key]);
      }
    });

    // Append existing gallery images and videos
    formData.append('existingImages', JSON.stringify(form.images || []));
    formData.append('existingVideos', JSON.stringify(form.videos || []));

    // Append main image if new one selected
    if (files.image) formData.append('image', files.image);

    // Append gallery images
    files.gallery.forEach(f => formData.append('gallery', f));

    // Append videos
    files.videos.forEach(f => formData.append('videos', f));

    // Append variations and map their images
    const variationsToSave = form.variations.map(v => ({
      name: v.name,
      price: v.price,
      stock: v.stock,
      image: v.image // Keep existing image path if no new file
    }));
    formData.append('variations', JSON.stringify(variationsToSave));

    const varImageMap = [];
    form.variations.forEach((v, idx) => {
      if (v.file) {
        formData.append('variationImages', v.file);
        varImageMap.push(idx);
      }
    });
    formData.append('variationImageMap', JSON.stringify(varImageMap));

    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value.id}`, formData);
    } else {
      await api.post('/products', formData);
    }
    showModal.value = false;
    fetchProducts();
  } catch (err) {
    alert(err.data?.error || 'Failed to save product');
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.data?.error || 'Failed to delete product');
    }
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'active': return 'badge-success';
    case 'inactive': return 'badge-danger';
    case 'draft': return 'badge-warning';
    default: return 'badge-secondary';
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
  fetchSuppliers();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-info img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--background);
}

.section-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--background);
  color: var(--primary);
}

.flex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-upload-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .media-upload-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.preview-box {
  margin-top: 10px;
  width: 150px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed var(--border);
}

.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.mini-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.mini-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variation-item {
  position: relative;
  margin-bottom: 1rem;
  background: var(--background);
}

.variation-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 640px) {
  .variation-grid {
    grid-template-columns: 2fr 1fr 1fr 2fr;
    align-items: start;
  }
}

.remove-var {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  font-size: 1.5rem;
  background: transparent;
  color: var(--text-muted);
}

.grid-2, .grid-3 { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 1rem; 
}

@media (min-width: 640px) {
  .grid-2 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.video-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.video-item {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.video-thumb {
  width: 160px;
  height: 100px;
  object-fit: cover;
  display: block;
}

/* ─── View button ─── */
.btn-icon.view:hover { background: #e0f2fe; color: #0284c7; }

/* ─── Drawer Transition ─── */
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active .detail-drawer,
.drawer-leave-active .detail-drawer { transition: transform 0.3s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from .detail-drawer,
.drawer-leave-to .detail-drawer { transform: translateX(100%); }

/* ─── Drawer Overlay ─── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(3px);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
}

/* ─── Drawer Panel ─── */
.detail-drawer {
  width: 100%;
  max-width: 640px;
  height: 100%;
  background: var(--surface);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0,0,0,0.18);
}

/* Drawer Header */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 10;
}
.drawer-title-group { display: flex; flex-direction: column; gap: 0.4rem; }
.drawer-title-group h3 { margin: 0; font-size: 1.25rem; }
.drawer-header-actions { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
.close-btn { font-size: 1.2rem; background: transparent; color: var(--text-muted); padding: 0.25rem; }

/* Hero Section */
.drawer-hero {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}
@media (max-width: 500px) {
  .drawer-hero { grid-template-columns: 1fr; }
}

.hero-img-wrap {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--background);
}
.hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Meta grid */
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.meta-item {
  background: var(--background);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.meta-item.highlight { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); }
.meta-item.danger { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); }
.meta-label { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem; }
.meta-value { font-weight: 600; font-size: 0.95rem; color: var(--text); }
.meta-value.price { color: var(--primary); font-size: 1.1rem; }

/* Drawer Sections */
.drawer-section { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.85rem;
}
.description-text { font-size: 0.9rem; line-height: 1.7; color: var(--text); margin: 0; }

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
}
.gallery-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.gallery-cell img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Videos */
.video-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.video-card { border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.video-card video { width: 200px; height: 130px; object-fit: cover; display: block; }

/* Variations Table */
.variations-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.var-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 60px;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border);
  align-items: center;
}
.var-row:last-child { border-bottom: none; }
.var-head {
  background: var(--background);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.var-thumb { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border); }

/* Drawer Footer */
.drawer-footer {
  padding: 1rem 1.5rem;
  margin-top: auto;
  border-top: 1px solid var(--border);
  background: var(--background);
}

.position-relative {
  position: relative;
}

.remove-media-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 5;
  transition: background-color 0.2s;
}

.remove-media-btn-mini {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  z-index: 5;
  transition: background-color 0.2s;
}

.remove-media-btn:hover, .remove-media-btn-mini:hover {
  background: rgb(220, 38, 38);
}

.seo-section-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--primary);
  margin-top: 1.5rem;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 0.4rem;
}
</style>
