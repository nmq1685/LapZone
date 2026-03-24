import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
};

export const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};
