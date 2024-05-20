import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useSignIn, SignIn } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';
import { useSettings } from './SettingsContext';
import { Card, Image, Group, Title, Text, Button } from '@mantine/core';
import LogRocket from 'logrocket';

interface ClerkSigninError extends Error {
  errors: { code: string; message: string }[];
}

const DemoDashboardComponent = () => {
  const defaultButtonTitle = 'Load the dashboard!';
  const { isSignedIn } = useUser();
  const { signIn, isLoaded } = useSignIn();
  const { getSigninTicket } = useSettings();
  const [ loginButtonTitle,  setLoginButtonTitle ] = useState<string>(defaultButtonTitle);
  const redirectUrl = (import.meta.env.VITE_IS_DEMO_SITE === 'true' ? import.meta.env.VITE_TINAD_DEMOPANEL_URL + '/demo' : '/');
  const dashboardPanelUrl = import.meta.env.VITE_TINAD_DASHBOARDPANEL_URL;
  
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
        window.location = dashboardPanelUrl;
        return true;
      }
    } catch(error) {
      if ((error as ClerkSigninError).errors) {
        const errorCode = (error as ClerkSigninError).errors[0].code;
        console.log(`doSignin error: ${errorCode}`);
        if (errorCode === 'session_exists') {
          console.log('session exists');
          logRocketIdentifyDemoUser();
          window.location = dashboardPanelUrl;
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
      window.location.href = dashboardPanelUrl;
      return null;
    } else {
      return <Navigate to="/" replace />;
    }
  } else if (import.meta.env.VITE_IS_DEMO_SITE === 'false') {
    // If NOT logged in, and this is NOT the demo site, send users to the regular demo login page.
    return <Navigate to="/login" replace />;
  }
  
  //doSignIn();

  return (
    <>
      <Card>
        <Group>
          <Image src="/ThisIsNotADrill_cutout.png" w={100} />          
          <Title order={3}><i>This Is Not A Drill!</i> &mdash; Dashboard Demo</Title>
        </Group>
        <Text style={{paddingTop:'20px', paddingBottom:'20px'}}>
          You can create and edit any notifications for the demo bank site from the dashboard.
          Click below to load the demo dashboard into this panel.
        </Text>
        <Button  size="lg" onClick={doSignIn}>{loginButtonTitle}</Button>
        <Text size="sm" style={{paddingTop:'20px', paddingBottom:'10px'}}>
          <i>Note: This will automatically log you into the dashboard as the shared demo user.  When you sign up for the service,
            you get access to the dashboard under your own account.</i>
        </Text>
      </Card>
    </>
  );
}


export default DemoDashboardComponent;
