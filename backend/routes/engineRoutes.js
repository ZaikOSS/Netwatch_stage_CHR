const express = require('express');
const router = express.Router();
const engineController = require('../controllers/engineController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/engine/status (accessible by everyone? Prompt says "Returns current interval setting and engine state")
router.get('/status', engineController.getStatus);

// POST /api/engine/toggle (Admin-only)
router.post('/toggle', verifyToken, requireAdmin, engineController.toggleEngine);

// POST /api/engine/interval (Admin-only)
router.post('/interval', verifyToken, requireAdmin, engineController.setInterval);

// POST /api/engine/ping-all (Admin-only)
router.post('/ping-all', verifyToken, requireAdmin, engineController.pingAll);

// POST /api/engine/ping/:id (Admin/Visitor - meaning just authenticated users)
router.post('/ping/:id', verifyToken, engineController.pingDevice);

module.exports = router;
