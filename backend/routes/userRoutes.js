const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireAdmin, userController.createUser);
router.get('/', verifyToken, requireAdmin, userController.getUsers);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;
