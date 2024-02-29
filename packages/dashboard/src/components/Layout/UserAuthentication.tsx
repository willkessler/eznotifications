import React, {useState, useEffect} from 'react';
import { Anchor, Button, Code, Image, Stack } from '@mantine/core';
import classes from './css/MainLayout.module.css';
import { useUser, useOrganization, useOrganizationList,
         UserButton, SignOutButton, 
         SignInButton, SignUpButton, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react" 

const UserAuthentication = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const [ activeOrg, setActiveOrg ] = useState('');
  const { setActive } = useOrganizationList();

  if (!isLoaded) {
    return null;
  }
     
  const setClerkActiveOrg = async () => {
    if (user && user.organizationMemberships && user.organizationMemberships.length > 0 &&
        user.organizationMemberships[0].organization && setActive) {
      const theOrgId = user.organizationMemberships[0].organization.id;
      console.log('*** Calling setActive ***');
      const results = await setActive({ organization: theOrgId });
      setActiveOrg(theOrgId);
      // organization.inviteMember({ emailAddress: 'willkessler+testwtfegh@gmail.com', role: 'org:member' });
    }
  };

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      setClerkActiveOrg();
    }
  }, [activeOrg]);
      
  if (isSignedIn && isLoaded) {
    //console.log(organization);
    //console.log(`clerk thinks organization = ${JSON.stringify(organization,null,2)}`);

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
          <div>Email: {user.primaryEmailAddress?.emailAddress}</div>
          <div style={{width:'140px'}}>Organization:<br />{organizationName} ({activeOrg})</div>
        </div>
      </>
    );
  }
}

export default UserAuthentication;
