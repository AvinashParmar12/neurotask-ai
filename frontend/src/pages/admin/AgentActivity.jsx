import React, { useState, useEffect } from 'react';
import { Bot, Zap, Clock, ShieldCheck, Loader2, Gauge } from 'lucide-react';
import api from '../../services/api';

const AgentActivity = () => {
    const [agentLogs, setAgentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const { data } = await api.get('/admin/agent-logs');
                setAgentLogs(data);
            } catch (err) {
                console.error("Failed to fetch agent logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgentData();
    }, []);

    // Dynamically calculate metrics from real Ollama inference logs
    const activeAgents = [
        { id: 'planning', name: 'Workload Planner Agent', icon: Bot, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'risk', name: 'Priority & Risk Agent', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { id: 'monitoring', name: 'Monitoring Agent', icon: Clock, color: 'text-green-600', bg: 'bg-green-100' }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-10">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Agent Activity</h1>
                    <p className="mt-1 text-sm text-gray-500">Live monitoring of Ollama LLaMA-3 inference metrics.</p>
                </div>
                <div className="flex items-center space-x-4">
                    {loading && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
                    <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        AI Engine Online
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {activeAgents.map(agent => {
                    const Icon = agent.icon;
                    // Filter logs for this specific agent
                    const specificLogs = agentLogs.filter(log => log.agentName === agent.id);
                    const isUsed = specificLogs.length > 0;
                    const avgTime = isUsed 
                        ? Math.round(specificLogs.reduce((acc, l) => acc + (l.executionTimeMs || 0), 0) / specificLogs.length) / 1000
                        : 0;

                    return (
                        <div key={agent.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-opacity ${!isUsed ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${agent.bg}`}>
                                    <Icon className={`h-6 w-6 ${agent.color}`} />
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isUsed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {isUsed ? 'Active' : 'Standby'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center"><Zap className="h-3 w-3 mr-1" /> Total Inferences</p>
                                        <p className="text-lg font-bold text-gray-900">{specificLogs.length}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center"><Gauge className="h-3 w-3 mr-1" /> Avg Process Time</p>
                                        <p className="text-lg font-bold text-gray-900">{isUsed ? `${avgTime}s` : '--'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Raw Output Log */}
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">Raw Inference Logs</h2>
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-4 font-mono text-sm overflow-x-auto">
                {loading ? (
                    <div className="text-gray-500 flex items-center">Fetching logs from terminal...</div>
                ) : agentLogs.length === 0 ? (
                    <div className="text-gray-500">No AI inference logs generated yet. Process a task to see logs.</div>
                ) : (
                    <div className="space-y-3">
                        {agentLogs.map((log) => (
                            <div key={log._id} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center text-gray-400 text-xs mb-1">
                                    <span className="text-green-400 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span className="text-blue-400 font-bold uppercase">{log.agentName}</span>
                                    <span className="mx-2">::</span>
                                    <span>status={log.status}</span>
                                    <span className="mx-2">::</span>
                                    <span className="text-yellow-400">{log.executionTimeMs}ms</span>
                                </div>
                                <div className="text-gray-300 whitespace-pre-wrap">{log.action || 'Inference Executed'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentActivity;
