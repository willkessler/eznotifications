import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, SignUp } from "@clerk/clerk-react";

const SignUpComponent = () => {
  const { isSignedIn } = useUser();

  // Redirect authenticated users back to the dashboard if they somehow navigated to the login page
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      Please Sign up!
      <SignUp signInUrl="/login" />
    </>
  );
}


export default SignUpComponent;
