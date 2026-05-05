import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Clock,
    MessageSquare,
    Paperclip,
    BrainCircuit,
    AlignLeft,
    Calendar,
    AlertTriangle,
    CheckSquare,
    Trash2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import AssignTaskModal from '../../components/manager/AssignTaskModal';
import TaskDetailsModal from '../../components/shared/TaskDetailsModal';

// Mock Data for AI Insights (no longer using static initialTasks)
// Manager-specific TaskBoard view
const TaskBoard = () => {
    const { currentUser, tasks, updateTask, deleteTask, users } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [boardInsights, setBoardInsights] = useState([]);
    const [isInsightsLoading, setIsInsightsLoading] = useState(false);

    // AI Panel Toggle Logic
    const toggleAiPanel = async () => {
        const willOpen = !isAiPanelOpen;
        setIsAiPanelOpen(willOpen);
        
        // Fetch dynamic insights if opening and we don't have them yet
        if (willOpen && boardInsights.length === 0) {
            try {
                setIsInsightsLoading(true);
                // Dynamically import api to avoid circular dependencies if any, or just use global api if we import it
                // Wait, we need to import api at the top. Let's assume it's imported or we can add the import.
                const api = require('../../services/api').default;
                const { data } = await api.get('/ai/risk-scan');
                if (data && data.insights) {
                    setBoardInsights(data.insights);
                }
            } catch (err) {
                console.error("Failed to load insights for task board:", err);
            } finally {
                setIsInsightsLoading(false);
            }
        }
    };

    // Group tasks by status
    const groupedTasks = {
        'pending': [],
        'in-progress': [],
        'completed': []
    };

    // Filter tasks for current user view (Manager sees team's, Admin sees all)
    // For Managers, filter strictly by managerId.
    let displayTasks = currentUser?.role === 'manager'
        ? tasks.filter(t => t.managerId === currentUser?.id)
        : tasks;

    // Filter by search term
    if (searchTerm) {
        displayTasks = displayTasks.filter(t =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    displayTasks.forEach(task => {
        // Find assignee details
        const assignee = users.find(u => u.id === task.assigneeId);
        const mappedTask = {
            ...task,
            assignee: {
                name: assignee ? assignee.name : 'Unassigned',
                avatar: assignee ? assignee.name.charAt(0) : '?'
            },
            labels: [`${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'} Priority`],
            project: 'NeuroTask',
            hasAiTip: task.priority === 'high'
        };

        if (groupedTasks[task.status]) {
            groupedTasks[task.status].push(mappedTask);
        } else {
            // Default bucket if status doesn't exactly match
            groupedTasks['pending'].push(mappedTask);
        }
    });

    // Task interaction logic
    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleDeleteTask = (e, taskId) => {
        e.stopPropagation(); // prevent triggering row click
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTask(taskId);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-10">
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Board</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage and track all project tasks in one place.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={toggleAiPanel}
                        className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-lg focus:outline-none transition-colors ${isAiPanelOpen
                            ? 'bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <BrainCircuit className={`h-4 w-4 md:mr-2 ${isAiPanelOpen ? 'text-purple-600' : 'text-purple-500'}`} />
                        <span className="hidden md:inline">AI Insights</span>
                    </button>
                    {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            <Plus className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">New Task</span>
                            <span className="md:hidden">Add</span>
                        </button>
                    )}
                </div>
            </div>

            {isAiPanelOpen && (
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-5 shadow-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                            <BrainCircuit className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-base font-semibold text-purple-900">AI Project Analysis</h3>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {isInsightsLoading ? (
                                    <div className="col-span-3 text-sm text-purple-600 flex items-center p-4">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing project health and bottlenecks with LLaMA-3...
                                    </div>
                                ) : boardInsights.length > 0 ? (
                                    boardInsights.slice(0, 3).map((insight, idx) => {
                                        const t = tasks.find(task => task.id === insight.taskId || task._id === insight.taskId);
                                        const isHighRisk = insight.riskScore > 75;
                                        return (
                                            <div key={idx} className="bg-white bg-opacity-60 rounded-lg p-3 border border-purple-100/50">
                                                <div className="flex items-center text-sm font-medium text-purple-800 mb-1">
                                                    {isHighRisk ? <AlertTriangle className="h-4 w-4 mr-1.5 text-red-500" /> : <Clock className="h-4 w-4 mr-1.5 text-amber-500" />}
                                                    {isHighRisk ? 'High Risk' : 'Attention Needed'} ({insight.riskScore}%)
                                                </div>
                                                <p className="text-xs text-purple-700"><strong>{t ? t.title : 'Task'}:</strong> {insight.recommendation}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-3 bg-white bg-opacity-60 rounded-lg p-3 border border-purple-100/50 flex items-center">
                                        <CheckSquare className="h-5 w-5 mr-2 text-green-500" />
                                        <span className="text-sm text-purple-800">Team is operating efficiently. No major bottlenecks detected.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAiPanelOpen(false)}
                            className="ml-4 text-purple-400 hover:text-purple-600"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="inline-flex items-start gap-6 min-w-full px-2">
                    {Object.entries(groupedTasks).map(([columnId, columnTasks]) => (
                        <div key={columnId} className="w-80 flex-shrink-0 flex flex-col max-h-full">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
                                    {columnId.replace('-', ' ')}
                                    <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-bold">
                                        {columnTasks.length}
                                    </span>
                                </h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 min-h-[500px]">
                                {columnTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                                        title="Click to advance status"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-wrap gap-1 cursor-default">
                                                {task.labels.map((label, i) => (
                                                    <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                            {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
                                                <button
                                                    onClick={(e) => handleDeleteTask(e, task.id)}
                                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{task.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{task.project}</p>

                                        {task.hasAiTip && (
                                            <div className="bg-purple-50 text-purple-700 text-xs px-2 py-1.5 rounded flex items-center mb-3">
                                                <BrainCircuit className="h-3 w-3 mr-1 flex-shrink-0" />
                                                <span className="truncate">AI suggestion available</span>
                                            </div>
                                        )}

                                        {task.progress !== undefined && task.progress < 100 && (
                                            <div className="mb-3">
                                                <div className="flex justify-between items-center mb-1 text-[10px] text-gray-500 font-medium">
                                                    <span>Progress</span>
                                                    <span>{task.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full ${task.progress > 80 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${task.progress}%` }}></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end mt-4">
                                            <div className="flex items-center">
                                                {task.deadline && (
                                                    <span className={`text-[10px] font-medium mr-2 flex items-center
                            ${task.deadline.includes('Today') ? 'text-red-500' : 'text-gray-500'}
                          `}>
                                                        <Clock className="h-3 w-3 mr-1" /> {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                                <div className="h-6 w-6 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold border border-blue-200 ring-2 ring-white" title={task.assignee.name}>
                                                    {task.assignee.avatar}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State / Dropzone placeholder */}
                                {columnTasks.length === 0 && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center text-sm font-medium text-gray-400">
                                        Drop tasks here
                                    </div>
                                )}


                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isAssignModalOpen && (
                <AssignTaskModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                />
            )}

            <TaskDetailsModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onUpdateStatus={(id, status) => {
                    updateTask(id, { status });
                    setSelectedTask(prev => ({ ...prev, status }));
                }}
            />
        </div>
    );
};

export default TaskBoard;
