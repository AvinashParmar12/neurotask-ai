import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Settings,
    LogOut,
    BrainCircuit,
    BarChart3,
    X,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    UserCircle
} from 'lucide-react';

const Sidebar = ({ user, isOpen, closeSidebar, isDesktopCollapsed, toggleDesktopCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = user?.role || 'employee';

    const getNavLinks = () => {
        const baseLinks = [
            { name: 'Dashboard', icon: LayoutDashboard, path: `/${role}/dashboard` },
            { name: 'Task Board', icon: CheckSquare, path: `/${role}/tasks` },
        ];

        if (role === 'manager') {
            return [
                ...baseLinks,
                { name: 'Team', icon: Users, path: '/manager/team' },
                { name: 'AI Insights', icon: BrainCircuit, path: '/manager/ai-insights' },
                { name: 'Reports', icon: BarChart3, path: '/manager/reports' },
                { name: 'Profile', icon: UserCircle, path: '/manager/profile' },
            ];
        } else if (role === 'admin') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                { name: 'Users', icon: Users, path: '/admin/users' },
                { name: 'System Logs', icon: Settings, path: '/admin/logs' },
                { name: 'Agent Activity', icon: BrainCircuit, path: '/admin/agents' },
                { name: 'Profile', icon: UserCircle, path: '/admin/profile' },
            ];
        }

        // Employee
        return [
            ...baseLinks,
            { name: 'Profile', icon: UserCircle, path: '/employee/profile' },
        ];
    };

    const navLinks = getNavLinks();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar component */}
            <div className={`
        fixed inset-y-0 left-0 z-40 bg-[#f8f9fa] transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-60' : `-translate-x-full md:translate-x-0 ${isDesktopCollapsed ? 'w-20' : 'w-60'}`}
        flex flex-col h-full border-r border-gray-200
      `}>
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleDesktopCollapse}
                    className="hidden md:flex absolute -right-3 top-10 h-6 w-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 shadow-sm z-50 transition-colors"
                >
                    {isDesktopCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden w-full custom-scrollbar">
                    <div className={`flex items-center justify-center h-32 ${isDesktopCollapsed ? 'px-2' : 'px-6'} relative flex-shrink-0`}>
                        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center p-3 w-full ${isDesktopCollapsed ? 'justify-center border-none shadow-none bg-transparent p-0' : 'gap-3'}`}>
                            <div className={`h-10 w-10 bg-[#0a1128] rounded-xl flex items-center justify-center flex-shrink-0 ${isDesktopCollapsed ? 'mx-auto' : ''}`}>
                                <span className="text-[#00c2ff] font-bold text-lg italic">NT</span>
                            </div>
                            {!isDesktopCollapsed && (
                                <div className="flex flex-col justify-center">
                                    <span className="text-slate-900 text-lg font-extrabold tracking-tight leading-none mb-0.5">NeuroTask</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`flex-1 ${isDesktopCollapsed ? 'px-3' : 'px-6'} py-4 space-y-2`}>
                        {!isDesktopCollapsed && (
                            <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                OPERATIONS
                            </p>
                        )}
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname.startsWith(link.path);
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={`
                  group flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200
                  ${isActive
                                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 translate-y-[-1px]'
                                            : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800'
                                        }
                `}
                                    onClick={() => {
                                        if (window.innerWidth < 768) closeSidebar();
                                    }}
                                >
                                    <div className={`flex items-center ${isDesktopCollapsed ? 'justify-center w-full' : ''}`}>
                                        <Icon
                                            className={`flex-shrink-0 ${isDesktopCollapsed ? '' : 'mr-4'} h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        {!isDesktopCollapsed && <span className="truncate text-[15px]">{link.name}</span>}
                                    </div>
                                    {isActive && !isDesktopCollapsed && (
                                        <svg className="h-4 w-4 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>

                    <div className={`p-6 pb-8 ${isDesktopCollapsed ? 'px-2' : ''}`}>
                        <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 ${isDesktopCollapsed ? 'p-1' : 'p-2'} flex items-center justify-between overflow-hidden relative`}>
                            {!isDesktopCollapsed && <div className="absolute right-0 top-0 bottom-0 w-24 bg-blue-50 rounded-l-full -mr-4 opacity-50 pointer-events-none"></div>}
                            <div className={`flex items-center gap-3 relative z-10 w-full ${isDesktopCollapsed ? 'flex-col gap-2' : ''}`}>
                                <div className={`h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${isDesktopCollapsed ? 'mt-1' : ''}`}>
                                    <span className="text-white font-black text-lg">{user?.name?.charAt(0) || 'U'}</span>
                                </div>

                                {!isDesktopCollapsed && (
                                    <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                                        <span className="text-slate-900 font-bold text-sm truncate">{user?.name || 'Demo User'}</span>
                                        <div className="flex items-center text-blue-500 mt-0.5">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            <span className="text-[10px] font-bold tracking-wider uppercase truncate">{role}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className={`p-2 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0 rounded-full hover:bg-blue-50 cursor-pointer relative z-20 focus:outline-none ${isDesktopCollapsed ? 'mb-1' : 'mr-1'}`}
                                    title="Sign Out"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
