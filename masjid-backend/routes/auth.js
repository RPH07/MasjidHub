const express = require('express');
const router = express.Router();
const { login, registerUser, registerDkm} = require('../models/controllers/authController.js');

router.post('/login', login);
router.post('/register', registerUser);
router.post('/register-dkm', registerDkm);

module.exports = router;