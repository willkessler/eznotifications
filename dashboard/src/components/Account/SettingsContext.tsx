import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";

interface OrganizationDataProps {
    name: string,
    clerkEmail?: string,
    clerkUserId: string,
    clerkOrganizationId: string,
    timezone: string,
    permittedDomains: string,
    refreshFrequency: number,
}

const SettingsContext = createContext({
    name: 'My Team',
    timezone: 'America/Los_Angeles',
    refreshFrequency: 300, // 5 minutes, in seconds
    permittedDomains: 'stackblitz.io\ncodesandbox.io\n',
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
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
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                if (data === null) {
                    throw new Error (`API says no settings are available.`);
                }
                console.log('Fetched stored settings, now storing in context.');
                setTimezone(data.timezone);
                setPermittedDomains(data.permittedDomains);
                setRefreshFrequency(data.refreshFrequency);
            }
        } catch (error) {
            console.error(`Error getting app settings: ${error}`);
        }
        return null;
    };
        
    const saveSettings = async (clerkOrganizationId: string) => {
        const clerkId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/organization/configure`;
        console.log('in saveSettings, permittedDomains:', permittedDomains);
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerkId, clerkOrganizationId, timezone, permittedDomains, refreshFrequency }),
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

    const createLocalOrganization = async (organizationData: OrganizationDataProps) => {
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/organization/create`;
        console.log('in createTeam, calling API to attempt to create an org.');
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name:                organizationData.name,
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
                setTimezone(organizationData.timezone);
                setPermittedDomains(organizationData.permittedDomains);
                setRefreshFrequency(organizationData.refreshFrequency);
                console.log('Stored all settings.');
            }
        } catch (error) {
            console.error(`Error saving settings: ( ${error} ).`);
            throw error;
        }

    }

    return (
      <SettingsContext.Provider 
        value={{ 
            getSettings,
            saveSettings,
            createLocalOrganization,
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
