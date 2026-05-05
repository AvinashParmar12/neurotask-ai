import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {
    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Desktop sidebar state
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Failed to parse user data");
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            <Sidebar
                user={user}
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                toggleDesktopCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col w-0 overflow-hidden transition-all duration-300 ${isDesktopSidebarCollapsed ? 'md:pl-20' : 'md:pl-60'}`}>
                <Header
                    user={user}
                    toggleSidebar={() => setSidebarOpen(true)}
                />

                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
