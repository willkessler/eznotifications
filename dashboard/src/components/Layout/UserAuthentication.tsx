import React from 'react';
import { Anchor, Button, Code, Image, Stack } from '@mantine/core';
import classes from './MainLayout.module.css';
import { useUser, UserButton, SignOutButton, SignInButton, SignUpButton, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react" 

const UserAuthentication = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) {
    return null;
  }
 
  if (isSignedIn) {
    //console.log(user);
    return (
      <>
        <div style={{padding:'20px', fontSize:'0.75rem'}}>
          <div>Name: {user.fullName}!</div>
          <div>Email: {user.primaryEmailAddress.emailAddress}</div>
          <div>Org: {user.organization}</div>
        </div>
      </>
    );
  }
}

export default UserAuthentication;
