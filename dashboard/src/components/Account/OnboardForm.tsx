import React, { useEffect, useState } from 'react';
import { Anchor, Button, Container, Image, rem, Space, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useUser, useOrganization, useOrganizationList, OrganizationList } from "@clerk/clerk-react";
import { useSettings } from './SettingsContext';
import classes from './css/IntroPages.module.css';

const  OnboardForm = () => {
  const demoProps = {
    mt: 'lg',
  };

  const { createOrganization } = useOrganizationList();
  const { isLoaded } = useOrganization();
  const { user } = useUser();
  const { createLocalOrganization, saveSettings } = useSettings();
  const [ teamName, setTeamName ] = useState('My Team');
  const [ teamExists, setTeamExists ] = useState(false);
  const [ initialTeamCreated, setInitialTeamCreated ] = useState(false);
  const [ permittedDomains, setPermittedDomains ] = useState('stackblitz.io\ncodesandbox.io\n');
  const [ clerkOrganizationId, setClerkOrganizationId ] = useState(null);
  const [ saveButtonDisabled, setSaveButtonDisabled ] = useState(false);

  if (!isLoaded) {
    return null; // don't proceed unless we have clerk user record
  }

  const createClerkAndLocalTeams = async () => {
    try {
      // create starting clerk and local teams that the user can edit from the current form.
      console.log(`Trying to create clerk team with name ${teamName}`);
      const clerkOrganization = await createOrganization({name: teamName});
      console.log(`Got this organization data from clerk, name: ${clerkOrganization.name}, id:${clerkOrganization.id}`);
      console.log('Made clerk create call');
      if (clerkOrganization !== null) {
        setTeamExists(true);
        // now create the mirror org on our side
        try {
          createLocalOrganization({
            name: teamName,
            clerkOrganizationId: clerkOrganization.id,
            timezone: 'America/Los_Angeles',
            permittedDomains: permittedDomains,
            refreshFrequency: 300,
          });
          console.log('Setting initialTeamCreated to true.');
          setInitialTeamCreated(true);
        } catch (error) {
          console.error(`Failed to create local organization with error: ${error}`);
        }
      }
    } catch (error) {
      console.log(`Unable to create clerk team for user ${user.id} with error ${error}`);
    }
  };

  useEffect(() => {
    console.log(`useEffect depending on teamExists, user:${JSON.stringify(user.organizationMemberships,null,2)}`);
    setTeamExists(user.organizationMemberships.length > 0);
    if (!initialTeamCreated && teamExists) {
      console.log('in useEffect no deps, sending to home page because we didn\'t create a team, and we found a pre-existing team.');
      window.location = '/';
    } else {
      console.log('useEffect depending on teamExists does nothing, initialTeamCreated:', initialTeamCreated);
    }
  }, [initialTeamCreated, teamExists, user.organizationMemberships]);

  // This effect is run only during component mount.
  // Do not do create a team/organization if this user already has a team association in clerk.
  useEffect(() => {
    console.log('useEffects, no depends');
    if (!initialTeamCreated) { 
      // Create teams on component load if not yet done
      console.log('useEffects, no depends: calling createClerkAndLocalTeams');
      createClerkAndLocalTeams(); 
    } else {
      console.log('useEffects, no depends, setting teamExists to true.');
      setTeamExists(true);
    }
  }, []);


  // this already exists in OrgAndTeamPanel, so refactor!
  const setTeamNameAtClerk = async () => {
    const name = teamName;
    try {
      const organization = user.organizationMemberships[0].organization;
      console.log(`updating team name to ${teamName}, org: ${organization}`);
      await organization.update({ name });
      setClerkOrganizationId(organization.id);
      return true;
    } catch (error) {
      console.log(`Unable to update a team, please try again later. (${error})`);
    }      
    return false;
  }

  const saveConfigAndForwardTheUser = async () => {
    // Set up a team at clerk.com.
    let updatedOrg = false;
    const setTeamOK = await setTeamNameAtClerk();
    if (setTeamOK) {
      updatedOrg = await saveSettings(clerkOrganizationId);
      if (updatedOrg) {
        // Forward to the playground
        setSaveButtonDisabled(true);
        window.location = '/';
      }
    }
  }

  const handlePermittedDomainsChange = (e) => {
    setPermittedDomains(e.value);
  }

  return (
    <>
      <Container {...demoProps}>
        <Title order={3}>Getting started is easy!</Title>
        <Space h="md" />
        <Stack 
          align="flex-start"
          bg="var(--mantine-color-body)"
        >
          <Text>1. Enter your team name:</Text>
            <div >
              <TextInput 
                description="You'll need a team to add colleagues to the service. (OK to leave this as-is for now, if you prefer.)"
                w="600"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required={true}
              />
            </div>

          <Space h="sm" />
          <Text>2. Enter any approved domains where you'll display your notifications.</Text>

          <Textarea 
            style={{maxWidth:'620px'}}
            title="foo"
            description="We have included the playground site's domain (Stackblitz), so you can test out things out quickly. Feel free to add your domains as well."
            size="sm"
            w="800"
            minRows={5}
            autosize
            value={permittedDomains}
            onChange={(e) => { handlePermittedDomainsChange(e) }}
          />
          <Space h="sm" />

          <Text>3. Head on over to the playground to try things out!</Text>
          <Button
            onClick={saveConfigAndForwardTheUser}
            disabled={saveButtonDisabled}
          >
            Save / Go to Playground!
          </Button>
          <Text size="xs" style={{fontStyle:'italic'}}>Note, we've created a test notification for you already so you can test things immediately.</Text>
        </Stack>       
      </Container>
    </>
  );
}

export default OnboardForm;
