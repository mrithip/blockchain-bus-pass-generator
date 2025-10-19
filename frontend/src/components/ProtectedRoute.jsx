import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && requireRole === 'admin' && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireRole && requireRole === 'user' && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
