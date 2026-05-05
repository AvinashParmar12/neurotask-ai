const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { planTask } = require('./agents/taskPlanningAgent');
const { runRiskScan } = require('./agents/priorityRiskAgent');
const { monitorTasks } = require('./agents/monitoringAgent');
const { runCommunicationSweep } = require('./agents/communicationAgent');
const Task = require('./models/Task');

async function testAgents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test 1: Priority Risk Scan
        console.log('\n--- Testing Priority & Risk Agent ---');
        const insights = await runRiskScan();
        console.log('Insights:', JSON.stringify(insights, null, 2));

        // Test 2: Monitoring Agent
        console.log('\n--- Testing Monitoring Agent ---');
        const monitoringResults = await monitorTasks();
        console.log('Monitoring Results:', JSON.stringify(monitoringResults, null, 2));

        // Test 3: Communication Sweep
        console.log('\n--- Testing Communication Agent ---');
        const commsResults = await runCommunicationSweep();
        console.log('Communication Results:', JSON.stringify(commsResults, null, 2));

        // Test 4: Task Planning
        console.log('\n--- Testing Task Planning Agent ---');
        const task = await Task.findOne();
        if (task) {
            console.log(`Planning task: ${task.title}`);
            const plannedTask = await planTask(task._id);
            console.log('Planned Subtasks:', JSON.stringify(plannedTask.subtasks, null, 2));
        } else {
            console.log('No tasks found to plan.');
        }

    } catch (e) {
        console.error('Error during testing:', e);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

testAgents();
