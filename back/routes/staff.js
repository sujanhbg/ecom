const router = require('express').Router();
const { User } = require('../models');
const { auth, adminOnly, superAdminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// List staff
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page=1, limit=20, search } = req.query;
    const where = { role: { [Op.in]: ['admin','staff'] } };
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

// Create staff
router.post('/', auth, superAdminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!['admin','staff'].includes(data.role)) data.role = 'staff';
    const user = await User.create(data);
    const result = user.toJSON(); delete result.password;
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update staff
router.put('/:id', auth, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Staff not found' });
    const updates = { ...req.body }; delete updates.password;
    await user.update(updates);
    const result = user.toJSON(); delete result.password;
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete staff
router.delete('/:id', auth, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Staff not found' });
    await user.destroy();
    res.json({ message: 'Staff deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
