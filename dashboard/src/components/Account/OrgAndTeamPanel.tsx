import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import ManageTeam from './ManageTeam';
import classes from './Settings.module.css';
import { useUser, useOrganization, CreateOrganization, OrganizationProfile, OrganizationList } from "@clerk/clerk-react";

const TeamPanel = () => {
  const { 
    organization:currentOrganization, 
    membership, 
    isLoaded } = useOrganization();
  const { user } = useUser();

  if (!isLoaded || !currentOrganization) {
    return null;
  }

  const isAdmin = (membership.role === "org:admin");

  const teamExists = (user.organizationMemberships.length > 0);
  
  return (
      <div className={classes.team} >
        <Text size="xl">Your Team</Text>
        {!teamExists && (
          <div>You have not yet set up a team. Set up an team in order to invite team members.</div>
        )}

        {teamExists && isAdmin && (
          <>
            <Text size="md">{user.organizationMemberships[0].organization.name}</Text>
            <ManageTeam />
          </>
        )}

        <div style={{borderTop:'1px solid #666', marginTop:'50px'}}>&nbsp;</div>
        <div style={{fontSize:'10px'}}><pre>{JSON.stringify(user, null, 2)}</pre></div>
      </div>
  );
}

export default TeamPanel;
