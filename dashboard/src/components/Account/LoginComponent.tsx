import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, SignIn } from "@clerk/clerk-react";

const LoginComponent = () => {
  const { isSignedIn } = useUser();

  // Redirect authenticated users back to the dashboard if they somehow navigated to login 
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      Please Login or Sign up!
      <SignIn signUpUrl="/sign-up" />
    </>
  );
}


export default LoginComponent;
