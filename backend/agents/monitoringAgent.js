const { callOllama } = require('../services/aiService');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const monitorTasks = async () => {
    // Find active tasks
    const activeTasks = await Task.find({ status: { $in: ['pending', 'in-progress'] } });
    
    // Simplification for demo: tasks without updates recently
    const stagnantTasks = activeTasks.filter(t => {
        const lastUpdated = new Date(t.updatedAt).getTime();
        const now = Date.now();
        const hoursInactive = (now - lastUpdated) / (1000 * 60 * 60);
        return hoursInactive >= 1; // Inactive for >= 1 hour
    });

    if (stagnantTasks.length === 0) return [];

    const systemInstruction = `You are a Monitoring AI Agent. Review stagnant tasks (no progress in 1+ hours).
Determine if they indicate a blockage. Return a JSON array of actions:
{"actions": [{"taskId": "123", "managerMessage": "Check if Alex is blocked.", "employeeMessage": "Any blockers?"}]}`;

    const prompt = `Stagnant Tasks: ${JSON.stringify(stagnantTasks.map(t => ({ id: t._id, title: t.title, assigneeId: t.assigneeId, managerId: t.managerId })))}`;

    const parsedData = await callOllama('monitoring', prompt, systemInstruction);
    const results = [];

    if (parsedData && parsedData.actions) {
        for (const action of parsedData.actions) {
            const task = await Task.findById(action.taskId);
            if (task) {
                // Notify Employee
                await Notification.create({
                    type: 'monitoring_nudge',
                    title: 'Task Stagnation Nudge',
                    message: action.employeeMessage,
                    targetUserId: task.assigneeId,
                    taskId: task._id
                });

                // Notify Manager
                await Notification.create({
                    type: 'monitoring_alert',
                    title: 'Task Blockage Possible',
                    message: action.managerMessage,
                    targetUserId: task.managerId,
                    taskId: task._id
                });
                
                results.push(action);
            }
        }
    }

    return results;
};

module.exports = { monitorTasks };
