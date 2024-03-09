// src/config.ts in @thisisnotadrill/react-core
import type { SDKConfig, SDKNotification, SDKDataReturn } from './types';

// Initial configuration with default values

export const initTinadSDK = (config: SDKConfig ) => {
    console.log('Setting sdkGlobalConfig to :', config);
    const b64Config = btoa(JSON.stringify(config));
    localStorage.setItem('tinad', b64Config);
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
