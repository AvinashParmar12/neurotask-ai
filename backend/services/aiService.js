const axios = require('axios');
const AgentLog = require('../models/AgentLog');

const callOllama = async (agentName, prompt, systemInstruction) => {
    const startTime = Date.now();
    try {
        const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
            model: process.env.OLLAMA_MODEL || 'llama3:8b',
            system: systemInstruction,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const executionTimeMs = Date.now() - startTime;
        let outputData;

        try {
            outputData = JSON.parse(response.data.response);
        } catch (parseError) {
            outputData = response.data.response;
        }

        // Log the successful call
        await AgentLog.create({
            agentName,
            action: 'Generate Response',
            input: prompt,
            output: outputData,
            tokensUsed: response.data.eval_count || null,
            executionTimeMs,
            status: 'success'
        });

        return outputData;
    } catch (error) {
        const executionTimeMs = Date.now() - startTime;
        
        // Log the error
        await AgentLog.create({
            agentName,
            action: 'Generate Response',
            input: prompt,
            output: { error: error.message },
            executionTimeMs,
            status: 'error'
        });

        console.error(`Ollama Error [${agentName}]:`, error.message);
        return {
        error: "AI service not available (Ollama not running or not accessible)"
    };
    }
};

module.exports = { callOllama };
