const { callOllama } = require('../services/aiService');
const Task = require('../models/Task');
const SystemSettings = require('../models/SystemSettings');

const isPlanningAgentPaused = async () => {
    try {
        const settings = await SystemSettings.findOne({ type: 'global_agents' });
        if (!settings) return false;
        const agent = settings.agents.find(a => a.id === 1);
        return agent && agent.status === 'Paused';
    } catch (e) {
        return false;
    }
};

const planTask = async (taskId) => {
    if (await isPlanningAgentPaused()) throw new Error('Planning agent is currently paused');
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    const systemInstruction = `You are a Task Planning AI Agent. Your goal is to break down complex tasks into smaller subtasks with estimated hours.
You must output ONLY valid JSON format. Example output:
{"subtasks": [{"title": "Subtask 1", "estimatedHours": 2}, {"title": "Subtask 2", "estimatedHours": 3}], "suggestedDeadline": "2026-04-20T10:00:00Z", "complexity": "medium"}`;

    const prompt = `Please plan the following task:
Title: ${task.title}
Description: ${task.description}
Priority: ${task.priority}`;

    const parsedData = await callOllama('planning', prompt, systemInstruction);

    if (parsedData && parsedData.subtasks) {
        task.subtasks = parsedData.subtasks.map((st, index) => ({
            id: `ST-${Date.now()}-${index}`,
            ...st,
            status: 'pending'
        }));
        
        task.aiEstimate = {
            suggestedDeadline: parsedData.suggestedDeadline,
            complexity: parsedData.complexity,
            riskScore: task.aiEstimate?.riskScore || 0
        };

        if (parsedData.suggestedDeadline && !task.deadline) {
            task.deadline = parsedData.suggestedDeadline;
        }

        await task.save();
    }

    return task;
};

const suggestTaskPlan = async (title, description, priority) => {
    if (await isPlanningAgentPaused()) {
        return {
            subtasks: [{ title: 'AI Planning Agent is currently offline', estimatedHours: 0 }],
            suggestedDeadline: new Date().toISOString(),
            complexity: 'medium'
        };
    }

    const systemInstruction = `You are a Task Planning AI Agent. Your goal is to break down complex tasks into smaller subtasks with estimated hours.
You must output ONLY valid JSON format. Example output:
{"subtasks": [{"title": "Subtask 1", "estimatedHours": 2}, {"title": "Subtask 2", "estimatedHours": 3}], "suggestedDeadline": "2026-04-20T10:00:00Z", "complexity": "medium"}`;

    const prompt = `Please plan the following task:
Title: ${title}
Description: ${description || 'No description provided'}
Priority: ${priority || 'medium'}`;

    return await callOllama('planning', prompt, systemInstruction);
};

module.exports = { planTask, suggestTaskPlan };
