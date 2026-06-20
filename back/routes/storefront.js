/**
 * routes/storefront.js
 * Public-facing routes for the web storefront:
 *  POST /api/storefront/login        — customer login (returns JWT)
 *  POST /api/storefront/register     — customer register
 *  GET  /api/storefront/profile      — get own profile (auth optional)
 *  POST /api/storefront/orders       — place order (guest OR signed-in)
 *  GET  /api/storefront/orders       — customer's own orders (auth required)
 */
const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { User, Order, OrderItem, Product, CourierService } = require('../models');

// ─── Middleware: optional auth (sets req.user if token present) ─────────────
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
    }
  } catch (_) { /* no-op */ }
  next();
};

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Login required' });
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (_) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Customer Login ──────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status !== 'active')
      return res.status(403).json({ error: 'Account is not active' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const userData = user.toJSON(); delete userData.password;
    res.json({ token, user: userData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Customer Register ───────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, role: 'client', status: 'active' }, { individualHooks: true });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = user.toJSON(); delete userData.password;
    res.status(201).json({ token, user: userData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Get Profile ─────────────────────────────────────────────────────────────
router.get('/profile', requireAuth, (req, res) => {
  const user = req.user.toJSON(); delete user.password;
  res.json(user);
});

// ─── Update Profile ──────────────────────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, city, address } = req.body;
    await req.user.update({ name, phone, city, address });
    const user = req.user.toJSON(); delete user.password;
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Change Password ─────────────────────────────────────────────────────────
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (!(await req.user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    await req.user.update({ password: newPassword }, { individualHooks: true });
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ─── Place Order (Guest OR Signed-in) ───────────────────────────────────────
router.post('/orders', optionalAuth, async (req, res) => {
  try {
    const {
      // Shipping
      shippingName, shippingPhone, shippingEmail,
      shippingAddress, shippingCity, shippingDistrict, shippingZip,
      // Payment
      paymentMethod,
      // Items: [{ productId, productName, price, quantity, variationName }]
      items,
      // Coupon / notes
      couponCode, notes,
      // Pricing
      subtotal, shippingCost, discount, total
    } = req.body;

    if (!items?.length) return res.status(400).json({ error: 'No items in order' });

    // Build shipping address string
    const fullAddress = [shippingAddress, shippingCity, shippingDistrict, shippingZip].filter(Boolean).join(', ');

    const orderNumber = 'ORD-' + Date.now();

    const order = await Order.create({
      orderNumber,
      userId:          req.user?.id || null,
      status:          'pending',
      paymentStatus:   paymentMethod === 'COD' ? 'unpaid' : 'unpaid',
      paymentMethod:   paymentMethod || 'COD',
      subtotal:        subtotal  || 0,
      shippingCost:    shippingCost || 60,
      discount:        discount  || 0,
      total:           total     || 0,
      shippingAddress: fullAddress,
      // Store guest details in notes field if no user
      notes: req.user
        ? notes
        : `Guest: ${shippingName} | ${shippingPhone} | ${shippingEmail}${notes ? '\n' + notes : ''}`,
    });

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        orderId:     order.id,
        productId:   item.productId,
        productName: item.productName,
        price:       item.price,
        quantity:    item.quantity,
        total:       item.price * item.quantity,
        variation:   item.variationName || null,
      });
    }

    res.status(201).json({
      success: true,
      orderNumber,
      orderId: order.id,
      message: 'Order placed successfully'
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Get own orders (signed-in) ───────────────────────────────────────────────
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Get courier services (for delivery options) ──────────────────────────────
router.get('/couriers', async (req, res) => {
  try {
    const couriers = await CourierService.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'baseCost', 'estimatedDays'],
      order: [['baseCost', 'ASC']]
    });
    res.json(couriers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
