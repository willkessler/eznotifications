import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, SignUp } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';
import { Card, Text, Title } from '@mantine/core';

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
          signInUrl="/login" 
        />
        <Card style={{marginLeft:'50px', marginRight: '35px', marginTop:'50px'}}>
          <Title order={4}>Creating an account is free.</Title>
          <Text style={{marginTop:'10px', color:'#999'}}><span style={{fontStyle:'italic'}}>This Is Not A Drill!</span> is currently in Beta. During this period, there will be no charge for using the service, but we welcome your feedback.</Text>
        </Card>
      </AuthLayout>
    </>
  );
}


export default SignUpComponent;
