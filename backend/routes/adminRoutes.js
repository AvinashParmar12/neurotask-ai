const express = require('express');
const router = express.Router();
const { getLogs, getAgentLogs, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/logs', getLogs);
router.get('/agent-logs', getAgentLogs);
router.get('/stats', getStats);

module.exports = router;
