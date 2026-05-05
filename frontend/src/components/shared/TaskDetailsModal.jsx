import React, { useState } from 'react';
import {
    X,
    Maximize2,
    MoreHorizontal,
    Share2,
    Eye,
    Plus,
    Activity,
    MessageSquare,
    History,
    Calendar,
    Settings,
    Clock,
    Trash2,
    UserCheck
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../context/AppContext';
import ReassignTaskModal from '../manager/ReassignTaskModal';

const TaskDetailsModal = ({ isOpen, onClose, task, onUpdateStatus }) => {
    const { tasks, users, teams, currentUser, addTaskComment, updateTask, editTaskComment, removeTaskComment, replyToTaskComment } = useAppContext();
    const [activeTab, setActiveTab] = useState('All');
    const [newComment, setNewComment] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [replyCommentId, setReplyCommentId] = useState(null);
    const [replyCommentText, setReplyCommentText] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleText, setEditTitleText] = useState(task?.title || '');
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editDescText, setEditDescText] = useState(task?.description || '');
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isAddingLinkedItem, setIsAddingLinkedItem] = useState(false);
    const [newLinkedItemText, setNewLinkedItemText] = useState('');
    const [showReassignModal, setShowReassignModal] = useState(false);

    if (!isOpen || !task) return null;

    // Fetch the live task from context so it reflects real-time updates (like new comments)
    const liveTask = tasks.find(t => t.id === task?.id) || task;

    // Resolve full user details dynamically since raw tasks only have IDs
    const assigneeDetails = users?.find(u => u.id === liveTask.assigneeId) || (liveTask.assigneeName && liveTask.assigneeName !== 'Unassigned' ? { name: liveTask.assigneeName, avatar: liveTask.assigneeName.charAt(0) } : null);
    const assignerDetails = users?.find(u => u.id === liveTask.managerId) || (liveTask.assignerName && liveTask.assignerName !== 'Unknown' ? { name: liveTask.assignerName, avatar: liveTask.assignerName.charAt(0) } : null);

    // Resolve team name
    // Find a team that belongs to this specific manager AND includes this specific assignee
    const assignedTeam = teams?.find(t => t.managerId === liveTask.managerId && t.memberIds.includes(liveTask.assigneeId));
    const teamName = assignedTeam ? assignedTeam.name : 'Unassigned';

    const getActivityTabs = () => ['All', 'Comments', 'History', 'Work log'];

    // Simple status dropdown options
    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
        { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' }
    ];

    const currentStatus = statusOptions.find(s => s.value === liveTask.status) || statusOptions[0];

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        addTaskComment(liveTask.id, {
            authorName: currentUser?.name || 'User',
            authorRole: currentUser?.role || 'user',
            text: newComment
        });
        setNewComment('');
    };

    const handleEditComment = async (commentId) => {
        if (!editCommentText.trim()) return;
        await editTaskComment(liveTask.id, commentId, editCommentText);
        setEditCommentId(null);
        setEditCommentText('');
    };

    const handleDeleteComment = async (commentId) => {
        if(window.confirm('Are you sure you want to delete this comment?')) {
            await removeTaskComment(liveTask.id, commentId);
        }
    };

    const handleReplySubmit = async (commentId) => {
        if (!replyCommentText.trim()) return;
        await replyToTaskComment(liveTask.id, commentId, replyCommentText);
        setReplyCommentId(null);
        setReplyCommentText('');
    };

    const handleUpdateTaskField = async (field, value) => {
        await updateTask(liveTask.id, { [field]: value });
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) {
            setIsAddingSubtask(false);
            return;
        }
        const newSubtask = {
            id: `ST-${Date.now()}`,
            title: newSubtaskTitle,
            status: 'pending'
        };
        updateTask(liveTask.id, { subtasks: [...(liveTask.subtasks || []), newSubtask] });
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
    };

    const handleToggleSubtask = (subtaskId) => {
        const updatedSubtasks = liveTask.subtasks.map(st =>
            st.id === subtaskId ? { ...st, status: st.status === 'completed' ? 'pending' : 'completed' } : st
        );
        updateTask(liveTask.id, { subtasks: updatedSubtasks });
    };

    const handleAddLinkedItem = () => {
        if (!newLinkedItemText.trim()) {
            setIsAddingLinkedItem(false);
            return;
        }
        const newItem = {
            id: `LI-${Date.now()}`,
            text: newLinkedItemText
        };
        updateTask(liveTask.id, { linkedItems: [...(liveTask.linkedItems || []), newItem] });
        setNewLinkedItemText('');
        setIsAddingLinkedItem(false);
    };

    const handleDeleteSubtask = (e, subtaskId) => {
        e.stopPropagation();
        const updatedSubtasks = (liveTask.subtasks || []).filter(st => st.id !== subtaskId);
        updateTask(liveTask.id, { subtasks: updatedSubtasks });
    };

    const handleDeleteLinkedItem = (e, itemId) => {
        e.stopPropagation();
        const updatedItems = (liveTask.linkedItems || []).filter(item => item.id !== itemId);
        updateTask(liveTask.id, { linkedItems: updatedItems });
    };

    const handleBackdropClick = (e) => {
        if (e.target.id === 'modal-backdrop') {
            onClose();
        }
    };

    const modalContent = (
        <div
            id="modal-backdrop"
            className="fixed inset-0 z-[100] overflow-hidden bg-gray-900 bg-opacity-40 flex justify-center items-center p-4 sm:p-6"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Header Navbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                            <svg className="w-4 h-4 mr-1.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 4h4v4H4V4zm0 6h4v4H4v-4zm0 6h4v4H4v-4zm6-12h10v4H10V4zm0 6h10v4H10v-4zm0 6h10v4H10v-4z" />
                            </svg>
                            Add epic
                        </span>
                        <span className="mx-2">/</span>
                        <span className="flex items-center text-gray-700 font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                            <span className="w-4 h-4 mr-1.5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px] font-bold">
                                ✓
                            </span>
                            {liveTask.project || 'NT'}-{liveTask.id?.substring(0, 4)?.toUpperCase() || '1234'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500">
                        {/*<button className="p-1.5 hover:bg-gray-100 border border-gray-200 rounded flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="text-xs font-semibold">1</span>
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 border border-transparent rounded">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 border border-transparent rounded">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 border border-transparent rounded">
                            <Maximize2 className="w-4 h-4" />
                        </button>*/}
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 border border-transparent rounded ml-2">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column - Main Details */}
                    <div className="w-2/3 overflow-y-auto p-6 lg:p-10 border-r border-gray-100 custom-scrollbar">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                className="text-2xl font-semibold text-gray-900 mb-6 w-full border-b border-blue-500 focus:outline-none focus:border-blue-700 bg-transparent"
                                value={editTitleText}
                                onChange={(e) => setEditTitleText(e.target.value)}
                                onBlur={() => { setIsEditingTitle(false); handleUpdateTaskField('title', editTitleText); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditingTitle(false); handleUpdateTaskField('title', editTitleText); } }}
                                autoFocus
                            />
                        ) : (
                            <h1 
                                className={`text-2xl font-semibold text-gray-900 mb-6 ${currentUser?.role !== 'employee' ? 'cursor-text hover:bg-gray-50 rounded -ml-2 px-2 py-1 transition-colors' : ''}`}
                                onClick={() => { 
                                    if (currentUser?.role !== 'employee') {
                                        setEditTitleText(liveTask.title || '');
                                        setIsEditingTitle(true);
                                    }
                                }}
                            >
                                {liveTask.title}
                            </h1>
                        )}

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center w-full group">
                                Description
                            </h3>
                            {isEditingDesc ? (
                                <div className="border border-blue-500 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                    <textarea
                                        className="w-full p-2 text-sm resize-none focus:outline-none min-h-[100px]"
                                        value={editDescText}
                                        onChange={(e) => setEditDescText(e.target.value)}
                                        autoFocus
                                    ></textarea>
                                    <div className="px-2 py-1.5 bg-gray-50 border-t flex justify-end gap-2">
                                        <button onClick={() => { setIsEditingDesc(false); setEditDescText(liveTask.description || ''); }} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                                        <button onClick={() => { setIsEditingDesc(false); handleUpdateTaskField('description', editDescText); }} className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded">Save</button>
                                    </div>
                                </div>
                            ) : liveTask.description ? (
                                <div 
                                    className={`text-sm text-gray-700 leading-relaxed max-w-none p-2 -mx-2 rounded transition-colors border border-transparent ${currentUser?.role !== 'employee' ? 'cursor-text hover:bg-gray-50 hover:border-gray-200' : ''}`}
                                    onClick={() => { 
                                        if (currentUser?.role !== 'employee') {
                                            setEditDescText(liveTask.description || '');
                                            setIsEditingDesc(true);
                                        }
                                    }}
                                >
                                    {liveTask.description}
                                </div>
                            ) : (
                                <div 
                                    className={`text-sm text-gray-500 p-2 -mx-2 rounded transition-colors border border-transparent inline-block ${currentUser?.role !== 'employee' ? 'cursor-pointer hover:bg-gray-100 hover:border-gray-200' : ''}`}
                                    onClick={() => { 
                                        if (currentUser?.role !== 'employee') {
                                            setEditDescText('');
                                            setIsEditingDesc(true);
                                        }
                                    }}
                                >
                                    Add a description...
                                </div>
                            )}
                        </div>

                        {/* Subtasks */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3 group">
                                <h3 className="text-sm font-semibold text-gray-700">Subtasks</h3>
                                {currentUser?.role !== 'employee' && (
                                    <button onClick={() => setIsAddingSubtask(true)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {liveTask.subtasks && liveTask.subtasks.length > 0 && (
                                <div className="mb-3 space-y-2">
                                    {liveTask.subtasks.map(st => (
                                        <div key={st.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors group/st">
                                            <input
                                                type="checkbox"
                                                checked={st.status === 'completed'}
                                                onChange={() => handleToggleSubtask(st.id)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className={`text-sm flex-1 ${st.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {st.title}
                                            </span>
                                            {currentUser?.role !== 'employee' && (
                                                <button
                                                    onClick={(e) => handleDeleteSubtask(e, st.id)}
                                                    className="opacity-0 group-hover/st:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                    title="Delete subtask"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentUser?.role !== 'employee' && (
                                isAddingSubtask ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); else if (e.key === 'Escape') setIsAddingSubtask(false); }}
                                            placeholder="What needs to be done?"
                                            className="flex-1 text-sm p-2 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                                            autoFocus
                                        />
                                        <button onClick={handleAddSubtask} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700">Add</button>
                                        <button onClick={() => setIsAddingSubtask(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200">Cancel</button>
                                    </div>
                                ) : (
                                    <div onClick={() => setIsAddingSubtask(true)} className="text-sm text-blue-600 font-medium cursor-pointer hover:bg-gray-100 p-1.5 -ml-1.5 rounded inline-block transition-colors">
                                        <Plus className="w-4 h-4 inline mr-1" /> Add subtask
                                    </div>
                                )
                            )}
                        </div>

                        {/* Linked work items */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3 group">
                                <h3 className="text-sm font-semibold text-gray-700">Linked work items</h3>
                                {currentUser?.role !== 'employee' && (
                                    <button onClick={() => setIsAddingLinkedItem(true)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {liveTask.linkedItems && liveTask.linkedItems.length > 0 && (
                                <div className="mb-3 space-y-2">
                                    {liveTask.linkedItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors group/li">
                                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                            <span className="text-sm text-blue-600 hover:underline cursor-pointer flex-1 line-clamp-1">
                                                {item.text}
                                            </span>
                                            {currentUser?.role !== 'employee' && (
                                                <button
                                                    onClick={(e) => handleDeleteLinkedItem(e, item.id)}
                                                    className="opacity-0 group-hover/li:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                    title="Delete linked item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentUser?.role !== 'employee' && (
                                isAddingLinkedItem ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newLinkedItemText}
                                            onChange={(e) => setNewLinkedItemText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLinkedItem(); else if (e.key === 'Escape') setIsAddingLinkedItem(false); }}
                                            placeholder="Paste task link or search"
                                            className="flex-1 text-sm p-2 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                                            autoFocus
                                        />
                                        <button onClick={handleAddLinkedItem} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700">Add</button>
                                        <button onClick={() => setIsAddingLinkedItem(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200">Cancel</button>
                                    </div>
                                ) : (
                                    <div onClick={() => setIsAddingLinkedItem(true)} className="text-sm text-blue-600 font-medium cursor-pointer hover:bg-gray-100 p-1.5 -ml-1.5 rounded inline-block transition-colors">
                                        <Plus className="w-4 h-4 inline mr-1" /> Add linked work item
                                    </div>
                                )
                            )}
                        </div>

                        {/* Activity */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-700">Activity</h3>

                            </div>

                            {/* Tabs */}
                            <div className="flex mb-6 border-b border-gray-200">
                                {getActivityTabs().map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${activeTab === tab
                                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Feed */}
                            <div className="space-y-6 pb-6">
                                {(activeTab === 'All' || activeTab === 'Comments') && (
                                    <div className="space-y-6">
                                        {activeTab === 'All' && <h4 className="text-sm font-semibold text-gray-700 mt-2 mb-4">Comments</h4>}
                                        {/* Real Comment Feed */}
                                        {liveTask.comments && liveTask.comments.map(comment => {
                                            const author = comment.userName || comment.authorName || 'User';
                                            const cId = comment._id || comment.id;
                                            const isEditing = editCommentId === cId;
                                            const isReplying = replyCommentId === cId;
                                            const canModify = currentUser && (currentUser._id === comment.userId || currentUser.role === 'admin');

                                            return (
                                            <div key={cId} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold flex-shrink-0 mt-1">
                                                    {author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900 text-sm">{author}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(comment.timestamp).toLocaleString(undefined, {
                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    
                                                    {isEditing ? (
                                                        <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                                            <textarea
                                                                className="w-full p-2 text-sm resize-none focus:outline-none min-h-[60px]"
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                autoFocus
                                                            ></textarea>
                                                            <div className="px-2 py-1.5 bg-gray-50 border-t flex justify-end gap-2">
                                                                <button onClick={() => setEditCommentId(null)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                                                                <button onClick={() => handleEditComment(cId)} className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded">Save</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {comment.text}
                                                        </div>
                                                    )}

                                                    {!isEditing && (
                                                        <div className="flex gap-4 mt-2 text-xs font-semibold text-gray-500">
                                                            <button onClick={() => { setReplyCommentId(cId); setReplyCommentText(''); }} className="hover:text-blue-600 transition-colors">Reply</button>
                                                            {canModify && (
                                                                <>
                                                                    <button onClick={() => { setEditCommentId(cId); setEditCommentText(comment.text); }} className="hover:text-blue-600 transition-colors">Edit</button>
                                                                    <button onClick={() => handleDeleteComment(cId)} className="hover:text-red-600 transition-colors">Delete</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Reply Input Form */}
                                                    {isReplying && (
                                                        <div className="mt-3 flex gap-3 ml-2">
                                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 mt-1">
                                                                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'ME'}
                                                            </div>
                                                            <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                                                <textarea
                                                                    className="w-full p-2 text-sm resize-none focus:outline-none min-h-[50px]"
                                                                    placeholder="Write a reply..."
                                                                    value={replyCommentText}
                                                                    onChange={(e) => setReplyCommentText(e.target.value)}
                                                                    autoFocus
                                                                ></textarea>
                                                                <div className="px-2 py-1.5 bg-gray-50 border-t flex justify-end gap-2">
                                                                    <button onClick={() => setReplyCommentId(null)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                                                                    <button onClick={() => handleReplySubmit(cId)} disabled={!replyCommentText.trim()} className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50">Reply</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Render Replies */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="mt-3 space-y-4 border-l-2 border-gray-100 pl-4">
                                                            {comment.replies.map(reply => {
                                                                const rAuthor = reply.userName || 'User';
                                                                return (
                                                                <div key={reply._id || reply.id} className="flex gap-3">
                                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0 mt-0.5">
                                                                        {rAuthor.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <span className="font-semibold text-gray-900 text-xs">{rAuthor}</span>
                                                                            <span className="text-[10px] text-gray-400">
                                                                                {new Date(reply.timestamp).toLocaleString(undefined, {
                                                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                                            {reply.text}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )})}
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        )})}

                                        {/* Add a new comment area */}
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 mt-1">
                                                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'ME'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                                    <textarea
                                                        className="w-full p-3 text-sm resize-none focus:outline-none placeholder-gray-500 min-h-[80px]"
                                                        rows="3"
                                                        placeholder="Add a comment..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                    ></textarea>
                                                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                                        <button
                                                            onClick={handleAddComment}
                                                            disabled={!newComment.trim()}
                                                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(activeTab === 'All' || activeTab === 'History') && (
                                    <div className="pt-4">
                                        {(activeTab === 'All' || activeTab === 'History') && <h4 className="text-sm font-semibold text-gray-700 mb-4">History</h4>}
                                        {(!liveTask.history || liveTask.history.length === 0) ? (
                                            <div className="text-sm text-gray-500 py-6 text-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                                                <History className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                                No history available for this task.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {liveTask.history.map((item, idx) => (
                                                    <div key={idx} className="flex gap-3 text-sm">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Activity className="w-3 h-3 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{item.user}</span> {item.action}
                                                            <div className="text-xs text-gray-500 mt-0.5">{new Date(item.timestamp).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(activeTab === 'All' || activeTab === 'Work log') && (
                                    <div className="pt-4">
                                        {(activeTab === 'All' || activeTab === 'Work log') && <h4 className="text-sm font-semibold text-gray-700 mb-4">Work log</h4>}
                                        {(!liveTask.workLogs || liveTask.workLogs.length === 0) ? (
                                            <div className="text-sm text-gray-500 py-6 text-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                                                <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                                No work logs have been added yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {liveTask.workLogs.map((log, idx) => (
                                                    <div key={idx} className="flex gap-3 text-sm border border-gray-100 p-3 rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                                            {log.user.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="font-semibold text-gray-900">{log.user}</span> logged <span className="font-bold text-gray-900">{log.timeSpent}</span>
                                                                </div>
                                                                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                                                            </div>
                                                            {log.description && <div className="text-gray-700 mt-1">{log.description}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar Details */}
                    <div className="w-1/3 bg-white p-6 overflow-y-auto">

                        {/* Status Actions */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="relative inline-block text-left w-auto">
                                {currentUser?.role === 'employee' ? (
                                    <>
                                        <select
                                            className={`appearance-none font-semibold text-sm px-4 py-1.5 pr-8 rounded focus:outline-none cursor-pointer hover:brightness-95 transition-all ${currentStatus.color}`}
                                            value={liveTask.status}
                                            onChange={(e) => onUpdateStatus && onUpdateStatus(liveTask.id, e.target.value)}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
                                                    {opt.label.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </>
                                ) : (
                                    <div className={`inline-flex items-center font-semibold text-sm px-4 py-1.5 rounded cursor-default ${currentStatus.color}`}>
                                        {currentStatus.label.toUpperCase()}
                                    </div>
                                )}
                            </div>


                        </div>

                        {/* Details Panel */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 cursor-pointer hover:bg-gray-50">
                                <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    Details
                                </h4>

                            </div>

                            <div className="p-4 space-y-5">
                                <div className="flex">
                                    <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Assignee</div>
                                    <div className="w-2/3 flex flex-col items-start group">
                                        <div className="flex items-center text-sm text-gray-900 hover:bg-gray-100 py-1 px-1.5 -ml-1.5 rounded cursor-pointer transition-colors w-full">
                                            {assigneeDetails ? (
                                                <>
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold mr-2">
                                                        {assigneeDetails.avatar || assigneeDetails.name?.charAt(0)}
                                                    </div>
                                                    {assigneeDetails.name}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-6 w-6 rounded-full bg-gray-100 border border-gray-300 border-dashed flex items-center justify-center text-gray-500 mr-2">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                                    </div>
                                                    Unassigned
                                                </>
                                            )}
                                        </div>
                                        {currentUser?.role === 'manager' && liveTask.status !== 'completed' && (
                                            <button
                                                onClick={() => setShowReassignModal(true)}
                                                className="mt-1 flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 -ml-1.5 rounded transition-colors border border-blue-200"
                                            >
                                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                Reassign
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Priority</div>
                                    <div className="w-2/3 flex items-center text-sm text-gray-900 hover:bg-gray-100 py-1 px-1.5 -ml-1.5 rounded cursor-pointer transition-colors"
                                         onClick={() => { if (currentUser?.role !== 'employee') setIsEditingPriority(true); }}
                                    >
                                        {isEditingPriority ? (
                                            <select 
                                                className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                value={liveTask.priority || 'medium'}
                                                onChange={(e) => { setIsEditingPriority(false); handleUpdateTaskField('priority', e.target.value); }}
                                                onBlur={() => setIsEditingPriority(false)}
                                                autoFocus
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        ) : (
                                            <>
                                                <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded text-[10px] font-bold ${liveTask.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    liveTask.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {liveTask.priority ? liveTask.priority.charAt(0).toUpperCase() : 'N'}
                                                </span>
                                                <span className="capitalize">{liveTask.priority || 'None'}</span>
                                            </>
                                        )}
                                    </div>
                                </div>



                                <div className="flex">
                                    <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Due date</div>
                                    <div className="w-2/3 text-sm flex items-center text-gray-900 hover:bg-gray-100 py-1 px-1.5 -ml-1.5 rounded cursor-pointer transition-colors"
                                         onClick={() => { if (currentUser?.role !== 'employee') setIsEditingDeadline(true); }}
                                    >
                                        {isEditingDeadline ? (
                                            <input 
                                                type="date"
                                                className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                value={liveTask.deadline ? new Date(liveTask.deadline).toISOString().split('T')[0] : ''}
                                                onChange={(e) => { setIsEditingDeadline(false); handleUpdateTaskField('deadline', e.target.value); }}
                                                onBlur={() => setIsEditingDeadline(false)}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <Calendar className="w-4 h-4 mr-2 opacity-70" />
                                                {liveTask.deadline || liveTask.dueDate ? new Date(liveTask.deadline || liveTask.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'None'}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Labels</div>
                                    <div className="w-2/3 text-sm text-gray-900 hover:bg-gray-100 py-1 px-1.5 -ml-1.5 rounded cursor-pointer transition-colors">
                                        {liveTask.labels && liveTask.labels.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {liveTask.labels.map((lbl, idx) => (
                                                    <span key={idx} className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                                                        {lbl}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : 'None'}
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Team</div>
                                    <div className="w-2/3 text-sm text-gray-600 hover:bg-gray-100 py-1 px-1.5 -ml-1.5 rounded cursor-pointer transition-colors">
                                        {teamName}
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Reporter</div>
                                    <div className="w-2/3 flex items-center text-sm text-gray-900 hover:bg-gray-100 py-1 px-1.5 -ml-1.5 rounded cursor-pointer transition-colors">
                                        <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold mr-2">
                                            {assignerDetails?.name ? assignerDetails.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'MN'}
                                        </div>
                                        {assignerDetails?.name || 'Manager'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 mt-4 flex items-center justify-between">
                            <span>Created 2 days ago</span>
                            <span>Updated 1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {createPortal(modalContent, document.body)}
            {showReassignModal && createPortal(
                <ReassignTaskModal
                    task={liveTask}
                    onClose={() => setShowReassignModal(false)}
                />,
                document.body
            )}
        </>
    );
};

export default TaskDetailsModal;
