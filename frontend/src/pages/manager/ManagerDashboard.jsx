import React, { useState } from 'react';
import {
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    Plus,
    BrainCircuit,
    Calendar,
    MoreVertical,
    ListTodo
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const { currentUser, teams, users, tasks } = useAppContext();
    const [successMsg, setSuccessMsg] = useState('');
    const [resolvedAlerts, setResolvedAlerts] = useState([]);
    const navigate = useNavigate();

    // ── Dynamic data from context ──

    // Get ALL teams for this manager
    const myTeams = teams.filter(t => t.managerId === currentUser?.id);
    const allMemberIds = [...new Set(myTeams.flatMap(t => t.memberIds))];
    const teamMembers = users.filter(u => allMemberIds.includes(u.id));

    // Get all tasks managed by this manager
    const myTasks = tasks.filter(t => t.managerId === currentUser?.id);
    const completedTasks = myTasks.filter(t => t.status === 'completed');
    const inProgressTasks = myTasks.filter(t => t.status === 'in-progress');
    const pendingTasks = myTasks.filter(t => t.status === 'pending');

    // Dynamic stat cards
    const statCards = [
        { title: 'Team Members', value: String(teamMembers.length), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: `${myTeams.length} team(s)` },
        { title: 'Tasks Completed', value: String(completedTasks.length), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', trend: `of ${myTasks.length} total` },
        { title: 'In Progress', value: String(inProgressTasks.length), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', trend: `${pendingTasks.length} pending` },
        { title: 'Total Tasks', value: String(myTasks.length), icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'Across all teams' },
    ];

    // Dynamic workload data: tasks per team member
    const workloadData = teamMembers.map(member => {
        const memberTaskCount = myTasks.filter(t => t.assigneeId === member.id).length;
        return {
            name: member.name.split(' ')[0], // First name for chart
            tasks: memberTaskCount,
            capacity: 10 // Standard capacity
        };
    });

    // Dynamic status pie chart
    const statusData = [
        { name: 'Completed', value: completedTasks.length, color: '#10B981' },
        { name: 'In Progress', value: inProgressTasks.length, color: '#3B82F6' },
        { name: 'Pending', value: pendingTasks.length, color: '#9CA3AF' },
    ].filter(d => d.value > 0);

    // Dynamic risk alerts based on actual data
    const riskAlerts = [];
    // Check for overloaded members
    teamMembers.forEach(member => {
        const memberTasks = myTasks.filter(t => t.assigneeId === member.id && t.status !== 'completed');
        if (memberTasks.length > 5) {
            riskAlerts.push({
                id: `risk-overload-${member.id}`,
                type: 'high',
                title: `${member.name} is overloaded`,
                message: `${member.name} has ${memberTasks.length} active tasks. Consider reassigning some tasks.`,
                agent: 'Priority & Risk Agent'
            });
        }
    });
    // Check for tasks with past deadlines
    const overdueTasks = myTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed');
    if (overdueTasks.length > 0) {
        riskAlerts.push({
            id: 'risk-overdue',
            type: 'medium',
            title: `${overdueTasks.length} task(s) overdue`,
            message: `There are ${overdueTasks.length} tasks past their deadline that are not completed yet.`,
            agent: 'Monitoring Agent'
        });
    }
    // Check for members with 0 tasks
    const idleMembers = teamMembers.filter(m => myTasks.filter(t => t.assigneeId === m.id).length === 0);
    if (idleMembers.length > 0) {
        riskAlerts.push({
            id: 'risk-idle',
            type: 'low',
            title: `${idleMembers.length} member(s) have no tasks`,
            message: `${idleMembers.map(m => m.name).join(', ')} currently have no assigned tasks.`,
            agent: 'Planning Agent'
        });
    }

    const handleResolveAlert = (id, message) => {
        setResolvedAlerts(prev => [...prev, id]);
        setSuccessMsg(message);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    // Calculate tasks per member for team table
    const teamStats = teamMembers.map(member => {
        const memberTasks = myTasks.filter(t => t.assigneeId === member.id);
        const taskCount = memberTasks.length;
        let status = 'Optimal';
        if (taskCount > 8) status = 'Overloaded';
        if (taskCount < 2) status = 'Available';

        return {
            id: member.id,
            name: member.name,
            role: member.role,
            tasks: taskCount,
            status,
            avatar: member.name.charAt(0)
        };
    });

    const activeAlerts = riskAlerts.filter(a => !resolvedAlerts.includes(a.id));

    return (
        <div className="space-y-6 flex flex-col h-full bg-gray-50 pb-10">
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manager Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your team, assign tasks, and review AI insights.</p>
                </div>
            </div>

            {successMsg && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm flex items-center shadow-sm border border-green-100">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span className="font-medium">{successMsg}</span>
                </div>
            )}

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

            {/* AI Risk Alerts - Highlighted Section */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <BrainCircuit className="h-5 w-5 text-orange-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">AI Risk Intelligence</h2>
                    </div>
                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {activeAlerts.length} Alerts
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {activeAlerts.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 flex flex-col items-center">
                            <CheckCircle className="h-10 w-10 text-green-400 mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">All caught up!</h3>
                            <p className="text-sm text-gray-500 mt-1">No pending AI risks or alerts for your team.</p>
                        </div>
                    ) : activeAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                {alert.type === 'high' ? (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : alert.type === 'medium' ? (
                                    <Clock className="h-5 w-5 text-amber-500" />
                                ) : (
                                    <div className="h-5 w-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                                    <span className="text-xs text-gray-500 flex items-center">
                                        <BrainCircuit className="h-3 w-3 mr-1" /> {alert.agent}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                                <div className="mt-3 flex space-x-3">
                                    <button
                                        onClick={() => handleResolveAlert(alert.id, 'Alert Dismissed')}
                                        className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Dismiss Alert
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Workload Visualization */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Workload Distribution</h2>
                    <div className="h-64">
                        {workloadData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No team members yet. Create a team first.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 13 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="tasks"
                                        radius={[0, 4, 4, 0]}
                                        barSize={24}
                                    >
                                        {workloadData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.tasks > entry.capacity ? '#EF4444' : entry.tasks < (entry.capacity * 0.4) ? '#10B981' : '#3B82F6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                        <span className="flex items-center text-gray-500"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Available</span>
                        <span className="flex items-center text-gray-500"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Optimal</span>
                        <span className="flex items-center text-gray-500"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Overloaded</span>
                    </div>
                </div>

                {/* Task Status Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status Overview</h2>
                    <div className="h-64 flex items-center justify-center relative">
                        {statusData.length === 0 ? (
                            <div className="text-gray-400 text-sm">No tasks assigned yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        labelLine={false}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        {myTasks.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-gray-900">{myTasks.length}</span>
                                <span className="text-xs text-gray-500 font-medium">Total Tasks</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {statusData.map((status) => (
                            <div key={status.name} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></span>
                                    <span className="text-sm text-gray-600">{status.name}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{status.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Team Directory</h2>
                    <button
                        onClick={() => navigate('/manager/team')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        View All Members
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Tasks</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teamStats.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No team members. Go to Team Management to create a team.</td>
                                </tr>
                            )}
                            {teamStats.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-700 font-bold">
                                                    {member.avatar}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.tasks}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${member.status === 'Overloaded' ? 'bg-red-100 text-red-800' :
                                                member.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'}`
                                        }>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
