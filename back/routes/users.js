const router = require('express').Router();
const { User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// List users (clients)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page=1, limit=20, search, status, role } = req.query;
    const where = {};
    if (role) where.role = role; else where.role = 'client';
    if (status) where.status = status;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
    const { rows, count } = await User.findAndCountAll({
      where, attributes: { exclude: ['password'] },
      limit: +limit, offset: (+page-1)*(+limit), order: [['createdAt','DESC']]
    });
    res.json({ data: rows, total: count, page: +page, pages: Math.ceil(count/+limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single user
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create user
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.create(req.body);
    const data = user.toJSON(); delete data.password;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update user
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updates = { ...req.body }; delete updates.password;
    await user.update(updates);
    const data = user.toJSON(); delete data.password;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete user
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
