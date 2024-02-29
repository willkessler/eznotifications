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
  const { createLocalUser, createLocalOrganization, addUserToOurOrg,
          setupClerkOrganizationAndMirrorRecords, saveSettings, 
          permittedDomains, setPermittedDomains,
          organizationName, setOrganizationName } = useSettings();
  const [ clerkOrganizationId, setClerkOrganizationId ] = useState('');
  const [ saveButtonDisabled, setSaveButtonDisabled ] = useState(false);
  const [ shouldRender, setShouldRender ] = useState(false);

  if (!isLoaded) {
    return null; // Don't proceed until we have clerk's user record
  }

  // this already exists in OrgAndTeamPanel, so refactor!
  const setOrganizationNameAtClerk = async () => {
    const name = organizationName;
    try {
      const organization = user?.organizationMemberships[0].organization;
      console.log(`updating organization name to ${organizationName}, org: ${JSON.stringify(organization,null,2)}`);
      await organization?.update({ name });
      setClerkOrganizationId(organization?.id ?? '');
      return true;
    } catch (error) {
      console.log(`Unable to update a organization, please try again later. (${error})`);
    }
    return false;
  }

  const saveOrgSettingsAndForwardTheUser = async () => {
    // Set up an organization at clerk.com.
    let updatedOrg = false;
    // Update the clerk org's name to whatever the user has entered in the form
    const setOrganizationOK = await setOrganizationNameAtClerk();
    if (setOrganizationOK) {
      // Update the remainder of the settings of our local org, and
      // then forward to the home page
      console.log(`in saveOrgSettingsAndForwardTheUser: permittedDomains: ${permittedDomains}`);
      updatedOrg = await saveSettings(clerkOrganizationId);
      if (updatedOrg) {
        // Forward to the playground
        setSaveButtonDisabled(true);
        window.location.assign('/');
      }
    }
  }

  // This effect is run only during component mount.
  // Do not do create a organization if this user already has a organization association in clerk, just forward to home page
  useEffect(() => {
    console.log('useEffects/no depends starts.');
    console.log(`  permittedDomains: ${permittedDomains}`);
    if (isLoaded && isSignedIn) {
      // Create starter organizations on component load if they don't exist yet
      console.log('useEffects, no depends: setting up all required entities.');
      const gotoHomePageAfterFn = () => {
        if (user.organizationMemberships.length > 0) {
          // This user already has an org or belongs to an org so send them back to the home page
          console.log('  Sending user to home page since already a member.');
          window.location.assign('/');
        }
      };

      setupClerkOrganizationAndMirrorRecords(gotoHomePageAfterFn);
      setShouldRender(true);
    } else {
      console.log('useEffects/no depends, clerk not ready so doing nothing.');
    }
  }, []);

  if (!shouldRender) {
    return (
      <>
        Loading...
      </>
    )
  }

  const handlePermittedDomainsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPermittedDomains = e.target.value;
    console.log(`handlePermittedDomainsChange, Updating permittedDomains to ${permittedDomains}`);
    setPermittedDomains(newPermittedDomains);
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
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
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
            onClick={saveOrgSettingsAndForwardTheUser}
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
