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
    console.log(user);
    return (
      <>
        <div>Hello, {user.fullName} {user.primaryEmailAddress.emailAddress}</div>
      </>
    );
  }
}

export default UserAuthentication;
