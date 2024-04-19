import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useClerk, useSignin, useUser } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';

const DemoLoginComponent = () => {
  const { isLoaded, signIn, setActive } = useSignin();
  const { isSignedIn } = useUser();
  const redirectUrl = (import.meta.env.VITE_IS_DEMO_SITE === 'true' ? import.meta.env.VITE_TINAD_DEMOPANEL_URL + '/demo' : '/');

  const doDemoSignin = async() => {
    const result = await signIn.create({
      identifier: 'demo@this-is-not-a-drill.com',
      password: '#tinad1#',
    });
    if (result.status === 'complete') {
      console.log(result);
      await setActive({ session: result.createdSessionId });
      return true;
    }
    return false;
  };
  
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Replace 'user_id' with your specific demo user's ID
        await doDemoSignin();
        console.log('User has been automatically logged in');
      } catch (error) {
        console.error('Failed to auto-login', error);
      }
    };

    autoLogin();
  }, [isLoaded, signIn, setActive]);


  if (import.meta.env.VITE_IS_DEMO_SITE === 'false') {
    // If NOT logged in, and this is NOT the demo site, send users to the regular demo login page.
    return <Navigate to="/login" replace />;
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
          signUpUrl="/sign-up"
        />
      </AuthLayout>
    </>
  );
  

  
/*
  return (
    <Navigate to="/" replace />
  );
*/
}


export default withClerk(DemoLoginComponent);
