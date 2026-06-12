const express = require('express');
const router = express.Router();
const {
    createKegiatan,
    deleteKegiatan,
    getKegiatan,
    getKegiatanById,
    updateKegiatan
} = require('../models/controllers/kegiatanController');
const {verifyToken, dkmOrAdmin} = require('../models/middleware/auth');
const {upload} = require('../config/cloudinary');

// router public
router.get('/', getKegiatan);
router.get('/:id', getKegiatanById);

// router khusus admin/dkm
router.post('/', verifyToken, dkmOrAdmin, upload('kegiatan').single('image'), createKegiatan);
router.put('/:id', verifyToken, dkmOrAdmin, upload('kegiatan').single('image'), updateKegiatan);
router.delete('/:id', verifyToken, dkmOrAdmin, deleteKegiatan);

module.exports = router;
