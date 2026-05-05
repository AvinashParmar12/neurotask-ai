import React from 'react';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    MessageSquare,
    Paperclip,
    BrainCircuit,
    ArrowRight,
    ListTodo
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
    const { currentUser, tasks, updateTask, teams } = useAppContext();
    const navigate = useNavigate();
    const [isFocusSession, setIsFocusSession] = React.useState(false);

    // ── Dynamic metrics from context ──
    const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);
    const completedTasks = myTasks.filter(t => t.status === 'completed');
    const inProgressTasks = myTasks.filter(t => t.status === 'in-progress');
    const pendingTasks = myTasks.filter(t => t.status === 'pending');
    const highPriorityTasks = myTasks.filter(t => t.priority === 'high' && t.status !== 'completed');
    const productivityPct = myTasks.length > 0
        ? Math.round((completedTasks.length / myTasks.length) * 100)
        : 0;

    // Dynamic stat cards
    const statCards = [
        { title: 'My Tasks', value: String(myTasks.length), icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-100', text: `${pendingTasks.length} pending` },
        { title: 'Completed', value: String(completedTasks.length), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: `${inProgressTasks.length} in progress` },
        { title: 'High Priority', value: String(highPriorityTasks.length), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Needs focus' },
        { title: 'Productivity', value: `${productivityPct}%`, icon: BrainCircuit, color: 'text-orange-600', bg: 'bg-orange-100', text: myTasks.length === 0 ? 'No tasks yet' : productivityPct >= 70 ? 'Great progress!' : 'Keep going' },
    ];

    // Dynamic productivity chart – group tasks by status for a simple bar
    const productivityData = [
        { name: 'Pending', count: pendingTasks.length },
        { name: 'In Progress', count: inProgressTasks.length },
        { name: 'Completed', count: completedTasks.length },
    ];

    // Sort logic to make sure `completed` tasks don't clutter top
    const priorityTasks = myTasks.filter(t => t.priority === 'high' || t.status !== 'completed').sort((a, b) => {
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
        return 0;
    });

    const handleToggleComplete = (taskId, isCompleted) => {
        updateTask(taskId, {
            status: isCompleted ? 'completed' : 'in-progress'
        });
    };

    // Find the employee's team
    const myTeam = teams?.find(t => t.memberIds?.includes(currentUser?.id));
    const highPriorityTask = highPriorityTasks[0];

    return (
        <div className="space-y-6 flex flex-col h-full bg-gray-50 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, {currentUser?.name || 'User'}</h1>
                <p className="mt-1 text-sm text-gray-500">Here's what you need to focus on today.</p>
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
                                    <span className="font-medium text-gray-500">{stat.text}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Tasks List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Priority Tasks ({priorityTasks.length})</h2>
                        <button
                            onClick={() => navigate('/employee/tasks')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            View Board
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {priorityTasks.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No tasks assigned yet. Your manager will assign tasks to you.</div>
                        )}
                        {priorityTasks.map((task) => (
                            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'completed'}
                                            onChange={(e) => handleToggleComplete(task.id, e.target.checked)}
                                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <h3 className={`text-base font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h3>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                  `}>
                                        {task.priority === 'high' ? 'High Priority' : 'Normal'}
                                    </span>
                                </div>

                                <div className="ml-8">
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        {task.deadline && <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /> {new Date(task.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium
                                            ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'}`}>
                                            {task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'Pending'}
                                        </span>
                                    </div>


                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Focus Area & Analytics */}
                <div className="space-y-6">
                    <div className={`w-full rounded-xl shadow-md overflow-hidden text-white relative transition-colors duration-500 ${isFocusSession ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
                        <div className="absolute right-0 top-0 mt-4 mr-4 opacity-20 transition-transform duration-1000 ease-in-out" style={{ transform: isFocusSession ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <BrainCircuit size={64} />
                        </div>
                        <div className="p-6 relative z-10 flex flex-col h-full">
                            <h3 className="text-lg font-bold mb-2">
                                {isFocusSession ? '🎯 Focus Session Active' : 'AI Daily Briefing'}
                            </h3>
                            <p className="text-blue-50 text-sm leading-relaxed mb-6 flex-1 text-opacity-90">
                                {isFocusSession ? (
                                    <>
                                        Notifications are muted. You are currently in deep focus mode.
                                        {highPriorityTask ? <> Working on <strong className="text-white">{highPriorityTask.title}</strong>.</> : ' Keep up the good work!'}
                                    </>
                                ) : (
                                    <>
                                        You have <strong className="text-white">{myTasks.length} total tasks</strong> with <strong className="text-white">{pendingTasks.length} pending</strong>.
                                        {highPriorityTask ? <> Focus on <strong className="text-white">"{highPriorityTask.title}"</strong> first — it's high priority.</> : ' Great job staying on track!'}
                                    </>
                                )}
                            </p>
                            <button
                                onClick={() => setIsFocusSession(!isFocusSession)}
                                className={`text-sm font-semibold py-2 px-4 rounded-lg shadow transition flex items-center w-full justify-center ${isFocusSession ? 'bg-green-700 text-white hover:bg-green-800 border border-green-500' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                            >
                                {isFocusSession ? 'End Focus Session' : <>Start Focus Session <ArrowRight className="ml-2 h-4 w-4" /></>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Task Status</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productivityData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
