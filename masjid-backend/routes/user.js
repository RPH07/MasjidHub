const express = require('express');
const router = express.Router();
const {getUser, getMe, updateUser, updateUserAccess, deleteUser} = require('../models/controllers/userController.js');
const {verifyToken, dkmOrAdmin, requireJabatan} = require('../models/middleware/auth.js');

router.get('/', verifyToken, dkmOrAdmin, getUser);
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateUser);
router.patch('/:id/access', verifyToken, dkmOrAdmin, requireJabatan('ketua_dkm'), updateUserAccess);
router.delete('/:id', verifyToken, dkmOrAdmin, deleteUser);

module.exports = router;
