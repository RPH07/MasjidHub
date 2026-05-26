const express = require('express');
const router = express.Router();
const zakatController = require('../models/controllers/zakatController');
const { verifyToken, dkmOrAdmin, adminOnly } = require('../models/middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', verifyToken, dkmOrAdmin, zakatController.getZakat);

router.post('/', zakatController.createZakat); 

router.patch('/:id/upload', upload('zakat_bukti').single('bukti'), zakatController.uploadBuktiZakat);

router.put('/:id/validate', verifyToken, dkmOrAdmin, zakatController.verifyZakat);

router.delete('/:id', verifyToken, adminOnly, zakatController.deleteZakat);

module.exports = router;