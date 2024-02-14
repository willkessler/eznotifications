import React, { useEffect, useState } from 'react';
import { Anchor, Button, Container, Image, rem, Space, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useUser, useOrganization, useOrganizationList, OrganizationList } from "@clerk/clerk-react";
import { useSettings } from './SettingsContext';
import classes from './css/IntroPages.module.css';

const  OnboardForm = () => {
  const demoProps = {
    mt: 'lg',
  };

  const { createOrganization, setActive } = useOrganizationList();
  const { isSignedIn, user, isLoaded } = useUser();
  const { createLocalOrganization, saveSettings, permittedDomains, setPermittedDomains } = useSettings();
  const [ teamName, setTeamName ] = useState('My Team');
  const [ clerkOrganizationId, setClerkOrganizationId ] = useState(null);
  const [ saveButtonDisabled, setSaveButtonDisabled ] = useState(false);

  if (!isLoaded) {
    return null; // Don't proceed until we have clerk's user record
  }

  const createOurTeam = async() => {
    try {
      console.log('Hitting API to create local org.');
      // Our API is idempotent.
      // If an org on our side already exists with this clerk org id, it won't create it.
      await createLocalOrganization({
        name: teamName,
        clerkEmail: user.primaryEmailAddress.emailAddress, // primary email stored at  clerk of the owner of the new org.
        clerkUserId: user.id, // clerkId of the owner of the new org.
        clerkOrganizationId: clerkOrganizationId,
        timezone: 'America/Los_Angeles',
        permittedDomains: permittedDomains,
        refreshFrequency: 300,
      });
    } catch (error) {
      console.error(`Failed to create local organization with error: ${error}`);
    }

  }

  const createClerkTeam = async () => {
    try {
      // create starting clerk and local teams that the user can edit from the current form.
      console.log(`Trying to create clerk team with name ${teamName}`);
      const clerkOrganization = await createOrganization({name: teamName});
      console.log(`Got this organization data from clerk, name: ${clerkOrganization.name}, id:${clerkOrganization.id}`);
      console.log('Made clerk create call');
      if (clerkOrganization !== null) {
        setClerkOrganizationId(clerkOrganization.id);
        // We have to tell the front-end clerk session to make the new org active,
        // or else it doesn't think this user belongs to the new clerk org :(
        console.log(`Setting clerkOrg ${clerkOrganization.id} to active.`);
        const clerkResults = await setActive({ organization: clerkOrganization.id });
      }
    } catch (error) {
      console.log(`Unable to create clerk team for user ${user.id} with error ${error}`);
    }
  };

  // This effect is run only during component mount.
  // Do not do create a team/organization if this user already has a team association in clerk, just forward to home page
  useEffect(() => {
    console.log('useEffects/no depends starts.');
    if (isLoaded && isSignedIn) {
      if (user.organizationMemberships.length > 0) {
        // this user already has an org or belongs to an org so send them back to the home page
        window.location = '/';
      } else {
        // Create starter teams on component load if they don't exist yet
        console.log('useEffects, no depends: calling createClerkAndLocalTeams');
        createClerkTeam();
        createOurTeam();
      }
    } else {
      console.log('useEffects/no depends, doing nothing.');
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
    // Update the clerk org's name to whatever the user has entered in the form
    const setTeamOK = await setTeamNameAtClerk();
    if (setTeamOK) {
      // Update the remainder of the settings of our local org, and
      // then forward to the home page
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
