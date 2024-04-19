import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, SignIn } from "@clerk/clerk-react";
import AuthLayout from './AuthLayout';

const DemoLoginComponent = () => {
  const { isSignedIn } = useUser();
  const redirectUrl = (import.meta.env.VITE_IS_DEMO_SITE === 'true' ? import.meta.env.VITE_TINAD_DEMOPANEL_URL + '/demo' : '/');

  useEffect(() => {
    if (import.meta.env.VITE_IS_DEMO_SITE === 'true') {
      const styleLink = document.createElement('style');
      styleLink.type = 'text/css';
      styleLink.innerHTML = '.cl-footerActionLink, .cl-footerActionText { display: none; }';
      document.head.appendChild(styleLink);
    }
  }, []);

  // Redirect authenticated users back to the dashboard if they somehow navigated to login,
  // unless running on the demo site, in which case, redirect to the demo site.
  if (isSignedIn) {
    if (import.meta.env.VITE_IS_DEMO_SITE === 'true') {
      // on the demo site, if you land at the login page and you're already logged in, then go to the demo app
      const demoPanelsUrl = import.meta.env.VITE_TINAD_DEMOPANEL_URL + '/demo';
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
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#E66118",
              colorTextOnPrimaryBackground: "white",
              colorText: "white",
              colorBackground: "#E66118",
            }
          }}
          redirectUrl={redirectUrl}
          initialValues={{ emailAddress: 'demo@this-is-not-a-drill.com' }}
        />
      </AuthLayout>
    </>
  );
}


export default DemoLoginComponent;
