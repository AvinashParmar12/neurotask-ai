const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
