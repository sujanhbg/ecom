const router = require('express').Router();
const { Order, OrderItem, User, CourierService, Product } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// List orders
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page=1, limit=20, status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [
      { orderNumber: { [Op.like]: `%${search}%` } },
      { trackingNumber: { [Op.like]: `%${search}%` } }
    ];
    const { rows, count } = await Order.findAndCountAll({
      where, include: [
        { model: User, attributes: ['id','name','email'] },
        { model: CourierService, attributes: ['id','name','code'] }
      ],
      limit: +limit, offset: (+page-1)*(+limit), order: [['createdAt','DESC']]
    });
    res.json({ data: rows, total: count, page: +page, pages: Math.ceil(count/+limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single with items
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: { exclude: ['password'] } },
        { model: CourierService },
        { model: OrderItem, include: [{ model: Product, attributes: ['id','name','image'] }] }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create order
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    data.orderNumber = 'ORD-' + Date.now();
    const order = await Order.create(data);
    if (req.body.items) {
      for (const item of req.body.items) {
        await OrderItem.create({ ...item, orderId: order.id });
      }
    }
    const result = await Order.findByPk(order.id, { include: [OrderItem] });
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update order status
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update(req.body);
    if (req.body.status === 'shipped') await order.update({ shippedAt: new Date() });
    if (req.body.status === 'delivered') await order.update({ deliveredAt: new Date() });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Courier services
router.get('/couriers/list', auth, adminOnly, async (req, res) => {
  try { res.json(await CourierService.findAll({ order: [['name','ASC']] })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/couriers', auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await CourierService.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/couriers/:id', auth, adminOnly, async (req, res) => {
  try {
    const c = await CourierService.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    await c.update(req.body); res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/couriers/:id', auth, adminOnly, async (req, res) => {
  try {
    const c = await CourierService.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    await c.destroy(); res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
