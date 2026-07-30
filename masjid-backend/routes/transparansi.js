const express = require('express');
const router = express.Router();
const transparansiController = require('../models/controllers/transparansiController');
const { verifyToken, dkmOrAdmin, requireJabatan } = require('../models/middleware/auth');
const { upload } = require('../config/cloudinary');

const pengurusOnly = [verifyToken, dkmOrAdmin];
const approverOnly = [verifyToken, dkmOrAdmin, requireJabatan('ketua_dkm', 'bendahara')];

router.get('/zakat', transparansiController.getZakatTransparency);
router.get('/zakat/pdf', transparansiController.exportZakatTransparencyPdf);

router.post(
    '/zakat/distribusi',
    ...pengurusOnly,
    upload('transparansi-zakat').single('bukti_foto'),
    transparansiController.createZakatDistribution
);

router.put(
    '/zakat/distribusi/:id',
    ...pengurusOnly,
    upload('transparansi-zakat').single('bukti_foto'),
    transparansiController.updateZakatDistribution
);

router.post(
    '/zakat/distribusi/:id/approve',
    ...approverOnly,
    transparansiController.approveZakatDistribution
);

router.post(
    '/zakat/distribusi/:id/reject',
    ...approverOnly,
    transparansiController.rejectZakatDistribution
);

router.get('/pengadaan/:programId', transparansiController.getProgramTransparency);
router.get('/pengadaan/:programId/pdf', transparansiController.exportProgramTransparencyPdf);

router.post(
    '/pengadaan/:programId/realisasi',
    ...pengurusOnly,
    upload('transparansi-pengadaan').single('bukti_foto'),
    transparansiController.createProgramRealisasi
);

router.put(
    '/pengadaan/realisasi/:id',
    ...pengurusOnly,
    upload('transparansi-pengadaan').single('bukti_foto'),
    transparansiController.updateProgramRealisasi
);

router.post(
    '/pengadaan/realisasi/:id/approve',
    ...approverOnly,
    transparansiController.approveProgramRealisasi
);

router.post(
    '/pengadaan/realisasi/:id/reject',
    ...approverOnly,
    transparansiController.rejectProgramRealisasi
);

module.exports = router;
