const router = require('express').Router();
const { Setting } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Get all settings as key-value
router.get('/', async (req, res) => {
  try {
    const list = await Setting.findAll();
    const settings = {};
    list.forEach(s => { settings[s.key] = s.value; });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update settings (admin only)
router.put('/', auth, adminOnly, async (req, res) => {
  try {
    const data = req.body;
    for (const key of Object.keys(data)) {
      await Setting.upsert({ key, value: data[key] ? String(data[key]) : '' });
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
