import React, { createContext, ReactNode, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SDKConfig } from './types';

// Function to generate a UUID
const generateUniqueId = (): string  => {
  return 'tinad_user_' + uuidv4(); // This will generate a random UUID
};

const defaultTinadConfig = {
  apiKey: '',
  apiBaseUrl: 'https://api.this-is-not-a-drill.com',
  userId: 'user-1',
  environment: 'development',
  pageId: '',
  apiUrlString: '',
}

interface TinadSDKContextType {
  tinadConfig: SDKConfig;
  updateTinadConfig: (configPartial: Partial<SDKConfig>) => void;
  buildApiUrlString: () => string;
}  

const TinadSDKContext = createContext<TinadSDKContextType>({
  tinadConfig: defaultTinadConfig,
  updateTinadConfig: () => {},
  buildApiUrlString: () => '',
});

// Define a provider component. This will allow clients to persist their API key and other important configurations.
export const TinadSDKCoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const getLocalStorage = (key:string) => {
    const localStorageValue = localStorage.getItem(key);
    return localStorageValue;
  };        

  const setLocalStorage = (key:string, value:string) => {
    localStorage.setItem(key,value);
  };        

  console.log('+_+_+_+_+_+_+_ TinadSDKCoreProvider (context.tsx) mount. Restoring saved config from local store.');
  let previousConfig = { ...defaultTinadConfig };
  const previousConfigB64 = getLocalStorage('tinad');
  if (previousConfigB64) {
    try {
      const previousConfigStr = atob(previousConfigB64);
      previousConfig = JSON.parse(previousConfigStr);
      console.log(`index.tsx: previousConfig: ${JSON.stringify(previousConfig,null,2)}`);
    } catch (e) {
      console.error('Error restoring config from local storage:', e);
    }
  }

  const [ tinadConfig, setTinadConfig ] = useState<SDKConfig>(previousConfig);

  useEffect(() => {
    const storeTinadConfig = ( ) => {
      const b64Config = btoa(JSON.stringify(tinadConfig));
      localStorage.setItem('tinad', b64Config);
    };
    console.log(`Storing tinad config in local : ${JSON.stringify(tinadConfig,null,2)}`);
    storeTinadConfig();
  }, [tinadConfig]);

  const buildApiUrlString = () => {
    const apiUrl = new URL(`${tinadConfig.apiBaseUrl}/notifications`);
    apiUrl.searchParams.append('userId', tinadConfig.userId);
    if (tinadConfig.pageId) {
      apiUrl.searchParams.append('pageId', tinadConfig.pageId ?? '');
    }
    if (tinadConfig.environments) {
      apiUrl.searchParams.append('environments', tinadConfig.environments ?? 'development');
    }
    
    // apiUrl.searchParams.append('time', new Date().getTime().toString());
    const newApiUrlString = apiUrl.toString();
    console.log(`buildApiUrlString built: ${newApiUrlString} `);
    return newApiUrlString;
  };


  const updateTinadConfig = useCallback((configPartial: Partial<SDKConfig>) => {
    console.log(`updateTinadConfig: Updating tinad config with: ${JSON.stringify(configPartial,null,2)}`);
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
        const newApiUrlString = buildApiUrlString();
        const updatedConfig = { ...partlyUpdatedConfig, apiUrlString: newApiUrlString };
        console.log(`Inside setTinadConfig: updatedConfig = ${JSON.stringify(updatedConfig,null,2)}`);

        const callStack = new Error(">>>>>>> updateTinadConfig: SDK Function Call Stack");
        console.log(callStack.stack);

        return updatedConfig;
      }
      console.log('No change to Tinad config.');
      return prevConfig;
    });
  }, []);

  return (
    <TinadSDKContext.Provider value={{ tinadConfig, updateTinadConfig, buildApiUrlString  }}>
      {children}
    </TinadSDKContext.Provider>
  );
}

// Export the context to be used by other parts of the SDK or the consuming app.
export const useTinadSDK = () => useContext(TinadSDKContext);
