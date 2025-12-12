import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { UserRole } from '../types';

interface RequireAuthProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

import { useViewMode } from '../context/ViewModeContext';

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, requiredRole }) => {
    const { user, isLoading } = useAuth();
    const { viewMode } = useViewMode();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Special handling for CR users
    if (user.role === 'CR') {
        // If in CR view, block access to Student routes
        if (viewMode === 'CR' && requiredRole === 'STUDENT') {
            return <Navigate to="/cr" replace />;
        }
        // If in Student view, block access to CR routes
        if (viewMode === 'STUDENT' && requiredRole === 'CR') {
            return <Navigate to="/student" replace />;
        }
        // Otherwise allow access
        return <>{children}</>;
    }

    // Standard role check for other users (Students)
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/student" replace />;
    }

    return <>{children}</>;
};
