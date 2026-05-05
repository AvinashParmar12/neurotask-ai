const { callOllama } = require('../services/aiService');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');

const runRiskScan = async () => {
    // Get all in-progress or pending tasks
    const activeTasks = await Task.find({ status: { $in: ['pending', 'in-progress'] } })
        .populate('assigneeId', 'name email')
        .lean();

    if (activeTasks.length === 0) return [];

    // Map workloads
    const employeeWorkload = {};
    activeTasks.forEach(t => {
        if (t.assigneeId) {
            const empId = t.assigneeId._id.toString();
            employeeWorkload[empId] = (employeeWorkload[empId] || 0) + 1;
        }
    });

    const systemInstruction = `You are a Risk Analysis AI Agent. Analyze the given active tasks and employee workloads. 
Return a JSON array of insights if any task faces a high risk of missing consensus deadlines or if an employee is overloaded (e.g., > 5 tasks).
Output ONLY valid JSON like:
{"insights": [{"taskId": "123", "riskScore": 85, "recommendation": "Reassign this task as Alex is overloaded."}]}`;

    const prompt = `Active Tasks: ${JSON.stringify(activeTasks.map(t => ({ id: t._id, title: t.title, deadline: t.deadline, assignee: t.assigneeId?.name })))}
Employee Workloads (task count): ${JSON.stringify(employeeWorkload)}`;

    const parsedData = await callOllama('risk', prompt, systemInstruction);
    const results = [];

    if (parsedData && parsedData.insights) {
        for (const insight of parsedData.insights) {
            const task = await Task.findById(insight.taskId);
            if (task) {
                task.aiEstimate = { ...task.aiEstimate, riskScore: insight.riskScore };
                await task.save();

                if (insight.riskScore > 75) {
                    // Notify Manager
                    await Notification.create({
                        type: 'risk_alert',
                        title: 'High Risk Task Detected',
                        message: `Risk Score: ${insight.riskScore}%. Recommendation: ${insight.recommendation}`,
                        targetUserId: task.managerId,
                        taskId: task._id
                    });
                }
                results.push(insight);
            }
        }
    }

    return results;
};

module.exports = { runRiskScan };
