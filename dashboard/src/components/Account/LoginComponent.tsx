import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, SignIn } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';

const LoginComponent = () => {
  const { isSignedIn } = useUser();

  // Redirect authenticated users back to the dashboard if they somehow navigated to login 
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <AuthLayout imageUrl="/ThisIsNotADrill1.png" >
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#E66118",
              colorTextOnPrimaryBackground: "white",
              colorText: "white",
              colorBackground: "#E66118",
            }
          }}
          signUpUrl="/sign-up" />
      </AuthLayout>
    </>
  );
}


export default LoginComponent;
