const asyncHandler = require('../middleware/asyncHandler');
const Team = require('../models/Team');
const ActivityLog = require('../models/ActivityLog');

const getTeams = asyncHandler(async (req, res) => {
    // Managers only see their teams, admin sees all
    const filter = req.user.role === 'manager' ? { managerId: req.user._id } : {};
    const teams = await Team.find(filter);
    res.json(teams);
});

const createTeam = asyncHandler(async (req, res) => {
    const { name, managerId, memberIds } = req.body;
    
    const team = await Team.create({
        name,
        managerId: managerId || req.user._id,
        memberIds: memberIds || []
    });
    await ActivityLog.create({
        action: 'Created team',
        performedBy: req.user._id,
        targetType: 'team',
        targetId: team._id,
        details: `Team "${team.name}" was created`
    });
    
    res.status(201).json(team);
});

const updateTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (req.user.role !== 'admin' && team.managerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this team');
    }

    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTeam);
});

const deleteTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (req.user.role !== 'admin' && team.managerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this team');
    }

    await Team.deleteOne({ _id: team._id });
    res.json({ message: 'Team removed' });
});

module.exports = {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam
};
