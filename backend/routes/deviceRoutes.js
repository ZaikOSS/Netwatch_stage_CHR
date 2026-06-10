const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', deviceController.getDevices);
router.post('/', verifyToken, requireAdmin, deviceController.createDevice);
router.put('/:id', verifyToken, requireAdmin, deviceController.updateDevice);
router.delete('/:id', verifyToken, requireAdmin, deviceController.deleteDevice);
router.put('/:id/position', verifyToken, requireAdmin, deviceController.updatePosition);

module.exports = router;
