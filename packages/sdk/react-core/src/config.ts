// src/config.ts in @thisisnotadrill/react-core
import type { SDKConfig, SDKNotification, SDKDataReturn } from './types';

// Initial configuration with default values
let sdkConfig: SDKConfig = {
    apiKey: '',
    apiBaseUrl: 'http://localhost:8080',
    userId: '',
    pageId: '',
    environments: [],
};

export const getSDKConfig = (): SDKConfig => {
  return sdkConfig;
};

export const setSDKConfig = (config: Partial<SDKConfig>) => {
  sdkConfig = { ...sdkConfig, ...config };
};

