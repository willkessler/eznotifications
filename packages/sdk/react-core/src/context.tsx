import React, { createContext, ReactNode, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SDKConfig } from './types';

// Function to generate a UUID
const generateUniqueId = (): string  => {
  return 'tinad_user_' + uuidv4(); // This will generate a random UUID
};

const defaultTinadConfig = {
  apiKey: '',
  apiBaseUrl: 'https://api.this-is-not-a-drill.com',
  userId: generateUniqueId(),
  environment: 'development',
  pageId: '',
  apiUrlString: '',
}

interface TinadSDKContextType {
  tinadConfig: SDKConfig;
  updateTinadConfig: (configPartial: Partial<SDKConfig>) => void;
}  

const TinadSDKContext = createContext<TinadSDKContextType>({
  tinadConfig: defaultTinadConfig,
  updateTinadConfig: () => {},
});

// Define a provider component. This will allow clients to persist their API key and other important configurations.
export const TinadSDKCoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ tinadConfig, setTinadConfig ] = useState<SDKConfig>(defaultTinadConfig);

  useEffect(() => {
    const storeTinadConfig = ( ) => {
      const b64Config = btoa(JSON.stringify(tinadConfig));
      localStorage.setItem('tinad', b64Config);
    };
    storeTinadConfig();
  }, [tinadConfig]);

  const buildApiUrlString = (config:SDKConfig) => {
    const apiUrl = new URL(`${config.apiBaseUrl}/notifications`);
    apiUrl.searchParams.append('userId', config.userId);
    if (tinadConfig.pageId) {
      apiUrl.searchParams.append('pageId', config.pageId ?? '');
    }
    if (tinadConfig.environment) {
      apiUrl.searchParams.append('environment', config.environment ?? 'development');
    }
    
    const newApiUrlString = apiUrl.toString();
    console.log(`buildApiUrlString built: ${newApiUrlString} `);
    return newApiUrlString;
  };

  const updateTinadConfig = (configPartial: Partial<SDKConfig>) => {
    console.log(`updateTinadConfig: Updating tinad config with: ${JSON.stringify(configPartial)}`);
    setTinadConfig((prevConfig) => {
      const isChanged = Object.entries(configPartial).some(([key, value]) => {
        if (key in prevConfig) {
          const prevValue = prevConfig[key as keyof SDKConfig];
          return prevValue !== value;
        }
        return false;
      });
      if (isChanged) {
        const partlyUpdatedConfig = { ...prevConfig, ...configPartial };
        const newApiUrlString = buildApiUrlString(partlyUpdatedConfig);
        const updatedConfig = { ...partlyUpdatedConfig, apiUrlString: newApiUrlString };
        console.log(`Inside setTinadConfig: updatedConfig = ${JSON.stringify(updatedConfig,null,2)}`);
        return updatedConfig;
      }
      console.log('No change to Tinad config.');
      return prevConfig;
    });
  };

  return (
    <TinadSDKContext.Provider value={{ tinadConfig, updateTinadConfig  }}>
      {children}
    </TinadSDKContext.Provider>
  );
}

// Export the context to be used by other parts of the SDK or the consuming app.
export const useTinadSDK = () => useContext(TinadSDKContext);
