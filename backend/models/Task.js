const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date },
    subtasks: [{
        id: { type: String },
        title: { type: String },
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        estimatedHours: { type: Number }
    }],
    linkedItems: [{
        id: { type: String },
        text: { type: String }
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
        replies: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            userName: { type: String },
            text: { type: String },
            timestamp: { type: Date, default: Date.now }
        }]
    }],
    history: [{
        user: { type: String },
        action: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    aiEstimate: {
        suggestedDeadline: { type: Date },
        complexity: { type: String },
        riskScore: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
