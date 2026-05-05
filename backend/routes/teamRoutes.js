const express = require('express');
const router = express.Router();
const { getTeams, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/')
    .get(getTeams)
    .post(createTeam);

router.route('/:id')
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;
