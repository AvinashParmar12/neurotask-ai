const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, reassignTask, addTaskComment, updateTaskComment, deleteTaskComment, replyToTaskComment, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTasks)
    .post(protect, authorize('admin', 'manager'), createTask);

router.route('/:id')
    .get(protect, getTaskById)
    .put(protect, authorize('admin', 'manager', 'employee'), updateTask)
    .delete(protect, authorize('admin', 'manager'), deleteTask);

router.put('/:id/reassign', protect, authorize('admin', 'manager'), reassignTask);
router.post('/:id/comments', protect, addTaskComment);
router.put('/:id/comments/:commentId', protect, updateTaskComment);
router.delete('/:id/comments/:commentId', protect, deleteTaskComment);
router.post('/:id/comments/:commentId/reply', protect, replyToTaskComment);

module.exports = router;
