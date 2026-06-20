const router = require('express').Router();
const { Page } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Get all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.findAll();
    res.json(pages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get a single page by key
router.get('/:key', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { key: req.params.key } });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update page content (admin only)
router.put('/:key', auth, adminOnly, async (req, res) => {
  try {
    const page = await Page.findOne({ where: { key: req.params.key } });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    await page.update(req.body);
    res.json(page);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
