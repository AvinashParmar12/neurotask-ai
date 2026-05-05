import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Server, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/admin/logs');
                setLogs(data);
            } catch (err) {
                console.error("Failed to load system logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getIconDetails = (targetType) => {
        switch(targetType) {
            case 'user': return { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'task': return { icon: Terminal, color: 'text-green-500', bg: 'bg-green-50' };
            case 'team': return { icon: Server, color: 'text-purple-500', bg: 'bg-purple-50' };
            default: return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' };
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-10">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Logs</h1>
                    <p className="mt-1 text-sm text-gray-500">Live telemetry of application events and database interactions.</p>
                </div>
                {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
                <div className="flow-root">
                    <ul className="-mb-8">
                        {!loading && logs.length === 0 && (
                            <div className="text-center text-sm text-gray-500 py-10">No system events logged yet.</div>
                        )}
                        {logs.map((log, logIdx) => {
                            const { icon: Icon, color, bg } = getIconDetails(log.targetType);
                            const performedBy = log.performedBy?.name || 'System';
                            return (
                                <li key={log._id}>
                                    <div className="relative pb-8">
                                        {logIdx !== logs.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${bg}`}>
                                                    <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                                    <p className="text-sm text-gray-600 mt-0.5">{log.details}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Initiated by: {performedBy}</p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time dateTime={log.timestamp}>{formatTime(log.timestamp)}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
