const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
    agentName: { type: String, enum: ['planning', 'risk', 'monitoring', 'communication'] },
    action: { type: String },
    input: { type: mongoose.Schema.Types.Mixed },
    output: { type: mongoose.Schema.Types.Mixed },
    tokensUsed: { type: Number },
    executionTimeMs: { type: Number },
    status: { type: String, enum: ['success', 'error'] },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AgentLog', agentLogSchema);
