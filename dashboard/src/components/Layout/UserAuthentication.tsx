import React from 'react';
import { Anchor, Button, Code, Image, Stack } from '@mantine/core';
import classes from './css/MainLayout.module.css';
import { useUser, UserButton, SignOutButton, SignInButton, SignUpButton, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react" 

const UserAuthentication = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) {
    return null;
  }
 
  if (isSignedIn) {
    //console.log(user);
    let organizationName = 'Not set up yet';
    if (user.organizationMemberships &&
        user.organizationMemberships.length > 0 &&
        user.organizationMemberships[0].organization &&
        user.organizationMemberships[0].organization.name)
    {
      organizationName = user.organizationMemberships[0].organization.name;
    }

    return (
      <>
        <div style={{padding:'20px', fontSize:'0.75rem'}}>
          <div>Name: {user.fullName}!</div>
          <div>Email: {user.primaryEmailAddress.emailAddress}</div>
          <div style={{width:'140px'}}>Organization:<br />organizationName{}</div>
        </div>
      </>
    );
  }
}

export default UserAuthentication;
