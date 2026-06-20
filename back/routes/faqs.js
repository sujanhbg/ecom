const router = require('express').Router();
const { FAQ } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    res.json(faqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create FAQ (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update FAQ (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    await faq.update(req.body);
    res.json(faq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete FAQ (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    await faq.destroy();
    res.json({ message: 'FAQ deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
