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
  getTinadConfig: () => SDKConfig;
  updateTinadConfig: (configPartial: Partial<SDKConfig>) => void;
}  

const TinadSDKContext = createContext<TinadSDKContextType>({
  getTinadConfig: () => defaultTinadConfig,
  updateTinadConfig: () => {},
});

// Define a provider component. This will allow clients to persist their API key and other important configurations.
export const TinadSDKCoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const storeTinadConfig = (tinadConfig:SDKConfig) => {
    const b64Config = btoa(JSON.stringify(tinadConfig));
    localStorage.setItem('tinad', b64Config);
  };

  const getTinadConfig = ():SDKConfig => {
    let currentConfig = { ...defaultTinadConfig };
    const previousConfigB64 = localStorage.getItem('tinad');
    if (previousConfigB64) {
      try {
        const previousConfigStr = atob(previousConfigB64);
        currentConfig = JSON.parse(previousConfigStr);
        console.log(`index.tsx: currentConfig: ${JSON.stringify(currentConfig,null,2)}`);
      } catch (e) {
        console.log('Cannot restore config from local storage:', e);
      }
    }
    return currentConfig;
  };  

  console.log('+_+_+_+_+_+_+_ TinadSDKCoreProvider (context.tsx) mount. Restoring saved config from local store.');

  const updateTinadConfig = (configPartial: Partial<SDKConfig>) => {
    console.log(`updateTinadConfig: Updating tinad config with: ${JSON.stringify(configPartial,null,2)}`);
    let currentConfig = getTinadConfig();
    const isChanged = Object.entries(configPartial).some(([key, value]) => {
      if (key in currentConfig) {
        const currentValue = currentConfig[key as keyof SDKConfig];
        return currentValue !== value;
      }
      return false;
    });
    if (isChanged) {
      const partlyUpdatedConfig = { ...currentConfig, ...configPartial };
      storeTinadConfig(partlyUpdatedConfig);
      const callStack = new Error(">>>>>>> updateTinadConfig: SDK Function Call Stack");
      console.log(callStack.stack);
    }
    console.log('No change to Tinad config.');
    return currentConfig;
  };

  return (
    <TinadSDKContext.Provider value={{ getTinadConfig, updateTinadConfig  }}>
      {children}
    </TinadSDKContext.Provider>
  );
}

// Export the context to be used by other parts of the SDK or the consuming app.
export const useTinadSDK = () => useContext(TinadSDKContext);
