const express = require('express');
const router = express.Router();
const {getUser, getMe, updateUser, deleteUser} = require('../models/controllers/userController.js');
const {verifyToken, adminOnly, dkmOrAdmin} = require('../models/middleware/auth.js');

router.get('/', verifyToken, dkmOrAdmin, getUser);
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateUser);
router.delete('/:id', verifyToken, dkmOrAdmin, deleteUser);

module.exports = router;
