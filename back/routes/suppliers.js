const router = require('express').Router();
const { Supplier } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page=1, limit=20, search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { company: { [Op.like]: `%${search}%` } }
    ];
    const { rows, count } = await Supplier.findAndCountAll({
      where, limit: +limit, offset: (+page-1)*(+limit), order: [['name','ASC']]
    });
    res.json({ data: rows, total: count, page: +page, pages: Math.ceil(count/+limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Supplier.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.update(req.body); res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const s = await Supplier.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.destroy(); res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
