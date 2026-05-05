import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, CheckCheck, ListTodo, User, Users as UsersIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, toggleSidebar }) => {
    const { notifications, markNotificationRead, markAllNotificationsRead, currentUser, tasks, users, teams } = useAppContext();
    const navigate = useNavigate();

    // ── Notifications ──
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);
    const myNotifications = notifications.filter(n => n.targetUserId === currentUser?.id);
    const unreadCount = myNotifications.filter(n => !n.read).length;

    // ── Search ──
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search results
    const getSearchResults = () => {
        if (!searchQuery.trim()) return { tasks: [], users: [], teams: [] };
        const q = searchQuery.toLowerCase().trim();

        const matchedTasks = tasks.filter(t =>
            t.title?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q)
        ).slice(0, 5);

        const matchedUsers = users.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedTeams = teams.filter(t =>
            t.name?.toLowerCase().includes(q)
        ).slice(0, 3);

        return { tasks: matchedTasks, users: matchedUsers, teams: matchedTeams };
    };

    const searchResults = getSearchResults();
    const hasResults = searchResults.tasks.length > 0 || searchResults.users.length > 0 || searchResults.teams.length > 0;

    const handleTaskClick = (task) => {
        setShowSearch(false);
        setSearchQuery('');
        // Navigate to the appropriate task board
        if (currentUser?.role === 'employee') {
            navigate('/employee/tasks');
        } else if (currentUser?.role === 'manager') {
            navigate('/manager/tasks');
        } else {
            navigate('/admin/tasks');
        }
    };

    const formatTime = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const statusColor = (status) => {
        if (status === 'completed') return 'bg-green-100 text-green-700';
        if (status === 'in-progress') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                <div className="flex items-center flex-1">
                    {/* Mobile menu button */}
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-2"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl w-full relative" ref={searchRef}>
                        <label htmlFor="search" className="sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                id="search"
                                name="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-colors"
                                placeholder="Search tasks, people, teams..."
                                type="search"
                                autoComplete="off"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearch(true);
                                }}
                                onFocus={() => { if (searchQuery.trim()) setShowSearch(true); }}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearch && searchQuery.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
                                {!hasResults ? (
                                    <div className="p-6 text-center text-sm text-gray-500">
                                        No results found for "<strong>{searchQuery}</strong>"
                                    </div>
                                ) : (
                                    <>
                                        {/* Task Results */}
                                        {searchResults.tasks.length > 0 && (
                                            <div>
                                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                                                        <ListTodo className="h-3.5 w-3.5 mr-1.5" /> Tasks
                                                    </span>
                                                </div>
                                                {searchResults.tasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => handleTaskClick(task)}
                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* User Results */}
                                        {searchResults.users.length > 0 && (
                                            <div>
                                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                                                        <User className="h-3.5 w-3.5 mr-1.5" /> People
                                                    </span>
                                                </div>
                                                {searchResults.users.map(u => (
                                                    <div
                                                        key={u.id}
                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 flex items-center"
                                                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm mr-3 flex-shrink-0">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                                            <p className="text-xs text-gray-500">{u.email} · <span className="capitalize">{u.role}</span></p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Team Results */}
                                        {searchResults.teams.length > 0 && (
                                            <div>
                                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                                                        <UsersIcon className="h-3.5 w-3.5 mr-1.5" /> Teams
                                                    </span>
                                                </div>
                                                {searchResults.teams.map(team => (
                                                    <div
                                                        key={team.id}
                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50"
                                                        onClick={() => { setShowSearch(false); setSearchQuery(''); navigate('/manager/team'); }}
                                                    >
                                                        <p className="text-sm font-medium text-gray-900">{team.name}</p>
                                                        <p className="text-xs text-gray-500">{team.memberIds.length} member(s)</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            type="button"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="bg-white p-1.5 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors relative"
                        >
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllNotificationsRead()}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                        >
                                            <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                    {myNotifications.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-gray-500">
                                            No notifications yet.
                                        </div>
                                    ) : (
                                        myNotifications.slice(0, 15).map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => markNotificationRead(notif.id)}
                                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${!notif.read ? 'bg-blue-50/60' : ''}`}
                                            >
                                                <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{formatTime(notif.timestamp)}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div
                        className="relative flex items-center gap-3 border-l border-gray-200 pl-4 ml-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/${currentUser?.role || 'employee'}/profile`)}
                    >
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                            <span className="text-xs text-gray-500 capitalize">{user?.role || 'Role'}</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
