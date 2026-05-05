import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token || !userStr) {
        // Not logged in, redirect to login page with the return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // Check if route is restricted by role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Role not authorized, redirect to their specific dashboard
            switch (user.role) {
                case 'admin':
                    return <Navigate to="/admin/dashboard" replace />;
                case 'manager':
                    return <Navigate to="/manager/dashboard" replace />;
                case 'employee':
                default:
                    return <Navigate to="/employee/dashboard" replace />;
            }
        }

        // Authorized, return components
        return children;
    } catch (error) {
        // If parsing fails, logout User
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }
};

export default PrivateRoute;
