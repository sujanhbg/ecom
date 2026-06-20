const router = require('express').Router();
const { Role, Permission, RolePermission } = require('../models');
const { auth, superAdminOnly } = require('../middleware/auth');

router.get('/roles', auth, async (req, res) => {
  try { res.json(await Role.findAll({ include: [Permission] })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/roles', auth, superAdminOnly, async (req, res) => {
  try { res.status(201).json(await Role.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/permissions', auth, async (req, res) => {
  try { res.json(await Permission.findAll({ order: [['module','ASC']] })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/assign', auth, superAdminOnly, async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body;
    await RolePermission.destroy({ where: { roleId } });
    const entries = permissionIds.map(pid => ({ roleId, permissionId: pid }));
    await RolePermission.bulkCreate(entries);
    const role = await Role.findByPk(roleId, { include: [Permission] });
    res.json(role);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
