const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ targetUserId: req.user._id }).sort('-timestamp');
    res.json(notifications);
});

const markRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.targetUserId.toString() === req.user._id.toString()) {
        notification.read = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

const markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ targetUserId: req.user._id }, { read: true });
    res.json({ message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markRead, markAllRead };
