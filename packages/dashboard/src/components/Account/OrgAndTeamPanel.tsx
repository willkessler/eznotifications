import React, { useEffect, useState } from 'react';
import { Anchor, Button, Card, Text, TextInput } from '@mantine/core';
import ManageTeam from './ManageTeam';
import classes from './css/Settings.module.css';
import { useUser, useOrganization, useOrganizationList, OrganizationList } from "@clerk/clerk-react";
import { IconEdit, IconDeviceFloppy } from '@tabler/icons-react';

const TeamPanel = () => {
  const { createOrganization } = useOrganizationList();
  const { isLoaded } = useOrganization();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const [teamExists, setTeamExists] = useState(user?.organizationMemberships.length > 0);
  const [isAdmin, setIsAdmin] = useState(false);
  if (!isLoaded) {
    return null;
  }

  useEffect(() => {
    if (teamExists) {
      setIsAdmin(user.organizationMemberships[0].role === "org:admin");
      setTeamName(user.organizationMemberships[0].organization.name);
    }
  }, [teamExists, user.organizationMemberships]); 


  let organization;
  let initialName = 'Your Team Name';
  const [teamName, setTeamName] = useState(initialName);
  const [teamNameInputDisplay, setTeamNameInputDisplay] = useState(false);
  
  const setTeamNameAtClerk = async () => {
    const name = teamName;
    if (teamExists) {
      organization = user.organizationMemberships[0].organization;
      //console.log('updating team, org:', organization);
      await organization.update({ name });
    } else if (createOrganization !== undefined) {
      try {
        organization = await createOrganization({name});
        setTeamExists(true);
      } catch (error) {
        console.log('Unable to create a team, please try again later. (' + error + ')');
      }      
    }
  };

  const editOrSaveTeamName = async () => {
    if (teamNameInputDisplay) {
      setTeamNameInputDisplay(false);
      await setTeamNameAtClerk();
    } else {
      setTeamNameInputDisplay(true);
    }
  }
  
  const controlTitle = teamNameInputDisplay ? 'Save' : 'Edit';

  return (
    <div className={classes.team} >
      <Card>
        <Text size="xl">Your Team</Text>
        {!teamExists && (
          <>
            <Text size="sm">Edit (and save) your team name, below, and then you will be able to invite members to your team.</Text>
          </>
        )}

        {(isAdmin || !teamExists) && (
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

              <Anchor component="button" type="button" className={classes.teamNameInputControl} 
                      underline="hover" onClick={editOrSaveTeamName} size="md">
                {teamNameInputDisplay ? <IconDeviceFloppy size="18" /> : <IconEdit size="18" />}
              </Anchor>
            </div>
            {teamExists && (
              <ManageTeam />
            )}
          </>
        )}

      </Card>

        {!isAdmin && teamExists && (
          <>
            <Text className={classes.teamNameInputDisplay} style={{display: teamNameInputDisplay ? 'none' : 'block'}} size="md">
                {teamName}
              </Text>
            <Text size="xs" style={{marginTop:'20px', color:'#666', fontStyle:'italic'}}>
              Contact your team administrator for more information about your team.
            </Text>
          </>
        )}          

        {/*
        <div style={{borderTop:'1px solid #666', marginTop:'50px'}}>&nbsp;</div>
        <div style={{fontSize:'10px'}}><pre>{JSON.stringify(user, null, 2)}</pre></div>
         */}
      </div>
  );
}

export default TeamPanel;
