const router = require('express').Router();
const { Promotion, Newsletter, Campaign } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// Promotions
router.get('/promotions', auth, adminOnly, async (req, res) => {
  try { res.json(await Promotion.findAll({ order: [['createdAt','DESC']] })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/promotions', auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Promotion.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/promotions/:id', auth, adminOnly, async (req, res) => {
  try {
    const p = await Promotion.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.update(req.body); res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/promotions/:id', auth, adminOnly, async (req, res) => {
  try {
    const p = await Promotion.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.destroy(); res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Newsletters
router.get('/subscribers', auth, adminOnly, async (req, res) => {
  try {
    const { page=1, limit=20 } = req.query;
    const { rows, count } = await Newsletter.findAndCountAll({
      limit: +limit, offset: (+page-1)*(+limit), order: [['subscribedAt','DESC']]
    });
    res.json({ data: rows, total: count, page: +page, pages: Math.ceil(count/+limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/subscribers', async (req, res) => {
  try { res.status(201).json(await Newsletter.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/subscribers/:id', auth, adminOnly, async (req, res) => {
  try {
    const n = await Newsletter.findByPk(req.params.id);
    if (!n) return res.status(404).json({ error: 'Not found' });
    await n.destroy(); res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Campaigns
router.get('/campaigns', auth, adminOnly, async (req, res) => {
  try { res.json(await Campaign.findAll({ order: [['createdAt','DESC']] })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/campaigns', auth, adminOnly, async (req, res) => {
  try { res.status(201).json(await Campaign.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/campaigns/:id', auth, adminOnly, async (req, res) => {
  try {
    const c = await Campaign.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    await c.update(req.body); res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
