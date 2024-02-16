import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";

interface OrganizationDataProps {
    organizationName: string,
    clerkEmail?: string,
    clerkUserId: string,
    clerkOrganizationId: string,
    timezone: string,
    permittedDomains: string,
    refreshFrequency: number,
}

const SettingsContext = createContext({
    organizationName: 'My Team',
    timezone: 'America/Los_Angeles',
    refreshFrequency: 300, // 5 minutes, in seconds
    permittedDomains: 'stackblitz.io\ncodesandbox.io\n',
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [ organizationName, setOrganizationName ] = useState('My Team');
    const [ timezone, setTimezone ] = useState('America/Los_Angeles');
    const [ permittedDomains, setPermittedDomains ] = useState('stackblitz.io\ncodesandbox.io\n');
    const [ refreshFrequency, setRefreshFrequency ] = useState(300); // seconds
    const [ isSetupComplete, setIsSetupComplete ] = useState(false);
    const { user } = useUser();

    const getSettings = async () => {
        const clerkId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/organization/configure?clerkId=${clerkId}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Organization settings not found.');
                } else {
                    throw new Error (`HTTP error! status: ${response.status}`);
                }
            } else {
                const data = await response.json();
                console.log('Fetched stored settings, now storing in context.');
                setTimezone(data.timezone);
                setPermittedDomains(data.permittedDomains);
                setRefreshFrequency(data.refreshFrequency);
            }
        } catch (error) {
            console.error(`Error getting org settings: ${error}`);
        }
        return null;
    };
        
    const saveSettings = async (clerkOrganizationId: string) => {
        const clerkCreatorId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/organization/configure`;
        console.log('in saveSettings, permittedDomains:', permittedDomains);
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationName: organizationName,
                    clerkCreatorId: clerkCreatorId,
                    clerkOrganizationId: clerkOrganizationId,
                    timezone: timezone,
                    permittedDomains: permittedDomains,
                    refreshFrequency: refreshFrequency,
                })
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                console.log('Stored all settings.');
                return true;
            }
        } catch (error) {
            console.error(`Error saving settings: ( ${error} ).`);
            throw error;
        }
        return false;
    }

    const createLocalUser = async () => {
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/user/create`;
        const clerkUserId = user.id;
        const primaryEmail = user.primaryEmailAddress.emailAddress;
        console.log(`In createLocalUser: calling API to to create local user for clerk user id: ` +
            `${clerkUserId} with email ${primaryEmail}.`);
        try {
            const userObject = { 
                clerkUserId : clerkUserId,
                primaryEmail : primaryEmail
            };
            console.log(`Send this to backend: ${JSON.stringify(userObject,null,2)}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userObject)
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                const userData = await response.json();
                console.log(`Created new user: ${JSON.stringify(userData,null,2)}`);
                return userData;
            }
        } catch (error) {
            console.error(`Error creating local user: ( ${error} ).`);
            throw error;
        }

    }

    const createLocalOrganization = async (organizationData: OrganizationDataProps) => {
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/organization/create`;
        console.log('in createLocalOrganization, calling API to attempt to create an org.');
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    organizationName:    organizationData.organizationName,
                    clerkCreatorId:      organizationData.clerkCreatorId,
                    clerkOrganizationId: organizationData.clerkOrganizationId,
                    clerkEmail:          organizationData.clerkEmail,
                    timezone:            organizationData.timezone, 
                    permittedDomains:    organizationData.permittedDomains, 
                    refreshFrequency:    organizationData.refreshFrequency }),
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                setOrganizationName(organizationData.organizationName);
                setTimezone(organizationData.timezone);
                setPermittedDomains(organizationData.permittedDomains);
                setRefreshFrequency(organizationData.refreshFrequency);
                console.log('Stored all settings.');
            }
        } catch (error) {
            console.error(`Error creating local org: ( ${error} ).`);
            throw error;
        }
    }

    const addUserToOurOrg = async(clerkOrganizationId: string) => {
        const clerkUserId = user.id;
        console.log('in addUserToOurOrg, calling API to attach current user to the correct org.');
        const apiUrl = `${window.location.protocol}//${window.location.hostname}` +
            `/api/eznotifications/user/attach-to-organization`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    clerkUserId:         clerkUserId,
                    clerkOrganizationId: clerkOrganizationId,
                })
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                console.log(`Locally attached clerk user ${clerkUserId} to clerk org ${clerkOrganizationId}.`);
            }
        } catch (error) {
            console.error(`Error attaching clerk user ${clerkUserId} to clerk org ${clerkOrganizationId}.`);
            throw error;
        }
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
    const setupClerkOrganizationAndMirrorRecords = async (callbackFn) => {
        // Create a user record for this user if one does not exist on our side.
        let userId = user.id;
        let clerkOrganizationId = null;
        let outcomes = {};

        if (isSetupComplete) {
            return;
        }
        
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
                outcomes.createdLocalUser = true;
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
                outcomes.createdLocalOrg = true;
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
                outcomes.createdMirrorOrg = true;
            } catch (error) {
                console.error(`Error creating our mirror organization: ${error}`);
            }

            try {
                console.log(`Adding clerk user id: ${userId} to our new clerk org id: ${clerkOrganizationId}.`);
                await addUserToOurOrg(clerkOrganizationId);
                outcomes.addedUserOrganization = true;
            } catch (error) {
                console.error(`Error attaching a clerk user id: ${userId} to ` +
                    `clerk organization id: ${clerkOrganizationId}: ${error}`);
            }
            
            try {
                console.log(`Saving default settings into the new org with clerk org id: ${clerkOrganizationId}.`);
                const updatedOrg = await saveSettings(clerkOrganizationId);
                outcomes.savedSettings = true;
            } catch (error) {
                console.error(`Error saving default settings for our mirror organization: ${error}`);
            }

            if (callbackFn) {
                callbackFn(outcomes);
            }
        }

    };

    return (
      <SettingsContext.Provider 
        value={{ 
            getSettings,
            saveSettings,
            createLocalUser,
            createLocalOrganization,
            addUserToOurOrg,
            setupClerkOrganizationAndMirrorRecords,
            isSetupComplete,
            setIsSetupComplete,
            organizationName,
            setOrganizationName,
            timezone,
            setTimezone,
            permittedDomains,
            setPermittedDomains,
            refreshFrequency,
            setRefreshFrequency,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
