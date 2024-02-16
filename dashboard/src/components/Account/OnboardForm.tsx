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
          saveSettings, 
          permittedDomains, setPermittedDomains,
          organizationName, setOrganizationName } = useSettings();
  const [ clerkOrganizationId, setClerkOrganizationId ] = useState(null);
  const [ saveButtonDisabled, setSaveButtonDisabled ] = useState(false);
  const [ shouldRender, setShouldRender ] = useState(false);

  if (!isLoaded) {
    return null; // Don't proceed until we have clerk's user record
  }

  const createOurOrganization = async(clerkOrgId) => {
    // note that we must *pass in* clerkOrgId because setting its state in the calling function,
    // createClerkOrgThenLocalOrg, doesn't actually update the state variable soon enough before
    // this function executes, leading to a null value passed to the backend.
    const clerkCreatorId = user.id;
    if (!clerkCreatorId || !clerkOrgId ) {
      console.error(`Cannot create local organization, missing critical value, either one of clerkCreatorId:`
                    + `${clerkCreatorId} or clerkOrganizationId: ${clerkOrganizationId}`);
    } else {
      try {
        console.log(`Hitting API to create local org with orgName: ${organizationName}.`);
        // Our API is idempotent.
        // If an org on our side already exists with this clerk org id, it won't create it.
        await createLocalOrganization({
          organizationName: organizationName,
          clerkEmail: user.primaryEmailAddress.emailAddress, // primary email stored at  clerk of the owner of the new org.
          clerkCreatorId: user.id, // clerkId of the owner of the new org.
          clerkOrganizationId: clerkOrgId,
          timezone: 'America/Los_Angeles',
          permittedDomains: permittedDomains,
          refreshFrequency: 300,
        });
      } catch (error) {
        console.error(`Failed to create local organization with error: ${error}`);
      }
    }
  }

  // Set up clerk org, and set up everything on our side to mirror clerk as required.
  const setupClerkOrganizationAndMirrorRecords = async (gotoHomePageAfter) => {
    // Create a user record for this user if one does not exist on our side.
    let userId = user.id;
    let clerkOrganizationId = null;
    try {
      console.log(`Trying to create a local user.`);
      const localUser = await createLocalUser();
    } catch (error) {
      console.error('Error creating local user.');
    }

    if (user.organizationMemberships.length > 0) {
      // If the user is already part of a clerk org, then try to tie the local user to the matching local org.
      // This case happens when a user is invited to an existing org thorugh the app. (Idempotent.)
      clerkOrganizationId = user.organizationMemberships[0].organization.id;
      try {
        console.log(`Adding clerk user id ${userId} to our own org that matches clerk org id ${clerkOrganizationId}.`);
        const localOrganization = await addUserToOurOrg(clerkOrganizationId);
      } catch (error) {
        console.error(`Error attaching clerk user id: ${userId} to ` +
                      `clerk organization id: ${clerkOrganizationId}: ${error}`);
      }
    } else {
      // If the user doesn't belong to any organization yet, then
      // the overall client is just getting going, so we will need to create a clerk org first.
      try {
        console.log(`Trying to create clerk organization with name ${organizationName}`);
        const clerkOrganization = await createOrganization({name: organizationName});
        console.log('Made clerk create call');
        if (clerkOrganization !== null) {
          clerkOrganizationId = clerkOrganization.id;
        } else {
          throw new Error (`Unable to create clerk organization for user ${user.id} with error ${error}`);
        }
      } catch (error) {
        console.error(error);
      }
    }

    // If we have just created a clerk organization, create an org on our side (if required),
    // and attach our user record to it.
    if (clerkOrganizationId) {
      try {
        console.log(`Creating mirror org for clerk org id ${clerkOrganizationId}.`);
        const organizationRecord = await createOurOrganization(clerkOrganizationId);
      } catch (error) {
        console.error(`Error creating our mirror organization: ${error}`);
      }

      try {
        console.log(`Adding clerk user id: ${userId} to our new clerk org id: ${clerkOrganizationId}.`);
        await addUserToOurOrg(clerkOrganizationId);
      } catch (error) {
        console.error(`Error attaching a clerk user id: ${userId} to ` +
                      `clerk organization id: ${clerkOrganizationId}: ${error}`);
      }
      
      try {
        console.log(`Saving default settings into the new org with clerk org id: ${clerkOrganizationId}.`);
        const updatedOrg = await saveSettings(clerkOrganizationId);
      } catch (error) {
        console.error(`Error saving default settings for our mirror organization: ${error}`);
      }

      if (gotoHomePageAfter) {
        // This user already has an org or belongs to an org so send them back to the home page
        console.log('  Sending user to home page since already a member.');
        window.location = '/';
      }
        
    }
  };


  // this already exists in OrgAndTeamPanel, so refactor!
  const setOrganizationNameAtClerk = async () => {
    const name = organizationName;
    try {
      const organization = user.organizationMemberships[0].organization;
      console.log(`updating organization name to ${organizationName}, org: ${JSON.stringify(organization,null,2)}`);
      await organization.update({ name });
      setClerkOrganizationId(organization.id);
      return true;
    } catch (error) {
      console.log(`Unable to update a organization, please try again later. (${error})`);
    }
    return false;
  }

  const saveConfigAndForwardTheUser = async () => {
    // Set up an organization at clerk.com.
    let updatedOrg = false;
    // Update the clerk org's name to whatever the user has entered in the form
    const setOrganizationOK = await setOrganizationNameAtClerk();
    if (setOrganizationOK) {
      // Update the remainder of the settings of our local org, and
      // then forward to the home page
      console.log(`in saveConfigAndForwardTheUser: permittedDomains: ${permittedDomains}`);
      updatedOrg = await saveSettings(clerkOrganizationId);
      if (updatedOrg) {
        // Forward to the playground
        setSaveButtonDisabled(true);
        window.location = '/';
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
      const gotoHomePageAfter = (user.organizationMemberships.length > 0);
      setupClerkOrganizationAndMirrorRecords(gotoHomePageAfter);
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

  const handlePermittedDomainsChange = (e) => {
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
