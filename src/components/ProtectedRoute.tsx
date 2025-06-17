
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  // Bypass authentication for now - just render children directly
  return <>{children}</>;
};

export default ProtectedRoute;
