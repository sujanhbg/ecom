const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') return res.status(401).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (!['superadmin','admin','staff'].includes(req.user.role))
    return res.status(403).json({ error: 'Admin access required.' });
  next();
};

const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin')
    return res.status(403).json({ error: 'Super admin access required.' });
  next();
};

module.exports = { auth, adminOnly, superAdminOnly };
