const express = require('express');
const zakatSettingController = require('../models/controllers/zakatSettingController');
const { verifyToken, dkmOrAdmin, requireJabatan } = require('../models/middleware/auth');

const router = express.Router();

const pengurusOnly = [verifyToken, dkmOrAdmin];
const managerOnly = [verifyToken, dkmOrAdmin, requireJabatan('ketua_dkm', 'bendahara')];

router.get('/active', zakatSettingController.getActiveSetting);
router.get('/', pengurusOnly, zakatSettingController.getSettings);
router.post('/', managerOnly, zakatSettingController.createSetting);
router.put('/:id', managerOnly, zakatSettingController.updateSetting);
router.post('/:id/activate', managerOnly, zakatSettingController.activateSetting);
router.delete('/:id', managerOnly, zakatSettingController.deleteSetting);

module.exports = router;
