import { v4 as uuidv4 } from 'uuid';
import { useTinadSDKContext } from './context';

// src/config.ts in @thisisnotadrill/react-core
import type { SDKConfig, SDKNotification, SDKDataReturn } from './types';

// Function to generate a UUID
const generateUniqueId = (): string  => {
  return 'tinad_user_' + uuidv4(); // This will generate a random UUID
};


// Initial configuration with default values

export const initTinadSDK = (config: SDKConfig ) => {
  if (config.apiBaseUrl === undefined) {
    config.apiBaseUrl = 'https://api.this-is-not-a-drill.com';
  }
  // Set a userId to something unique if for some reason client doesn't set one.
  if (config.userId === undefined) {
    config.userId = generateUniqueId();
  }
    
  //console.log('Setting sdkGlobalConfig to :', config);
  const b64Config = btoa(JSON.stringify(config));
  localStorage.setItem('tinad', b64Config);
};

export const updateTinadSDK = ( config: SDKConfig ) => {
  initTinadSDK(config);
};

// A method to access the global config anywhere within your SDK
export const getTinadSDKConfig = () => {
    const configString = localStorage.getItem('tinad');
    if (!configString) {
        // Handle case where config is not set yet or provide defaults
        return null;
    }
    const unpackedConfig = JSON.parse(atob(configString));
    return unpackedConfig;
};

export const buildApiUrlString = ():string => {
  const { pageId, apiUrlString, setApiUrlString } = useTinadSDKContext();
  const sdkConfig = getTinadSDKConfig();

  if (!sdkConfig) {
    throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
  }
  const apiKey = sdkConfig.apiKey;

  //console.log('useSDKData: here is the sdkConfig:', sdkConfig);
  const apiBaseUrl = sdkConfig.apiBaseUrl;
  const apiUrl = new URL(apiBaseUrl + '/notifications');

  apiUrl.searchParams.append('userId', sdkConfig.userId);

  if (pageId) {
    apiUrl.searchParams.append('pageId', pageId as string);
  } else {
    console.log('No pageId in context');
  }
  
  if (sdkConfig.environment) {
    apiUrl.searchParams.append('environment', sdkConfig.environment as string);
  }

  const newApiUrlString = apiUrl.toString();
  console.log(`buildApiUrlString: ${newApiUrlString} `);
  setApiUrlString?.(newApiUrlString);
  return newApiUrlString;
}
