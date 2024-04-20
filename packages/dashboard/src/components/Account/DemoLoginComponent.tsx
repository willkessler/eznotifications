import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useSignIn, SignIn } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';
import { useSettings } from './SettingsContext';
import { Title, Text, Button } from '@mantine/core';
import LogRocket from 'logrocket';

interface ClerkSigninError extends Error {
  errors: { code: string; message: string }[];
}

const DemoLoginComponent = () => {
  const defaultButtonTitle = 'Click here to enter the demo site!';
  const { isSignedIn } = useUser();
  const { signIn, isLoaded } = useSignIn();
  const { getSigninTicket } = useSettings();
  const [ loginButtonTitle,  setLoginButtonTitle ] = useState<string>(defaultButtonTitle);
  const redirectUrl = (import.meta.env.VITE_IS_DEMO_SITE === 'true' ? import.meta.env.VITE_TINAD_DEMOPANEL_URL + '/demo' : '/');
  const demoPanelsUrl = import.meta.env.VITE_TINAD_DEMOPANEL_URL + '/demo';
  
  if (!isLoaded) {
    return null;
  }
  
  const logRocketIdentifyDemoUser = ():void => {
    LogRocket.identify(import.meta.env.VITE_CLERK_DEMO_USER_ID, {
      name: 'Demo User',
      email: import.meta.env.VITE_CLERK_DEMO_USER_EMAIL,
      subscriptionType: 'free',
    });
  }
  
  const doSignIn = async ():Promise<boolean> => {
    const clerkTicket = await getSigninTicket(import.meta.env.VITE_CLERK_DEMO_USER_ID);
    setLoginButtonTitle('Working on it!...');
    try {
      const response = await signIn.create({
        strategy: "ticket",
        ticket: clerkTicket as string,
      });
      if (response.status !== 'complete') {
        throw new Error (`HTTP error! status: ${response.status}`);
        setLoginButtonTitle(defaultButtonTitle);
      } else {
        console.log('we signed in as demo user?');
        logRocketIdentifyDemoUser();
        window.open(demoPanelsUrl, '_blank');
        window.close();
        return true;
      }
    } catch(error) {
      if ((error as ClerkSigninError).errors) {
        const errorCode = (error as ClerkSigninError).errors[0].code;
        console.log(`doSignin error: ${errorCode}`);
        if (errorCode === 'session_exists') {
          console.log('session exists');
          logRocketIdentifyDemoUser();
          window.open(demoPanelsUrl, '_blank');
          window.close();
          return true;
        } else {
          setLoginButtonTitle(defaultButtonTitle);
        }
      }
    }
    return false;
  }

  // Redirect authenticated users back to the dashboard if they somehow navigated to login,
  // unless running on the demo site, in which case, redirect to the demo site.
  if (isSignedIn) {
    logRocketIdentifyDemoUser();
    if (import.meta.env.VITE_IS_DEMO_SITE === 'true') {
      // on the demo site, if you land at the login page and you're already logged in, then go to the demo app
      window.location.href = demoPanelsUrl;
      return null;
    } else {
      return <Navigate to="/" replace />;
    }
  } else if (import.meta.env.VITE_IS_DEMO_SITE === 'false') {
    // If NOT logged in, and this is NOT the demo site, send users to the regular demo login page.
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <AuthLayout imageUrl="/ThisIsNotADrill1.png" >
        <Button size="lg" onClick={doSignIn}>{loginButtonTitle}</Button>
      </AuthLayout>
    </>
  );
}


export default DemoLoginComponent;
