import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import TaskDetailsModal from '../../components/shared/TaskDetailsModal';

const EmployeeTasks = () => {
    const { currentUser, tasks, updateTask } = useAppContext();
    const [selectedTask, setSelectedTask] = useState(null);

    // Calculate metrics
    const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);

    // Sort logic to make sure `completed` tasks don't clutter top
    const displayTasks = [...myTasks].sort((a, b) => {
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
        return 0;
    });

    const handleToggleComplete = (taskId, isCompleted) => {
        updateTask(taskId, {
            status: isCompleted ? 'completed' : 'in-progress'
        });
    };

    return (
        <div className="space-y-6 flex flex-col h-full bg-gray-50 pb-10">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
                <p className="mt-1 text-sm text-gray-500">View and update your assigned tasks here. Changes are instantly reflected to your manager.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <CheckSquare className="h-5 w-5 mr-2 text-blue-500" />
                        All Assigned Tasks ({displayTasks.length})
                    </h3>
                </div>
                {displayTasks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No tasks currently assigned.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {displayTasks.map(task => (
                            <div key={task.id} className={`p-6 hover:bg-gray-50 transition-colors ${task.status === 'completed' ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start flex-1 gap-4">
                                        <div className="mt-1">
                                            <input
                                                type="checkbox"
                                                checked={task.status === 'completed'}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleToggleComplete(task.id, e.target.checked)}
                                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedTask(task)}>
                                            <h3 className={`text-base font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h3>
                                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>

                                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium border
                                                    ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
                                                `}>
                                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                                </span>

                                                <div className="flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                    {task.dueDate}
                                                </div>

                                                <div className="flex items-center text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                    <span className="font-medium mr-1 text-gray-500 uppercase tracking-widest text-[9px]">Assigner: </span>
                                                    {task.assignerName || 'Manager'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TaskDetailsModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onUpdateStatus={(id, status) => {
                    updateTask(id, { status });
                    // Optionally update selected task in place for UI responsiveness
                    setSelectedTask(prev => ({ ...prev, status }));
                }}
            />
        </div>
    );
};

export default EmployeeTasks;
