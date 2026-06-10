const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', linkController.getLinks);
router.post('/', verifyToken, requireAdmin, linkController.createLink);
router.delete('/:id', verifyToken, requireAdmin, linkController.deleteLink);

module.exports = router;
