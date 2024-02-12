import React, { useEffect, useState } from 'react';
import { Anchor, Button, Container, Image, rem, Space, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useUser, useOrganization, useOrganizationList, OrganizationList } from "@clerk/clerk-react";
import { useSettings } from './SettingsContext';
import classes from './css/IntroPages.module.css';

const  OnboardForm = () => {
  const demoProps = {
    mt: 'lg',
  };

  const { isLoaded } = useOrganization();
  const { createOrganization } = useOrganizationList();
  const { user } = useUser();
  const { saveSettingsWithPresets } = useSettings();
  const [ teamName, setTeamName ] = useState('');
  const [ teamExists, setTeamExists ] = useState();
  const [ permittedDomains, setPermittedDomains ] = useState('stackblitz.io\ncodesandbox.io\n');

  if (!isLoaded) {
    return null; // don't proceed unless we have clerk user record
  }

  if (teamExists) {
    // If a team exists, then we shouldn't be at this page, so just forward the user to the 
    // app home page.
    console.log('Team exists, forwarding to home page.');
  }

  console.log('teamExists:', teamExists);
  useEffect(() => {
    setTeamExists(user.organizationMemberships.length > 0);
    if (teamExists) {
      setTeamName(user.organizationMemberships[0].organization.name);
    }
  }, [teamExists, user.organizationMemberships]); 
    
  // this already exists in OrgAndTeamPanel, so refactor!
  const setTeamNameAtClerk = async () => {
    const name = teamName;
    let organization;
    if (teamExists) {
      // We will get a clerk webhook to create the corresponding org on our side and tie current user to it as a member.
      try {
        organization = user.organizationMemberships[0].organization;
        console.log(`updating team name to ${teamName}, org: ${organization}`);
        await organization.update({ name });
        return true;
      } catch (error) {
        console.log(`Unable to update a team, please try again later. (${error})`);
      }      
    } else {
      try {
        organization = await createOrganization({name});
        setTeamExists(true);
        return true;
      } catch (error) {
        console.log(`Unable to create a team, please try again later. (${error})`);
      }      
    }
    return false;
  };

  const saveConfigAndForward = async () => {
    // Set up a team at clerk.com.
    let updatedOrg = false;
    const setTeamOK = await setTeamNameAtClerk();
    if (setTeamOK) {
      const settingsObj = {
        timezone: 'America/Los_Angeles',
        permittedDomains: permittedDomains,
        refreshFrequency: 300,
      }
      console.log('saveSettingsWithPresets');
      updatedOrg = await saveSettingsWithPresets(settingsObj);
      if (updatedOrg) {
        // Forward to the playground
        //window.location = '/';
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveTeamName();
                  }
                }}
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
            onClick={saveConfigAndForward}
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
