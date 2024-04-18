import React from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthWrapper:React.FC<{ children: React.ReactNode}> = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const { isLoaded } = useAuth();
  const location = useLocation();
  const unprotectedRoutes = ['/login', '/demo-login', '/sign-up']; // List of routes that don't require authentication

  if (!isLoaded) {
    console.log('waiting for auth loading to complete');
    return <div>Loading...</div>;
  }
  
  // If the user is not signed in and the route is not in the list of unprotected routes, redirect to login
  if (!isSignedIn && !unprotectedRoutes.includes(location.pathname)) {
    console.log('Navigating to home page at :', location.pathname, 'isSignedIn:', isSignedIn);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthWrapper;
