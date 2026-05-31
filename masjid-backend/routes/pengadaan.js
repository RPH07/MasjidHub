const express = require('express');
const router = express.Router();
const barangPengadaanController = require('../models/controllers/barangPengadaanController');
const { verifyToken, dkmOrAdmin } = require('../models/middleware/auth');
const { upload } = require('../config/cloudinary');

router.get(
    '/',
    barangPengadaanController.getProgramPengadaanList
);

router.get(
    '/:id',
    barangPengadaanController.getProgramPengadaanById
);

router.post(
    '/',
    verifyToken,
    dkmOrAdmin,
    upload('donasi-program').single('foto_barang'),
    barangPengadaanController.createBarangPengadaan
);

router.put(
    '/:id',
    verifyToken,
    dkmOrAdmin,
    upload('donasi-program').single('foto_barang'),
    barangPengadaanController.updateProgramPengadaan
);

router.patch(
    '/:id',
    verifyToken,
    dkmOrAdmin,
    barangPengadaanController.changeProgramStatus
);

module.exports = router;