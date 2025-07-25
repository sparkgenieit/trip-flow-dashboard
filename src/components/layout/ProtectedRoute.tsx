import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVendor?: boolean;
  requireDriver?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireVendor = false,
  requireDriver = false,
}) => {
  const { user, loading, isAdmin, isVendor, isDriver } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  if (requireVendor && !isVendor) {
    return <AccessDenied />;
  }

  if (requireDriver && !isDriver) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
);

export default ProtectedRoute;
