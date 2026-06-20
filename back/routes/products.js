const router = require('express').Router();
const { Product, Category, Supplier, ProductVariation, sequelize } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { processProductImage } = require('../middleware/imageProcessor');
const { Op } = require('sequelize');

// Helper to handle multiple file uploads and processing
const handleFiles = async (req) => {
  const data = { ...req.body };
  
  // Process main image
  if (req.files?.image?.[0]) {
    data.image = await processProductImage(req.files.image[0]);
  }

  // Parse existing images/videos sent from frontend
  let existingImages = [];
  if (req.body.existingImages) {
    try {
      existingImages = typeof req.body.existingImages === 'string'
        ? JSON.parse(req.body.existingImages)
        : req.body.existingImages;
    } catch (e) {
      existingImages = [];
    }
    delete data.existingImages;
  }

  let existingVideos = [];
  if (req.body.existingVideos) {
    try {
      existingVideos = typeof req.body.existingVideos === 'string'
        ? JSON.parse(req.body.existingVideos)
        : req.body.existingVideos;
    } catch (e) {
      existingVideos = [];
    }
    delete data.existingVideos;
  }

  // Process gallery images
  if (req.files?.gallery) {
    const galleryPaths = [];
    for (const file of req.files.gallery) {
      const path = await processProductImage(file);
      if (path) galleryPaths.push(path);
    }
    data.images = [...existingImages, ...galleryPaths]; // Merge existing and new
  } else if (req.body.existingImages) {
    data.images = existingImages;
  }

  // Process videos (no processing, just save path)
  if (req.files?.videos) {
    const newVideos = req.files.videos.map(f => `/uploads/products/${f.filename}`);
    data.videos = [...existingVideos, ...newVideos]; // Merge existing and new
  } else if (req.body.existingVideos) {
    data.videos = existingVideos;
  }

  return data;
};

// List
router.get('/', async (req, res) => {
  try {
    const { page=1, limit=20, search, categoryId, status, supplierId, featured, sort } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (featured === 'true') where.featured = true;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } }
    ];

    // Determine ordering
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'oldest') {
      order = [['createdAt', 'ASC']];
    }

    // soldQuantity subquery
    const soldSubquery = `(
      SELECT COALESCE(SUM(oi.quantity), 0)
      FROM OrderItems oi
      INNER JOIN Orders o ON oi.orderId = o.id
      WHERE oi.productId = Product.id
      AND o.paymentStatus = 'paid'
    )`;

    const { rows, count } = await Product.findAndCountAll({
      where,
      attributes: {
        include: [[sequelize.literal(soldSubquery), 'soldQuantity']]
      },
      include: [
        { model: Category, attributes: ['id','name','slug'] },
        { model: Supplier, attributes: ['id','name'] },
        { model: ProductVariation, as: 'variations' }
      ],
      limit: +limit, offset: (+page-1)*(+limit), order,
      distinct: true
    });
    res.json({ data: rows, total: count, page: +page, pages: Math.ceil(count/+limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// Get single
router.get('/:id', async (req, res) => {
  try {
    const soldSubquery = `(
      SELECT COALESCE(SUM(oi.quantity), 0)
      FROM OrderItems oi
      INNER JOIN Orders o ON oi.orderId = o.id
      WHERE oi.productId = Product.id
      AND o.paymentStatus = 'paid'
    )`;
    const product = await Product.findByPk(req.params.id, {
      attributes: { include: [[sequelize.literal(soldSubquery), 'soldQuantity']] },
      include: [
        { model: Category, attributes: ['id','name','slug'] },
        { model: Supplier },
        { model: ProductVariation, as: 'variations' }
      ]
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


const productUploads = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'variationImages', maxCount: 20 }
]);

// Create
router.post('/', auth, adminOnly, (req, res, next) => { req.uploadSubDir = 'products'; next(); },
  productUploads, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const data = await handleFiles(req);
    
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if (!data.sku) data.sku = 'SKU-' + Date.now();
    
    // Parse variations if sent as string
    let variations = [];
    if (data.variations) {
      variations = typeof data.variations === 'string' ? JSON.parse(data.variations) : data.variations;
    }

    const product = await Product.create(data, { transaction });

    // Handle variation images if uploaded
    if (req.files?.variationImages) {
      // Logic to map variationImages to specific variations
      // We expect a field 'variationImageMap' which is an array of indices
      const imageMap = data.variationImageMap ? JSON.parse(data.variationImageMap) : [];
      for (let i = 0; i < req.files.variationImages.length; i++) {
        const varIdx = imageMap[i];
        if (variations[varIdx]) {
          variations[varIdx].image = await processProductImage(req.files.variationImages[i]);
        }
      }
    }

    if (variations.length > 0) {
      await ProductVariation.bulkCreate(
        variations.map(v => ({ ...v, productId: product.id })),
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json(product);
  } catch (err) { 
    await transaction.rollback();
    res.status(500).json({ error: err.message }); 
  }
});

// Update
router.put('/:id', auth, adminOnly, (req, res, next) => { req.uploadSubDir = 'products'; next(); },
  productUploads, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const data = await handleFiles(req);
    
    // Parse variations
    let variations = [];
    if (data.variations) {
      variations = typeof data.variations === 'string' ? JSON.parse(data.variations) : data.variations;
    }

    // Handle variation images
    if (req.files?.variationImages) {
      const imageMap = data.variationImageMap ? JSON.parse(data.variationImageMap) : [];
      for (let i = 0; i < req.files.variationImages.length; i++) {
        const varIdx = imageMap[i];
        if (variations[varIdx]) {
          variations[varIdx].image = await processProductImage(req.files.variationImages[i]);
        }
      }
    }

    await product.update(data, { transaction });

    // Simple strategy: delete existing variations and recreate
    // (In production, you'd likely want to sync them)
    await ProductVariation.destroy({ where: { productId: product.id }, transaction });
    if (variations.length > 0) {
      await ProductVariation.bulkCreate(
        variations.map(v => ({ ...v, productId: product.id })),
        { transaction }
      );
    }

    await transaction.commit();
    res.json(product);
  } catch (err) { 
    await transaction.rollback();
    res.status(500).json({ error: err.message }); 
  }
});

// Delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
