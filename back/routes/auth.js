const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'active')
      return res.status(403).json({ error: 'Account is not active' });
    if (!['superadmin','admin','staff'].includes(user.role))
      return res.status(403).json({ error: 'Admin access required' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const userData = user.toJSON(); delete userData.password;
    res.json({ token, user: userData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  const user = req.user.toJSON(); delete user.password;
  res.json(user);
});

// Update profile
router.put('/profile', auth, (req, res, next) => { req.uploadSubDir = 'avatars'; next(); },
  upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone, address, city, country } = req.body;
    const updates = { name, email, phone, address, city, country };
    if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.update(updates);
    const user = req.user.toJSON(); delete user.password;
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await req.user.comparePassword(currentPassword)))
      return res.status(400).json({ error: 'Current password is incorrect' });
    await req.user.update({ password: newPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
