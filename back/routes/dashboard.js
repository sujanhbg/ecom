const router = require('express').Router();
const { User, Product, Order, Transaction, Category, Supplier } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'client' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalCategories = await Category.count();
    const totalSuppliers = await Supplier.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const totalRevenue = await Transaction.sum('amount', { where: { type: 'income', status: 'completed' } }) || 0;
    const totalExpense = await Transaction.sum('amount', { where: { type: 'expense', status: 'completed' } }) || 0;
    const recentOrders = await Order.findAll({
      include: [{ model: User, attributes: ['id','name','email'] }],
      order: [['createdAt','DESC']], limit: 5
    });
    const lowStockProducts = await Product.findAll({
      where: { stock: { [Op.lte]: 5 }, status: 'active' }, limit: 5, order: [['stock','ASC']]
    });
    res.json({
      totalUsers, totalProducts, totalOrders, totalCategories, totalSuppliers,
      pendingOrders, totalRevenue: +totalRevenue, totalExpense: +totalExpense,
      profit: +totalRevenue - +totalExpense, recentOrders, lowStockProducts
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
