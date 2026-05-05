const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const { planTask, suggestTaskPlan } = require('../agents/taskPlanningAgent');
const { runRiskScan } = require('../agents/priorityRiskAgent');
const SystemSettings = require('../models/SystemSettings');

router.use(protect);

// Manually trigger task planning
router.post('/plan-task/:taskId', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    const updatedTask = await planTask(req.params.taskId);
    res.json(updatedTask);
}));

// Real-time suggestions for task creation form
router.post('/suggest-plan', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    const { title, description, priority } = req.body;
    const suggestions = await suggestTaskPlan(title, description, priority);
    res.json(suggestions);
}));

// Manually trigger risk scan
router.get('/risk-scan', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    const insights = await runRiskScan();
    res.json({ success: true, insights });
}));

// Dummy placeholder for insights page
router.get('/insights', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    // This could combine risk scan + other stats
    const insights = await runRiskScan();
    res.json({ insights });
}));

// Get Agent States
router.get('/agents', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne({ type: 'global_agents' });
    if (!settings) {
        // Initialize default agents if not exists
        settings = await SystemSettings.create({
            type: 'global_agents',
            agents: [
                { id: 1, name: 'Task Planning Agent', status: 'Optimal', color: 'green' },
                { id: 2, name: 'Priority & Risk Agent', status: 'Optimal', color: 'green' },
                { id: 3, name: 'Monitoring Agent', status: 'Optimal', color: 'green' },
                { id: 4, name: 'Communication Agent', status: 'Optimal', color: 'green' }
            ]
        });
    }
    res.json({ success: true, agents: settings.agents });
}));

// Toggle Agent State
router.put('/agents/:id/toggle', authorize('admin'), asyncHandler(async (req, res) => {
    const agentId = parseInt(req.params.id);
    const settings = await SystemSettings.findOne({ type: 'global_agents' });
    if (!settings) {
        res.status(404);
        throw new Error('Agent settings not initialized');
    }

    const agentIndex = settings.agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) {
        res.status(404);
        throw new Error('Agent not found');
    }

    const currentStatus = settings.agents[agentIndex].status;
    const newStatus = currentStatus === 'Paused' ? 'Optimal' : 'Paused';
    
    settings.agents[agentIndex].status = newStatus;
    settings.agents[agentIndex].color = newStatus === 'Paused' ? 'gray' : 'green';
    
    await settings.save();
    res.json({ success: true, agent: settings.agents[agentIndex] });
}));

module.exports = router;
