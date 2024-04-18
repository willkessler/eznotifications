import React from 'react';
import { useAuth } from "@clerk/clerk-react";

// Moved inside ConfigProvider to use the hook correctly
// const { getToken } = useAuth();

interface Headers {
  [key: string]: string;
}

interface Config {
  apiBaseUrl: string;
  getBearerHeader: (otherHeaders?: Headers | null) => Promise<Headers>;
}

// Define a placeholder function for the default context that matches the type
// Since it's a placeholder, it doesn't have to do anything meaningful.
const placeholderGetBearerHeader = async (otherHeaders: Headers | null = {}): Promise<Headers> => {
  return otherHeaders || {};
};

const defaultConfig: Config = {
  apiBaseUrl: import.meta.env.VITE_API_TARGET || 'http://localhost:8080',
  getBearerHeader: placeholderGetBearerHeader,
};

const ConfigContext = React.createContext<Config>(defaultConfig);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth(); // Must be inside the provider to use the hook correctly

  const getClerkUserToken = async () => {
      return await getToken();
  };

  //console.log(`In configContext we think VITE_API_TARGET = ${import.meta.env.VITE_API_TARGET}`);
  const config: Config = {
    apiBaseUrl: import.meta.env.VITE_API_TARGET || 'http://localhost:8080',
    // This function adds our Authorization: Bearer header, AND a special Tinad-only header so the API can
    // recognize dashboard requests and apply the right CORS policy.
    getBearerHeader: async (otherHeaders: Headers | null = {}) => {
        const clerkUserToken = await getClerkUserToken();
        return {
            ...otherHeaders,
          'Authorization': `Bearer ${clerkUserToken}`,
          'X-Tinad-Source' : 'Dashboard',
        };
    }
  };

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export const useConfig = (): Config => {
  const context = React.useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
