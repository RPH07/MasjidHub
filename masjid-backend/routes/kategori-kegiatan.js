const express = require('express');
const { getKategori, createKategori } = require('../models/controllers/kategoriController');
const { verifyToken, dkmOrAdmin } = require('../models/middleware/auth');

const router = express.Router();

router.get('/', getKategori); 
router.post('/', verifyToken, dkmOrAdmin, createKategori); 

module.exports = router;