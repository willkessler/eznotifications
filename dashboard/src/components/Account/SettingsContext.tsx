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

    return (
      <SettingsContext.Provider 
        value={{ 
            getSettings,
            saveSettings,
            createLocalUser,
            createLocalOrganization,
            addUserToOurOrg,
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
