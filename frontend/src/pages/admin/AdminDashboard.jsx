import React from 'react';
import {
    Users,
    CheckCircle,
    Clock,
    BrainCircuit,
    TrendingUp,
    Activity,
    ListTodo
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { users, tasks, teams, notifications } = useAppContext();
    const [successMsg, setSuccessMsg] = React.useState('');
    const navigate = useNavigate();

    // ── Dynamic data from context ──
    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const managers = users.filter(u => u.role === 'manager');
    const employees = users.filter(u => u.role === 'employee');

    // Dynamic stat cards
    const statCards = [
        { title: 'Total Users', value: String(totalUsers), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: `${managers.length} managers, ${employees.length} employees` },
        { title: 'Tasks Completed', value: String(completedTasks.length), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', trend: `of ${totalTasks} total` },
        { title: 'Pending Tasks', value: String(pendingTasks.length), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', trend: `${inProgressTasks.length} in progress` },
        { title: 'Teams', value: String(teams.length), icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-100', trend: `${teams.reduce((sum, t) => sum + t.memberIds.length, 0)} total members` },
    ];

    // Dynamic chart: tasks by status
    const statusChartData = [
        { name: 'Pending', value: pendingTasks.length, color: '#9CA3AF' },
        { name: 'In Progress', value: inProgressTasks.length, color: '#3B82F6' },
        { name: 'Completed', value: completedTasks.length, color: '#10B981' },
    ].filter(d => d.value > 0);

    // Dynamic bar chart: tasks per manager
    const managerChartData = managers.map(mgr => {
        const mgrTasks = tasks.filter(t => t.managerId === mgr.id);
        return {
            name: mgr.name.split(' ')[0],
            assigned: mgrTasks.length,
            completed: mgrTasks.filter(t => t.status === 'completed').length
        };
    });

    // Dynamic recent activity from notifications
    const recentActivity = notifications.slice(0, 8).map(n => ({
        id: n.id,
        action: n.title,
        message: n.message,
        time: formatTime(n.timestamp),
        type: n.type === 'task_assigned' ? 'system' : 'ai'
    }));

    function formatTime(timestamp) {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    // Make AI Agents interactive with real backend
    const [agents, setAgents] = React.useState([]);

    React.useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await api.get('/ai/agents');
                const backendAgents = res.data.agents.map(a => {
                    let count = 0;
                    let lastActive = 'Just now';
                    if (a.id === 1) { count = totalTasks; lastActive = '2 min ago'; }
                    if (a.id === 2) { count = pendingTasks.length; lastActive = 'Just now'; }
                    if (a.id === 3) { count = inProgressTasks.length; lastActive = '5 min ago'; }
                    if (a.id === 4) { count = notifications.length; lastActive = '1 min ago'; }
                    return { ...a, count, lastActive };
                });
                setAgents(backendAgents);
            } catch (err) {
                console.error('Error fetching agents:', err);
            }
        };
        fetchAgents();
    }, [totalTasks, pendingTasks.length, inProgressTasks.length, notifications.length]);

    const toggleAgentStatus = async (id) => {
        try {
            const res = await api.put(`/ai/agents/${id}/toggle`);
            const updatedAgent = res.data.agent;
            
            setAgents(prev => prev.map(agent => {
                if (agent.id === id) {
                    return { ...agent, status: updatedAgent.status, color: updatedAgent.color };
                }
                return agent;
            }));
            
            toast.success(`${updatedAgent.name} is now ${updatedAgent.status}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to toggle agent');
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-full bg-gray-50 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Overview</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor overall platform analytics and AI agent performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-xl p-3 ${stat.bg}`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                                            <dd>
                                                <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-500">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart: Tasks per Manager */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Tasks Per Manager</h2>
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center text-xs font-medium text-gray-500">
                                <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span> Assigned
                            </span>
                            <span className="flex items-center text-xs font-medium text-gray-500">
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span> Completed
                            </span>
                        </div>
                    </div>
                    <div className="h-72">
                        {managerChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No managers with tasks yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={managerChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="assigned" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Activity & Logs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <div className="p-1 px-2.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                            Live updates
                        </div>
                    </div>
                    <div className="p-0 overflow-y-auto flex-1 h-[290px]">
                        <ul className="divide-y divide-gray-100">
                            {recentActivity.length === 0 ? (
                                <li className="p-6 text-center text-sm text-gray-500">No recent activity. Activity will appear here when tasks are assigned.</li>
                            ) : (
                                recentActivity.map((log) => (
                                    <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start space-x-3">
                                            <div className={`mt-0.5 p-1.5 rounded-full ${log.type === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {log.type === 'ai' ? <BrainCircuit size={14} /> : <Activity size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {log.action}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {log.message}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-xs text-gray-400">
                                                {log.time}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    <div className="p-4 border-t border-gray-100 text-center">
                        <button
                            onClick={() => navigate('/admin/logs')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            View All Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Agents Status */}
            <h2 className="text-lg font-semibold text-gray-900 pt-2">Active AI Agents</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {agents.map((agent) => (
                    <div key={agent.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md ${agent.status === 'Paused' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                        <div className={`absolute top-0 right-0 w-2 h-full ${agent.color === 'green' ? 'bg-green-400' : agent.color === 'amber' ? 'bg-amber-400' : 'bg-gray-400'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${agent.status === 'Paused' ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-purple-600'}`}>
                                <BrainCircuit size={20} />
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                ${agent.color === 'green' ? 'bg-green-100 text-green-800' :
                                    agent.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                {agent.status}
                            </span>
                        </div>
                        <h3 className="text-gray-900 font-semibold mb-1 pr-6">{agent.name}</h3>
                        <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                            <div className="text-gray-500">
                                <span className="font-medium text-gray-900">{agent.count}</span> tasks
                            </div>
                            <button
                                onClick={() => toggleAgentStatus(agent.id)}
                                className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${agent.status === 'Paused' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {agent.status === 'Paused' ? 'Activate' : 'Pause'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default AdminDashboard;
