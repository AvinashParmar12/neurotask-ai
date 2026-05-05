const asyncHandler = require('../middleware/asyncHandler');
const ActivityLog = require('../models/ActivityLog');
const AgentLog = require('../models/AgentLog');
const User = require('../models/User');
const Task = require('../models/Task');
const Team = require('../models/Team');

const getLogs = asyncHandler(async (req, res) => {
    const logs = await ActivityLog.find().populate('performedBy', 'name').sort('-timestamp').limit(50);
    res.json(logs);
});

const getAgentLogs = asyncHandler(async (req, res) => {
    const logs = await AgentLog.find().sort('-timestamp').limit(50);
    res.json(logs);
});

const getStats = asyncHandler(async (req, res) => {
    const users = await User.countDocuments();
    const tasks = await Task.countDocuments();
    const teams = await Team.countDocuments();
    res.json({ users, tasks, teams });
});

module.exports = { getLogs, getAgentLogs, getStats };
