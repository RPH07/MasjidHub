const express = require('express');
const router = express.Router();
const zakatController = require('../models/controllers/zakatController');
const {verifyToken} = require('../models/middleware/auth');
const {upload} = require('../config/cloudinary')

router.get('/', zakatController.getZakat);

// POST
// router.post('/generate-kode', zakatController.generateKodeUnik);
router.post('/', zakatController.createZakat); 
// router.post('/', verifyToken, zakatController.createZakat);

// PUT
router.put('/:id/validate', zakatController.verifyZakat);
router.patch('/:id/upload', upload('zakat_bukti').single('bukti'), zakatController.uploadBuktiZakat);

// DELETE
router.delete('/:id', zakatController.deleteZakat)

module.exports = router;