import React, { useState } from 'react';
import { X, BrainCircuit, Loader2, Sparkles, CheckSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AssignTaskModal = ({ onClose, onAssign }) => {
    const { currentUser, teams, users, addTask, suggestAiPlan } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignee: '',
        deadline: '',
        priority: 'medium'
    });

    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [showError, setShowError] = useState(false);

    // Get all manager's teams and their members (unique)
    const myTeams = teams.filter(t => t.managerId === currentUser?.id);
    const memberIds = [...new Set(myTeams.flatMap(t => t.memberIds))];
    const teamMembers = users.filter(u => memberIds.includes(u.id));

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAiPlan = async () => {
        if (!formData.title) {
            setShowError(true);
            return;
        }
        setShowError(false);

        setIsLoading(true);
        try {
            const data = await suggestAiPlan(formData.title, formData.description, formData.priority);
            const recommendedAssignee = teamMembers.length > 0 ? teamMembers[0].id : '';
            
            // Extract properly handles missing or malformed AI data gracefully
            const subtasksList = (data?.subtasks || []).map(st => st.title || st);

            setAiSuggestions({
                subtasks: subtasksList.length > 0 ? subtasksList : ['Review task requirements'],
                recommendedDeadline: data?.suggestedDeadline ? data.suggestedDeadline.split('T')[0] : '',
                estimatedTime: data?.complexity || 'unknown',
                recommendedPriority: formData.priority,
                recommendedAssignee: recommendedAssignee
            });
        } catch (error) {
            console.error("AI Planning failed:", error);
            // Fallback in case of failure
            setAiSuggestions({
                subtasks: ['Review Requirements', 'Execute Task', 'Final Review'],
                recommendedDeadline: '',
                estimatedTime: 'unknown',
                recommendedPriority: formData.priority,
                recommendedAssignee: teamMembers.length > 0 ? teamMembers[0].id : ''
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const assigneeId = formData.assignee || aiSuggestions?.recommendedAssignee;
        const assignedMember = teamMembers.find(t => t.id === assigneeId);

        // Final task data to add
        const taskData = {
            title: formData.title,
            description: formData.description,
            assigneeId: assigneeId,
            managerId: currentUser.id,
            deadline: formData.deadline || aiSuggestions?.recommendedDeadline || '',
            priority: formData.priority || aiSuggestions?.recommendedPriority || 'medium',
            subtasks: (aiSuggestions?.subtasks || []).map(st => ({ title: st, status: 'pending' }))
        };

        addTask(taskData);
        if (onAssign) onAssign(assignedMember?.name || 'an employee');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center" id="modal-title">
                                Assign New Task
                                {aiSuggestions && <Sparkles className="ml-2 h-5 w-5 text-purple-500" />}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Task Title</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md border p-2 ${showError ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="e.g. Develop user authentication module"
                                        value={formData.title}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (e.target.value) setShowError(false);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAiPlan}
                                        disabled={!formData.title || isLoading}
                                        title="Auto-fill with AI"
                                        className="mt-1 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-purple-600 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                                    </button>
                                </div>
                                {showError && <p className="mt-1 text-xs text-red-500 font-medium">Please enter a task title to generate AI plan or submit.</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={2}
                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                                    placeholder="Brief details about the task..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{aiSuggestions ? 'Suggested Assignee' : 'Assignee'}</label>
                                    <select
                                        value={formData.assignee || (aiSuggestions ? aiSuggestions.recommendedAssignee : '')}
                                        onChange={handleChange}
                                        name="assignee"
                                        className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border text-blue-700 font-medium"
                                        required
                                    >
                                        <option value="" disabled>Select...</option>
                                        {teamMembers.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} {member.id === aiSuggestions?.recommendedAssignee ? '(AI Recommend)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority || (aiSuggestions ? aiSuggestions.recommendedPriority : 'medium')}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline || (aiSuggestions ? aiSuggestions.recommendedDeadline : '')}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                                />
                            </div>

                            {aiSuggestions && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                        <span>Suggested Subtasks</span>
                                        <span className="text-xs text-purple-600 font-normal">Editable</span>
                                    </label>
                                    <div className="bg-white border border-gray-200 rounded-md shadow-sm divide-y divide-gray-100">
                                        {(aiSuggestions ? aiSuggestions.subtasks : []).map((task, idx) => (
                                            <div key={idx} className="p-2 flex items-center gap-2 hover:bg-gray-50">
                                                <CheckSquare className="h-4 w-4 text-gray-300" />
                                                <input
                                                    type="text"
                                                    defaultValue={task}
                                                    className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full text-gray-700"
                                                />
                                                <button type="button" className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            onClick={(e) => {
                                if (!formData.title) {
                                    setShowError(true);
                                    return;
                                }
                                handleSubmit(e);
                            }}
                        >
                            Assign Task
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignTaskModal; 
