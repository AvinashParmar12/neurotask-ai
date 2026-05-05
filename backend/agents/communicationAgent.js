const { callOllama } = require('../services/aiService');
const { sendEmail } = require('../services/emailService');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const runCommunicationSweep = async () => {
    // Find tasks due within 24 hours or overdue
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const tasksDueSoon = await Task.find({
        status: { $in: ['pending', 'in-progress'] },
        deadline: { $lt: tomorrow }
    }).populate('assigneeId', 'name email');

    const results = [];
    
    for (const task of tasksDueSoon) {
        if (!task.assigneeId || !task.assigneeId.email) continue;

        const systemInstruction = `You are a Professional Communication AI. Generate a short, polite reminder email for an employee about an upcoming or missed deadline.
CRITICAL INSTRUCTION: Do NOT use placeholders like "[Your Name]". Always sign off the email as "NeuroTask AI".
Return JSON: {"subject": "Email Subject", "body": "Plain text email body"}`;

        const prompt = `Task Title: ${task.title}
Employee Name: ${task.assigneeId.name}
Deadline: ${task.deadline}
Current Status: ${task.status}`;

        const emailContent = await callOllama('communication', prompt, systemInstruction);
        
        if (emailContent && emailContent.subject && emailContent.body) {
            // Send email
            await sendEmail(task.assigneeId.email, emailContent.subject, emailContent.body);
            
            // Record notification
            await Notification.create({
                type: 'reminder',
                title: 'Email Sent: ' + emailContent.subject,
                message: 'Automated reminder email was dispatched.',
                targetUserId: task.assigneeId._id,
                taskId: task._id
            });
            
            results.push({
                taskId: task._id,
                emailedTo: task.assigneeId.email
            });
        }
    }

    return results;
};

// Immediate sweep for newly created high-priority/same-day tasks
const triggerImmediateCommunication = async (taskId) => {
    const task = await Task.findById(taskId).populate('assigneeId', 'name email');
    if (!task || !task.assigneeId || !task.assigneeId.email) return;

    console.log(`[Communication Agent] Immediate alert triggered for Task: ${task.title}`);

    const systemInstruction = `You are a Professional Communication AI. Generate a short, polite URGENT email for an employee about a task that was just assigned to them and is due very soon (today or tomorrow).
CRITICAL INSTRUCTION: Do NOT use placeholders like "[Your Name]". Always sign off the email as "NeuroTask AI".
Return JSON: {"subject": "Email Subject", "body": "Plain text email body"}`;

    const prompt = `Task Title: ${task.title}
Employee Name: ${task.assigneeId.name}
Deadline: ${task.deadline}
Current Status: ${task.status}`;

    const emailContent = await callOllama('communication', prompt, systemInstruction);
    
    if (emailContent && emailContent.subject && emailContent.body) {
        await sendEmail(task.assigneeId.email, emailContent.subject, emailContent.body);
        
        await Notification.create({
            type: 'reminder',
            title: 'Urgent Email Sent: ' + emailContent.subject,
            message: 'An urgent same-day assignment email was automatically dispatched to the employee.',
            targetUserId: task.assigneeId._id,
            taskId: task._id
        });
    }
};

module.exports = { runCommunicationSweep, triggerImmediateCommunication };
