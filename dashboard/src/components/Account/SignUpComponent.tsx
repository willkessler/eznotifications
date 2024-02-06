import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, SignUp } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';

const SignUpComponent = () => {
  const { isSignedIn } = useUser();

  // Redirect authenticated users back to the dashboard if they somehow navigated to the login page
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <AuthLayout imageUrl="/ThisIsNotADrill1.png" >
        <SignUp 
          appearance={{
            variables: {
              colorPrimary: "#E66118",
              colorTextOnPrimaryBackground: "white",
              colorText: "white",
              colorBackground: "#E66118",
            }
          }}
          signInUrl="/login" />
      </AuthLayout>
    </>
  );
}


export default SignUpComponent;
