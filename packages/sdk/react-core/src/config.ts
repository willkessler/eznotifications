// src/config.ts in @thisisnotadrill/react-core
import type { SDKConfig, SDKNotification, SDKDataReturn } from './types';

// Initial configuration with default values
let sdkGlobalConfig: SDKConfig = {
    apiKey: '',
    userId: '',
    environment: 'development',
};

export const initSDK = (config: { apiKey: string, userId: string }) => {
  sdkGlobalConfig = { ...config };
};

// A method to access the global config anywhere within your SDK
export const getSDKGlobalConfig = () => sdkGlobalConfig;
