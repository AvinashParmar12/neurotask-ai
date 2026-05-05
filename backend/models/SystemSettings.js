const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    type: { type: String, default: 'global_agents' }, // To ensure we only have one document
    agents: [
        {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            status: { type: String, enum: ['Optimal', 'Paused'], default: 'Optimal' },
            lastActive: { type: Date, default: Date.now },
            color: { type: String, default: 'green' }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
