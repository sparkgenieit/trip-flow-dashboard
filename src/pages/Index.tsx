
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Bypass login and go directly to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;
