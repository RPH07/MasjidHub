const express = require('express');
const router = express.Router();
const {createKegiatan, deleteKegiatan, getKegiatan} = require('../models/controllers/kegiatanController');
const {verifyToken, dkmOrAdmin} = require('../models/middleware/auth');
const {upload} = require('../config/cloudinary');

// router public
router.get('/', getKegiatan);

// router khusus admin/dkm
router.get('/', verifyToken, dkmOrAdmin, getKegiatan);
router.post('/', verifyToken, dkmOrAdmin, upload('kegiatan').single('image'), createKegiatan);
router.delete('/:id', verifyToken, dkmOrAdmin, deleteKegiatan);

module.exports = router;