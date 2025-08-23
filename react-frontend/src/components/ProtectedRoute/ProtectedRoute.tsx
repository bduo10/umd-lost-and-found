import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    requireAuth = true,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth(); 
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="loading-container">
                Loading...
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (<>{children}</>);
}