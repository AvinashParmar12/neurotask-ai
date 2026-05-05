import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInitialData = useCallback(async (user) => {
        try {
            // Fetch notifications for all roles
            const { data: notifs } = await api.get('/notifications');
            setNotifications(notifs);

            // Fetch tasks (backend filters by role automatically)
            const { data: rawTasks } = await api.get('/tasks');
            const normalizedTasks = rawTasks.map(t => ({
                ...t,
                id: t._id || t.id,
                assigneeId: t.assigneeId?.name ? t.assigneeId._id : t.assigneeId,
                managerId: t.managerId?.name ? t.managerId._id : t.managerId,
                assigneeName: t.assigneeId?.name || t.assigneeName || 'Unassigned',
                assignerName: t.managerId?.name || t.assignerName || 'Manager',
            }));
            setTasks(normalizedTasks);

            if (user.role === 'admin' || user.role === 'manager') {
                const { data: allUsers } = await api.get('/users');
                setUsers(allUsers);
                
                const { data: allTeams } = await api.get('/teams');
                setTeams(allTeams);
            }
        } catch (error) {
            console.error('Error fetching initial data', error);
        }
    }, []);

    // Load user on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setCurrentUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                    await fetchInitialData(data);
                } catch (error) {
                    console.error('Auth verification failed', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [fetchInitialData]);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setCurrentUser(data);
        await fetchInitialData(data);
        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setCurrentUser(data);
        await fetchInitialData(data);
        return data;
    };

    const logout = () => {
        api.post('/auth/logout').catch(() => {}); // Optional backend logout if implemented
        localStorage.removeItem('token');
        setCurrentUser(null);
        setUsers([]);
        setTeams([]);
        setTasks([]);
        setNotifications([]);
    };

    // --- Admin / User Features ---
    const addUserByAdmin = async (userData) => {
        const { data } = await api.post('/users', userData);
        setUsers(prev => [...prev, data]);
        return data;
    };

    const deleteUser = async (userId) => {
        await api.delete(`/users/${userId}`);
        setUsers(prev => prev.filter(u => u._id !== userId));
    };

    const updateUser = async (userId, updates) => {
        const { data } = await api.put(`/users/${userId}`, updates);
        setUsers(prev => prev.map(u => u._id === userId ? data : u));
        if (currentUser && currentUser._id === userId) {
            setCurrentUser({ ...currentUser, ...data });
        }
        return data;
    };

    // --- Team Features ---
    const createTeam = async (managerId, name, memberIds) => {
        const { data } = await api.post('/teams', { name, managerId, memberIds });
        setTeams(prev => [...prev, data]);
        return data;
    };

    const updateTeam = async (teamId, updates) => {
        const { data } = await api.put(`/teams/${teamId}`, updates);
        setTeams(prev => prev.map(t => t._id === teamId ? data : t));
        return data;
    };

    const deleteTeam = async (teamId) => {
        await api.delete(`/teams/${teamId}`);
        setTeams(prev => prev.filter(t => t._id !== teamId));
    };

    // --- Task Features ---
    const addTask = async (taskData) => {
        const { data } = await api.post('/tasks', taskData);
        setTasks(prev => [data, ...prev]);
        
        // After task is added, we trigger planning agent in background
        api.post(`/ai/plan-task/${data._id}`).then(res => {
            if(res.data) {
                setTasks(prev => prev.map(t => t._id === data._id ? res.data : t));
            }
        }).catch(err => console.error('AI Planning failed:', err));

        return data;
    };

    const suggestAiPlan = async (title, description, priority) => {
        const { data } = await api.post('/ai/suggest-plan', { title, description, priority });
        return data; // contains { subtasks, suggestedDeadline, complexity }
    };

    const updateTask = async (taskId, updates) => {
        const { data } = await api.put(`/tasks/${taskId}`, updates);
        setTasks(prev => prev.map(t => t._id === taskId ? data : t));
        return data;
    };

    const reassignTask = async (taskId, newAssigneeId) => {
        const { data } = await api.put(`/tasks/${taskId}/reassign`, { newAssigneeId });
        setTasks(prev => prev.map(t => t._id === taskId ? data : t));
        return data;
    };

    const deleteTask = async (taskId) => {
        await api.delete(`/tasks/${taskId}`);
        setTasks(prev => prev.filter(t => t._id !== taskId));
    };

    const addTaskComment = async (taskId, comment) => {
        const { data } = await api.post(`/tasks/${taskId}/comments`, comment);
        setTasks(prev => prev.map(t => t._id === taskId ? data : t));
        return data;
    };

    const editTaskComment = async (taskId, commentId, text) => {
        const { data } = await api.put(`/tasks/${taskId}/comments/${commentId}`, { text });
        setTasks(prev => prev.map(t => t._id === taskId ? data : t));
        return data;
    };

    const removeTaskComment = async (taskId, commentId) => {
        const { data } = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
        setTasks(prev => prev.map(t => t._id === taskId ? data : t));
        return data;
    };

    const replyToTaskComment = async (taskId, commentId, text) => {
        const { data } = await api.post(`/tasks/${taskId}/comments/${commentId}/reply`, { text });
        setTasks(prev => prev.map(t => t._id === taskId ? data : t));
        return data;
    };

    // --- Notification Features ---
    const markNotificationRead = async (notifId) => {
        const { data } = await api.put(`/notifications/${notifId}/read`);
        setNotifications(prev => prev.map(n => n._id === notifId ? data : n));
    };

    const markAllNotificationsRead = async () => {
        await api.put('/notifications/read-all');
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Utility for local addition (e.g. websockets eventually)
    const addNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
    };

    const value = {
        currentUser,
        users,
        teams,
        tasks,
        notifications,
        loading,
        login,
        register,
        logout,
        addUserByAdmin,
        deleteUser,
        updateUser,
        createTeam,
        updateTeam,
        deleteTeam,
        addTask,
        updateTask,
        reassignTask,
        deleteTask,
        addTaskComment,
        editTaskComment,
        removeTaskComment,
        replyToTaskComment,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        suggestAiPlan
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
