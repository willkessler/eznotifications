// src/config.ts in @thisisnotadrill/react-core

interface SDKConfig {
    apiBaseUrl: string;
    userId: string | null;
    pageId: string | null;
    environments: string[] | null;
}

// Initial configuration with default values
let sdkConfig: SDKConfig = {
    apiBaseUrl: 'http://localhost:8080/',
    userId: null,
    pageId: null,
    environments: [],
};

export const getSDKConfig = (): SDKConfig => {
  return sdkConfig;
};

export const setSDKConfig = (config: Partial<SDKConfig>) => {
  sdkConfig = { ...sdkConfig, ...config };
};

