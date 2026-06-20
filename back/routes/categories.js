const router = require('express').Router();
const { Category } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// List all categories (tree)
router.get('/', async (req, res) => {
  try {
    const cats = await Category.findAll({
      where: { parentId: null },
      include: [{ model: Category, as: 'children', include: [{ model: Category, as: 'children' }] }],
      order: [['sortOrder','ASC'],['name','ASC']]
    });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Flat list
router.get('/flat', async (req, res) => {
  try {
    const cats = await Category.findAll({ include: [{ model: Category, as: 'parent', attributes: ['id','name'] }], order: [['name','ASC']] });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single
router.get('/:id', async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: 'children' }, { model: Category, as: 'parent' }]
    });
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create
router.post('/', auth, adminOnly, (req, res, next) => { req.uploadSubDir = 'categories'; next(); },
  upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if (req.file) data.image = `/uploads/categories/${req.file.filename}`;
    const cat = await Category.create(data);
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update
router.put('/:id', auth, adminOnly, (req, res, next) => { req.uploadSubDir = 'categories'; next(); },
  upload.single('image'), async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/categories/${req.file.filename}`;
    await cat.update(data);
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await Category.update({ parentId: null }, { where: { parentId: cat.id } });
    await cat.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
