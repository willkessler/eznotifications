import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text, TextInput } from '@mantine/core';
import ManageTeam from './ManageTeam';
import classes from './Settings.module.css';
import { useUser, useOrganization, CreateOrganization, OrganizationProfile, OrganizationList } from "@clerk/clerk-react";

const TeamPanel = () => {
  const { 
    organization,
    organization:currentOrganization, 
    membership, 
    isLoaded
  } = useOrganization();
  const { user } = useUser();

  if (!isLoaded) {
    return null;
  }
  
  if (!currentOrganization) {
/*
    return (
      <>
        <div style={{borderTop:'1px solid #666', marginTop:'50px'}}>&nbsp;</div>
        <div style={{fontSize:'10px'}}><pre>{JSON.stringify(user, null, 2)}</pre></div>
      </>
    );
*/
    console.log('no org');
    return (
        <>
          <div className={classes.firstTimeTeamSetup}>
            <Text>In order to invite additional team members, first you must create a team.</Text>
            <Button>Create your team</Button>
          </div>
        </>
    );
  }

  const isAdmin = (membership.role === "org:admin");
  const teamExists = (user.organizationMemberships.length > 0);
  let initialName = '';
  if (teamExists) {
    initialName = user.organizationMemberships[0].organization.name;
  }
  const [teamName, setTeamName] = useState(initialName);
  const [teamNameInputDisplay, setTeamNameInputDisplay] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('Edit');
  
  const setTeamNameAtClerk = async () => {
    const name = teamName;
    console.log('Saving org name:', name);
    await organization.update({ name });
  };

  const editOrSaveTeamName = async () => {
    if (teamNameInputDisplay) {
      setTeamNameInputDisplay(false);
      setButtonTitle('Edit');
      await setTeamNameAtClerk();
    } else {
      setTeamNameInputDisplay(true);    
      setButtonTitle('Save');
    }
  }
  
  const controlTitle = teamNameInputDisplay ? 'Save' : 'Edit';

  return (
      <div className={classes.team} >
          <Text size="xl">Your Team</Text>

        {teamExists && isAdmin && (
          <>
            <div className={classes.teamNameBlock} >
              <TextInput style={{ display: teamNameInputDisplay ? 'block' : 'none' }} 
                         className={classes.teamNameInput} value={teamName}
                         placeholder='Enter your team name' 
                         onChange={(e) => setTeamName(e.target.value)}
                         onKeyPress={(e) => {
                           if (e.key === 'Enter') {
                             editOrSaveTeamName();
                           }
                         }}
              />
              <Text className={classes.teamNameInputDisplay} style={{display: teamNameInputDisplay ? 'none' : 'block'}} size="md">
                {teamName}
              </Text>

              <Anchor underline="hover" onClick={editOrSaveTeamName} size="md" style={{marginLeft:'10px'}}>{buttonTitle}</Anchor>
            </div>

            <ManageTeam />
          </>
        )}

        {teamExists && !isAdmin && (
          <>
            <Text className={classes.teamNameInputDisplay} style={{display: teamNameInputDisplay ? 'none' : 'block'}} size="md">
                {teamName}
              </Text>
            <Text size="xs" style={{marginTop:'20px', color:'#666', fontStyle:'italic'}}>
              Contact your team administrator for more information about your team.
            </Text>
          </>
        )}          

        <div style={{borderTop:'1px solid #666', marginTop:'50px'}}>&nbsp;</div>
        <div style={{fontSize:'10px'}}><pre>{JSON.stringify(user, null, 2)}</pre></div>
      </div>
  );
}

export default TeamPanel;
