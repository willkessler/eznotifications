import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";

interface OrganizationDataProps {
    name: string,
    clerkId: string,
    clerkOrganizationId: string,
    timezone: string,
    permittedDomains: string,
    refreshFrequency: number,
}

const SettingsContext = createContext({
    name: 'My Team',
    timezone: 'America/Los_Angeles',
    refreshFrequency: 300, // 5 minutes, in seconds
    permittedDomains: '',
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [ timezone, setTimezone ] = useState('America/Los_Angeles');
    const [ permittedDomains, setPermittedDomains ] = useState('');
    const [ refreshFrequency, setRefreshFrequency ] = useState(300); // seconds
    const { user } = useUser();

    const getSettings = async () => {
        const clerkId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/org-configure?clerkId=${clerkId}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                setTimezone(data.timezone);
                const permittedDomainsString = data.permittedDomains.map(item => item.domain).join('\n') + '\n';
                setPermittedDomains(permittedDomainsString);
                setRefreshFrequency(data.refreshFrequency);
                console.log('Fetched and stored settings in context:', permittedDomainsString);
            }
        } catch (error) {
            console.error(`Error getting app settings: ${error}`);
            throw error;
        }
    };
        
    const createLocalOrganization = async (organizationData: OrganizationDataProps) => {
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/organization/create`;
        console.log('in createTeam, calling API to attempt to create an org.');
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name:                organizationData.name,
                    clerkId:             user.id,
                    clerkOrganizationId: organizationData.clerkOrganizationId,
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

    const saveSettings = async (clerkOrganizationId: string) => {
        const clerkId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/org-configure`;
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

    // This is called by onboarding page which doesn't keep state on everything, so passes in some
    // default values to set values on a new org created via onboarding.
    const saveSettingsWithPresets = async (settingsObj:any) => {
        console.log(`saveSettingsWithPresets: ` + JSON.stringify(settingsObj));
        setTimezone(settingsObj.timezone);
        setPermittedDomains(settingsObj.permittedDomains);
        setRefreshFrequency(settingsObj.refreshFrequency);
        await saveSettings();
    }

    return (
      <SettingsContext.Provider 
        value={{ 
            getSettings,
            saveSettings,
            saveSettingsWithPresets,
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
