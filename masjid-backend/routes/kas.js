const express = require('express');
const router = express.Router();
const kasController = require('../models/controllers/kasController');
const {verifyToken, dkmOrAdmin} = require('../models/middleware/auth');

router.get('/summary', kasController.getKasSummary);
router.get('/transactions', kasController.getKasTransactions);
router.get('/history/export', verifyToken, dkmOrAdmin, kasController.exportsKasHistory);
router.get('/history', verifyToken, dkmOrAdmin, kasController.getKasHistory);
router.get('/report/pdf', kasController.exportsKasReportPdf);

router.get('/', kasController.getKasTransactions);

router.post('/', verifyToken, dkmOrAdmin, kasController.createKasManual);
router.put('/:id', verifyToken, dkmOrAdmin, kasController.updateKasManual);
router.delete('/:id', verifyToken, dkmOrAdmin, kasController.deleteKasManual);

module.exports = router;