const express = require('express');
const router = express.Router();
const {getUser, getMe, updateUser, updateUserAccess, getUserAuditLogs, updateUserStatus, resetUserPassword, deleteMe, deleteUser} = require('../models/controllers/userController.js');
const {verifyToken, dkmOrAdmin, requireJabatan} = require('../models/middleware/auth.js');

router.get('/', verifyToken, dkmOrAdmin, getUser);
router.get('/me', verifyToken, getMe);
router.get('/logs', verifyToken, dkmOrAdmin, getUserAuditLogs);
router.patch('/me', verifyToken, updateUser);
router.delete('/me', verifyToken, deleteMe);
router.patch('/:id/access', verifyToken, dkmOrAdmin, requireJabatan('ketua_dkm'), updateUserAccess);
router.patch('/:id/status', verifyToken, dkmOrAdmin, requireJabatan('ketua_dkm'), updateUserStatus);
router.patch('/:id/password', verifyToken, dkmOrAdmin, requireJabatan('ketua_dkm'), resetUserPassword);
router.delete('/:id', verifyToken, dkmOrAdmin, deleteUser);

module.exports = router;
