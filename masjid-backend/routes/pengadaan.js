const express = require('express');
const router = express.Router();
const barangPengadaanController = require('../models/controllers/barangPengadaanController');
const donasiPengadaanController = require('../models/controllers/donasiPengadaanController');
const { verifyToken, optionalToken, dkmOrAdmin } = require('../models/middleware/auth');
const { upload } = require('../config/cloudinary');

router.get(
    '/',
    barangPengadaanController.getProgramPengadaanList
);

router.get(
    '/donasi/pending',
    verifyToken,
    dkmOrAdmin,
    donasiPengadaanController.getPendingDonasiPengadaan
);

router.get(
    '/:id/donasi',
    donasiPengadaanController.getDonasiByProgram
);

router.get(
    '/:id',
    barangPengadaanController.getProgramPengadaanById
);

router.get(
    '/:id/export/pdf',
    barangPengadaanController.exportProgramReportPdf
)

router.post(
    '/',
    verifyToken,
    dkmOrAdmin,
    upload('donasi-program').single('foto_barang'),
    barangPengadaanController.createBarangPengadaan
);

router.post(
    '/donasi',
    optionalToken,
    upload('donasi-program').single('bukti_transfer'),
    donasiPengadaanController.createDonasiPengadaan
);

router.put(
    '/:id',
    verifyToken,
    dkmOrAdmin,
    upload('donasi-program').single('foto_barang'),
    barangPengadaanController.updateProgramPengadaan
);

router.put(
    '/donasi/:id/validate',
    verifyToken,
    dkmOrAdmin,
    donasiPengadaanController.verifyDonasiPengadaan
)

router.patch(
    '/donasi/:id/upload',
    upload('donasi-program').single('bukti_transfer'),
    donasiPengadaanController.uploadBuktiDonasiPengadaan
);

router.patch(
    '/:id',
    verifyToken,
    dkmOrAdmin,
    barangPengadaanController.changeProgramStatus
);

module.exports = router;
