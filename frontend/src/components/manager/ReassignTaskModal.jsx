import React, { useState } from 'react';
import { X, UserCheck, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ReassignTaskModal = ({ task, onClose }) => {
    const { currentUser, teams, users, reassignTask } = useAppContext();
    const [selectedMemberId, setSelectedMemberId] = useState('');

    // Get all team members under this manager
    const myTeams = teams.filter(t => t.managerId === currentUser?.id);
    const memberIds = [...new Set(myTeams.flatMap(t => t.memberIds))];
    // Exclude the current assignee
    const availableMembers = users.filter(
        u => memberIds.includes(u.id) && u.id !== task.assigneeId
    );

    const currentAssignee = users.find(u => u.id === task.assigneeId);

    const handleReassign = () => {
        if (!selectedMemberId) return;
        reassignTask(task.id, selectedMemberId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto" aria-labelledby="reassign-modal" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full w-full">
                    {/* Header */}
                    <div className="bg-white px-6 pt-5 pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                                Reassign Task
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none rounded-md">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5">
                        {/* Task info */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Task</p>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{task.title}</p>
                        </div>

                        {/* Current assignee */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Currently Assigned To</p>
                            <div className="flex items-center p-2 bg-red-50 rounded-lg border border-red-100">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold mr-3">
                                    {currentAssignee?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-sm font-medium text-gray-800">{currentAssignee?.name || 'Unassigned'}</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center">
                            <ArrowRight className="h-5 w-5 text-gray-400 rotate-90" />
                        </div>

                        {/* Select new assignee */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Reassign To</p>
                            {availableMembers.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                    No other team members available
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {availableMembers.map(member => (
                                        <label
                                            key={member.id}
                                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedMemberId === member.id
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="reassignee"
                                                value={member.id}
                                                checked={selectedMemberId === member.id}
                                                onChange={() => setSelectedMemberId(member.id)}
                                                className="sr-only"
                                            />
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${selectedMemberId === member.id
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {member.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                            {selectedMemberId === member.id && (
                                                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-row-reverse gap-3">
                        <button
                            onClick={handleReassign}
                            disabled={!selectedMemberId}
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Reassign Task
                        </button>
                        <button
                            onClick={onClose}
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReassignTaskModal;
