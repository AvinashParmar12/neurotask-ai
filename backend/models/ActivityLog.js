const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetType: { type: String, enum: ['user', 'task', 'team', 'system'] },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
