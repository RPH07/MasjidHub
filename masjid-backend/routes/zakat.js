const express = require('express');
const router = express.Router();
const zakatController = require('../models/controllers/zakatController');
const {verifyToken} = require('../models/middleware/auth');

router.get('/', zakatController.getZakat);

// POST
router.post('/generate-kode', zakatController.generateKodeUnik);
router.post('/', zakatController.createZakat); 
// router.post('/', verifyToken, zakatController.createZakat);

// PUT
router.put('/:id/validate', zakatController.verifyZakat);

module.exports = router;