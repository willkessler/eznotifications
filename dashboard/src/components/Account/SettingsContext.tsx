import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";

const SettingsContext = createContext({
    timezone: 'America/Los_Angeles',
    permittedDomains: '',
    refreshFrequency: 300, // 5 minutes, in seconds
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [ timezone, setTimezone ] = useState('America/Los_Angeles');
    const [ permittedDomains, setPermittedDomains ] = useState('');
    const [ refreshFrequency, setRefreshFrequency ] = useState(300); // seconds
    const { user } = useUser();

    const getSettings = async () => {
        const clerkId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/app-configure?clerkId=${clerkId}`;
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
        
    const saveSettings = async () => {
        const clerkId = user.id;
        const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/app-configure`;
        console.log('in saveSettings, permittedDomains:', permittedDomains);
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerkId, timezone, permittedDomains, refreshFrequency }),
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                console.log('Stored all settings.');
            }
        } catch (error) {
            console.error(`Error creating API key of type: ( ${apiKeyType} ).`, error);
            throw error;
        }
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
