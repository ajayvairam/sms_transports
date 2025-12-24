import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'owner':
        return <Navigate to="/owner/dashboard" replace />;
      case 'driver':
        return <Navigate to="/driver/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;