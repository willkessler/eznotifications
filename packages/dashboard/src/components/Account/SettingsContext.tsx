import React, { createContext, useContext, useState } from 'react';
import { useUser, useOrganization, useOrganizationList } from "@clerk/clerk-react";
import { useConfig } from '../../lib/ConfigContext';
import type { OrganizationDataProps, CallbackOutcomes, SettingsContextType } from  '../../lib/shared_dts/SettingsContext';

const SettingsContext = createContext<SettingsContextType>({
    isSetupComplete: false,
    setIsSetupComplete: (setupComplete: boolean) => {},
    organizationName: 'My Team',
    timezone: 'America/Los_Angeles',
    setTimezone: (timezone: string) => {},
    refreshFrequency: 300, // 5 minutes, in seconds
    permittedDomains: 'stackblitz.io\ncodesandbox.io\n',
    getSettings: async () => Promise.resolve(null),
    saveSettings: async (clerkOrganizationId: string) => Promise.resolve(true),
    setPermittedDomains: (domains:string) => {},
    setRefreshFrequency: (frequency:number) => {},
    createLocalUser: async (clerkUserId: string) => Promise.resolve(true),
    createLocalOrganization: async (organizationData: OrganizationDataProps) => Promise.resolve(true),
    addUserToOurOrg: async (clerkOrganizationId: string) => Promise.resolve(true),
    setupClerkOrganizationAndMirrorRecords: async (callbackFn: (outcomes: CallbackOutcomes) => void) => Promise.resolve(true),
    setOrganizationName: (name: string) => {}, 
    createdLocalUser: false,
    setCreatedLocalUser: (createdLocalUser: boolean) => {},
    createdLocalOrg: false,
    setCreatedLocalOrg: (createdLocalOrg: boolean) => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const { apiBaseUrl, getBearerHeader } = useConfig();
    const { user } = useUser();
    const { createOrganization, setActive } = useOrganizationList();
    const [ organizationName, setOrganizationName ] = useState('My Team');
    const [ timezone, setTimezone ] = useState('America/Los_Angeles');
    const [ permittedDomains, setPermittedDomains ] = useState('stackblitz.io\ncodesandbox.io\n');
    const [ refreshFrequency, setRefreshFrequency ] = useState(300); // seconds
    const [ isSetupComplete, setIsSetupComplete ] = useState(false);
    const [ createdLocalUser, setCreatedLocalUser ] = useState(false);
    const [ createdLocalOrg, setCreatedLocalOrg ] = useState(false);

    // If we create a user account but we DON'T create an org, this is a teammate.
    // In that case, we tell the tutorial to do something a bit different.
    let userRecordCreated = false;    

    const getSettings = async (): Promise<OrganizationDataProps | null> => {
        if (user) {
            const clerkId = user.id;
            const apiUrl = `${apiBaseUrl}/organization/configure?clerkId=${clerkId}`;
            try {
                const response = await fetch(apiUrl, {
                    method:'GET',
                    credentials: 'include',
                    headers: await getBearerHeader(),
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('Organization settings not found.');
                    } else {
                        throw new Error (`HTTP error! status: ${response.status}`);
                    }
                } else {
                    const data = await response.json();
                    console.log('Fetched stored settings, now storing in context.');
                    const orgProps = data as OrganizationDataProps;
                    setTimezone(orgProps.timezone);
                    setPermittedDomains(orgProps.permittedDomains);
                    setRefreshFrequency(orgProps.refreshFrequency);
                    return orgProps;
                }
            } catch (error) {
                console.error(`Error getting org settings: ${error}`);
            }
        }
        return null;
    };
        
    const saveSettings = async (clerkOrganizationId: string, userDriven?: boolean) => {
        if (user) {
            const clerkCreatorId = user.id;
            const apiUrl = `${apiBaseUrl}/organization/configure`;
            console.log('in saveSettings, permittedDomains:', permittedDomains);
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
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
        }
        return false;
    }

    const createLocalUser = async (clerkUserId: string): Promise<boolean> => {
        const apiUrl = `${apiBaseUrl}/user/create`;
        if (user) {
            const primaryEmail = user.primaryEmailAddress?.emailAddress;
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
                    credentials: 'include',
                    headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify(userObject)
                });
                if (!response.ok) {
                    throw new Error (`HTTP error! status: ${response.status}`);
                } else {
                    const userData = await response.json();
                    console.log(`Created new user: ${JSON.stringify(userData,null,2)}`);
                    setCreatedLocalUser(true);
                    return true;
                }
            } catch (error) {
                console.log(`Error creating local user: ( ${error} ).`);
            }
        }
        return false;
    }

    const createLocalOrganization = async (organizationData: OrganizationDataProps): Promise<boolean> => {
        const apiUrl = `${apiBaseUrl}/organization/create`;
        console.log('in createLocalOrganization, calling API to attempt to create an org.');
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
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
                response.json().then(body => {
                    // Now `body` contains the parsed JSON body of the response
                    if ((response.status === 404) && 
                        body.message && body.message.startsWith('We already have an existing organization')) {
                        console.log('createLocalOrganization: We already created an org.');
                    } else {
                        // If the condition is not met, throw an error with the status
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }).catch(error => {
                    // Handle any errors that occur during the parsing of the response body or in your condition logic
                    console.error('Error processing response:', error);
                });
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                setOrganizationName(organizationData.organizationName);
                setTimezone(organizationData.timezone);
                setPermittedDomains(organizationData.permittedDomains);
                setRefreshFrequency(organizationData.refreshFrequency);
                // Tell the Notifications.tsx file that this is the first time an account admin has signed in
                // so we should give them the option of seeing the tutorial.
                setCreatedLocalOrg(true);
                console.log('Stored all settings.');
                return true;
            }
        } catch (error) {
            console.error(`Error creating local org: ( ${error} ).`);
        }
        return false;
    }

    const addUserToOurOrg = async(clerkOrganizationId: string): Promise<boolean> => {
        if (user) {
            const clerkUserId = user.id;
            console.log('in addUserToOurOrg, calling API to attach current user to the correct org.');
            const apiUrl = `${apiBaseUrl}/user/attach-to-organization`;
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ 
                        clerkUserId:         clerkUserId,
                        clerkOrganizationId: clerkOrganizationId,
                    })
                });
                if (!response.ok) {
                    throw new Error (`HTTP error! status: ${response.status}`);
                } else {
                    console.log(`Locally attached clerk user ${clerkUserId} to clerk org ${clerkOrganizationId}.`);
                    return true;
                }
            } catch (error) {
                console.log(`Error attaching clerk user ${clerkUserId} to clerk org ${clerkOrganizationId}.`);
                return false;
            }
        }
        return false;
    }

    const createOurOrganization = async(clerkOrgId : string): Promise<boolean> => {
        // note that we must *pass in* clerkOrgId because setting its state in the calling function,
        // createClerkOrgThenLocalOrg, doesn't actually update the state variable soon enough before
        // this function executes, leading to a null value passed to the backend.
        if (user) {
            const clerkCreatorId = user.id;
            if (!clerkCreatorId || !clerkOrgId ) {
                console.error(`Cannot create local organization, missing critical value, either one of clerkCreatorId:`
                    + `${clerkCreatorId} or clerkOrganizationId: ${clerkOrgId}`);
            } else {
                try {
                    console.log(`Hitting API to create local org with orgName: ${organizationName}.`);
                    // Our API is idempotent.
                    // If an org on our side already exists with this clerk org id, it won't create it.
                    await createLocalOrganization({
                        organizationName: organizationName,
                        // Primary email stored at clerk of the owner of the new org.
                        clerkEmail: user.primaryEmailAddress?.emailAddress,
                        clerkCreatorId: user.id, // clerkId of the owner of the new org.
                        clerkOrganizationId: clerkOrgId,
                        timezone: 'America/Los_Angeles',
                        permittedDomains: permittedDomains,
                        refreshFrequency: 300,
                    });
                    return true;
                } catch (error) {
                    console.error(`Failed to create local organization with error: ${error}`);
                }
            }
        }
        return false;
    }

    // Set up clerk org, and set up everything on our side to mirror clerk as required.
    const setupClerkOrganizationAndMirrorRecords = 
        async (callbackFn: (outcomes: CallbackOutcomes) => void): Promise<boolean> => {
            // Create a user record for this user if one does not exist on our side.
            if (!user) {
                return false;
            }
            let clerkUserId = user.id;
            let clerkOrganizationId = null;
            let outcomes = {
                createdClerkOrg: false,
                createdMirrorOrg: false,
                attachedLocalUser: false,
                savedSettings: false,
            };

            if (isSetupComplete) {
                return false;
            }
            
            try {
                console.log(`Trying to create a local user.`);
                const localUser = await createLocalUser(clerkUserId);
            } catch (error) {
                console.error(`Unable to create local  user for clerkUserId: ${clerkUserId}, with error ${error}`);
            }

            // If the user doesn't belong to any organization yet, then
            // the overall client is just getting going, so :
            // Try to create an organization at clerk first.
            if (user.organizationMemberships.length > 0) {
                // If the user is already part of a clerk org, just use that org id and try to create a local org with it.
                // This case happens when a user is invited to an existing org thorugh the app. (Idempotent.)
                clerkOrganizationId = user.organizationMemberships[0].organization.id;
            } else {
                if (createOrganization !== undefined) {
                    try {
                        console.log(`Trying to create clerk organization with name ${organizationName}`);
                        const clerkOrganization = await createOrganization({name: organizationName});
                        clerkOrganizationId = clerkOrganization.id;
                        console.log(`Made clerk create call, new clerk organization id: ${clerkOrganization}`);
                        if (clerkOrganization) {
                            outcomes.createdClerkOrg = true;
                        }
                    } catch(error) {
                        console.error(`Unable to create clerk organization for user ${user.id} with error ${error}`);
                    }
                }
            }
            
            if (clerkOrganizationId) {
                // Try to create a local organization to mirror any already existing or new clerk organization.
                try {
                    console.log(`Creating a mirror org for clerk org id ${clerkOrganizationId}.`);
                    outcomes.createdMirrorOrg = await createOurOrganization(clerkOrganizationId);
                } catch (error) {
                    console.error(`Error creating our mirror organization: ${error}`);
                }

                // Try to attach the user to the (possibly new) local organization.
                try {
                    console.log(`Attaching clerk user id ${clerkUserId} to our own org that matches clerk org id ${clerkOrganizationId}.`);
                    const localOrganization = await addUserToOurOrg(clerkOrganizationId);
                    if (localOrganization) {
                        outcomes.attachedLocalUser = true;
                    }
                } catch (error) {
                    console.error(`Error attaching clerk user id: ${clerkUserId} to ` +
                        `clerk organization id: ${clerkOrganizationId}: ${error}`);
                }
                
                // Try to save settings only for a new organization.
                if (outcomes.createdMirrorOrg) {
                    try {
                        console.log('Fetching settings if they exist from a previous session.')
                        const orgProps = await getSettings();
                        // only save the default permitted domains if there are none stored.
                        if (orgProps && orgProps.permittedDomains && orgProps.permittedDomains.length === 0) { 
                            console.log(`Saving default settings into the new org with clerk org id: ${clerkOrganizationId}.`);
                            const updatedOrg = await saveSettings(clerkOrganizationId);
                            outcomes.savedSettings = true;
                        }
                    } catch (error) {
                        console.error(`Error saving default settings for our mirror organization: ${error}`);
                    }
                }
            }

            if (callbackFn) {
                callbackFn(outcomes);
            }

            // If we get here, everything that we did was successful.
            return (true);
    };



    return (
      <SettingsContext.Provider 
        value={{ 
            isSetupComplete,
            setIsSetupComplete,
            createdLocalUser,
            setCreatedLocalUser,
            createdLocalOrg,
            setCreatedLocalOrg,
            getSettings,
            saveSettings,
            createLocalUser,
            createLocalOrganization,
            addUserToOurOrg,
            setupClerkOrganizationAndMirrorRecords,
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
