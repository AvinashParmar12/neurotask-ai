const asyncHandler = require('../middleware/asyncHandler');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { triggerImmediateCommunication } = require('../agents/communicationAgent');

const getTasks = asyncHandler(async (req, res) => {
    let filter = {};
    if (req.user.role === 'employee') {
        filter = { assigneeId: req.user._id };
    } else if (req.user.role === 'manager') {
        filter = { managerId: req.user._id };
    }

    const tasks = await Task.find(filter)
        .populate('assigneeId', 'name email avatar')
        .populate('managerId', 'name email avatar')
        .sort('-createdAt');
        
    res.json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('assigneeId', 'name email avatar')
        .populate('managerId', 'name email avatar')
        .populate('comments.userId', 'name avatar');
        
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    res.json(task);
});

const createTask = asyncHandler(async (req, res) => {
    const task = new Task({
        ...req.body,
        managerId: req.user._id,
        history: [{ user: req.user.name, action: 'Created task' }]
    });

    const createdTask = await task.save();

    if (createdTask.assigneeId) {
        await Notification.create({
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${createdTask.title}"`,
            targetUserId: createdTask.assigneeId,
            taskId: createdTask._id
        });

        // Fire Communication Agent immediately if deadline is inherently urgent (today/tomorrow)
        if (createdTask.deadline) {
            const now = new Date();
            const urgencyWindow = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
            const taskDeadline = new Date(createdTask.deadline);
            
            if (taskDeadline < urgencyWindow) {
                // Execute natively in background to avoid blocking HTTP response to Manager UI
                triggerImmediateCommunication(createdTask._id).catch(console.error);
            }
        }
    }

    await ActivityLog.create({
        action: 'Created task',
        performedBy: req.user._id,
        targetType: 'task',
        targetId: createdTask._id,
        details: `Task "${createdTask.title}" was created`
    });

    res.status(201).json(createdTask);
});

const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log history manually or use pre-save hook in real app
    if (req.body.status && req.body.status !== task.status) {
        updatedTask.history.push({ user: req.user.name, action: `Changed status to ${req.body.status}` });
        await updatedTask.save();
    }

    // Notify manager if task is marked completed by someone else
    if (req.body.status === 'completed' && task.status !== 'completed') {
        if (updatedTask.managerId && updatedTask.managerId.toString() !== req.user._id.toString()) {
            await Notification.create({
                type: 'task_completed',
                title: 'Task Completed',
                message: `${req.user.name} has completed the task: "${updatedTask.title}"`,
                targetUserId: updatedTask.managerId,
                taskId: updatedTask._id
            });
        }
    }

    // Fire Communication Agent immediately if deadline is urgent & newly assigned
    if (updatedTask.deadline && updatedTask.assigneeId) {
        const now = new Date();
        const urgencyWindow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        if (new Date(updatedTask.deadline) < urgencyWindow) {
            triggerImmediateCommunication(updatedTask._id).catch(console.error);
        }
    }

    res.json(updatedTask);
});

const reassignTask = asyncHandler(async (req, res) => {
    const { newAssigneeId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const oldAssigneeId = task.assigneeId;
    task.assigneeId = newAssigneeId;
    task.history.push({ user: req.user.name, action: `Reassigned task` });
    
    await task.save();

    await Notification.create({
        type: 'task_reassigned',
        title: 'Task Assigned to You',
        message: `You have been reassigned to task: "${task.title}"`,
        targetUserId: newAssigneeId,
        taskId: task._id
    });

    if (task.deadline) {
        const now = new Date();
        const urgencyWindow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        if (new Date(task.deadline) < urgencyWindow) {
            triggerImmediateCommunication(task._id).catch(console.error);
        }
    }

    res.json(task);
});

const addTaskComment = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const comment = {
        userId: req.user._id,
        userName: req.user.name,
        text: req.body.text
    };

    task.comments.push(comment);
    await task.save();
    res.status(201).json(task);
});

const updateTaskComment = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to edit this comment');
    }

    comment.text = req.body.text;
    await task.save();
    res.json(task);
});

const deleteTaskComment = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'manager') {
        res.status(401);
        throw new Error('Not authorized to delete this comment');
    }

    task.comments.pull(req.params.commentId);
    await task.save();
    res.json(task);
});

const replyToTaskComment = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    const reply = {
        userId: req.user._id,
        userName: req.user.name,
        text: req.body.text
    };

    comment.replies.push(reply);
    await task.save();
    res.status(201).json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed' });
});

module.exports = {
    getTasks, getTaskById, createTask, updateTask, reassignTask, addTaskComment, updateTaskComment, deleteTaskComment, replyToTaskComment, deleteTask
};
