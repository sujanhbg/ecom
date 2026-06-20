const router = require('express').Router();
const { Transaction, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page=1, limit=20, type, startDate, endDate } = req.query;
    const where = {};
    if (type) where.type = type;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };
    const { rows, count } = await Transaction.findAndCountAll({
      where, include: [{ model: Order, attributes: ['id','orderNumber'] }],
      limit: +limit, offset: (+page-1)*(+limit), order: [['date','DESC']]
    });
    res.json({ data: rows, total: count, page: +page, pages: Math.ceil(count/+limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/summary', auth, adminOnly, async (req, res) => {
  try {
    const income = await Transaction.sum('amount', { where: { type: 'income', status: 'completed' } }) || 0;
    const expense = await Transaction.sum('amount', { where: { type: 'expense', status: 'completed' } }) || 0;
    const refund = await Transaction.sum('amount', { where: { type: 'refund', status: 'completed' } }) || 0;
    res.json({ income: +income, expense: +expense, refund: +refund, profit: +income - +expense - +refund });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Transaction.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const t = await Transaction.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.update(req.body); res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const t = await Transaction.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.destroy(); res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
