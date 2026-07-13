const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middleware/authMiddleware');

// Fetch logs (accessible to any authenticated user)
router.get('/', verifyToken, logController.getLogs);

module.exports = router;
