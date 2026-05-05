const cron = require('node-cron');
const { runRiskScan } = require('../agents/priorityRiskAgent');
const { monitorTasks } = require('../agents/monitoringAgent');
const { runCommunicationSweep } = require('../agents/communicationAgent');
const SystemSettings = require('../models/SystemSettings');

const isAgentPaused = async (agentId) => {
    try {
        const settings = await SystemSettings.findOne({ type: 'global_agents' });
        if (!settings) return false;
        const agent = settings.agents.find(a => a.id === agentId);
        return agent && agent.status === 'Paused';
    } catch (e) {
        console.error('[Scheduler] Error checking agent status:', e);
        return false;
    }
};

const initScheduler = () => {
    // Risk Scan every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        if (await isAgentPaused(2)) {
            console.log('[Cron] Priority & Risk Agent is paused. Skipping.');
            return;
        }
        console.log('[Cron] Running Priority & Risk Agent...');
        try {
            await runRiskScan();
        } catch (e) {
            console.error('[Cron Error] Risk Scan:', e.message);
        }
    });

    // Monitoring scan every 12 hours
    cron.schedule('0 */12 * * *', async () => {
        if (await isAgentPaused(3)) {
            console.log('[Cron] Monitoring Agent is paused. Skipping.');
            return;
        }
        console.log('[Cron] Running Monitoring Agent...');
        try {
            await monitorTasks();
        } catch (e) {
            console.error('[Cron Error] Monitoring Scan:', e.message);
        }
    });

    // Communication sweep daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        if (await isAgentPaused(4)) {
            console.log('[Cron] Communication Agent is paused. Skipping.');
            return;
        }
        console.log('[Cron] Running Communication Agent...');
        try {
            await runCommunicationSweep();
        } catch (e) {
            console.error('[Cron Error] Communication Sweep:', e.message);
        }
    });

    console.log('AI background scheduler initialized.');
};

module.exports = initScheduler;
