const router = require('express').Router();
const { Menu } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    res.json(menus);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create menu item (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update menu item (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu item not found' });
    await menu.update(req.body);
    res.json(menu);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete menu item (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu item not found' });
    await menu.destroy();
    res.json({ message: 'Menu item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
