const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { type: String },
    title: { type: String },
    message: { type: String },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
