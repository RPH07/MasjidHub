const express = require('express');
const router = express.Router();
const kontribusiController = require('../models/controllers/kontribusiController');
const { verifyToken } = require('../models/middleware/auth');

router.get('/history', verifyToken, kontribusiController.getContributionHistory);
router.get('/history/:userId', verifyToken, kontribusiController.getContributionHistory);
router.get('/summary', verifyToken, kontribusiController.getContributionSummary);
router.get('/summary/:userId', verifyToken, kontribusiController.getContributionSummary);

module.exports = router;
