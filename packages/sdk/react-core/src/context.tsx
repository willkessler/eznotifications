import React, { createContext, ReactNode, useState, useContext } from 'react';
import type { SDKConfig } from './types';

interface TinadSDKContextType {
  pageId?: string;
  setPageId?: React.Dispatch<React.SetStateAction<string | undefined>>;
  apiUrlString?: string;
  setApiUrlString?: React.Dispatch<React.SetStateAction<string>>;
}

const defaultContextValue: TinadSDKContextType = {
  pageId: undefined,
  setPageId: () => { console.log('Default setPageId function') }, // Provide a noop function as a default
  apiUrlString: '',
  setApiUrlString: () => {}, // Provide a noop function as a default
};

const TinadSDKContext = createContext<TinadSDKContextType>(defaultContextValue);

interface TinadSDKProviderProps {
  children: ReactNode;
}

// Define a provider component. This will allow clients to persist their API key and other important configurations.
const TinadSDKCoreProvider: React.FC<TinadSDKProviderProps> = ({ children }) => {
  const [pageId, setPageId] = useState<string | undefined>();
  const [apiUrlString, setApiUrlString] = useState<string>('');

  //console.log(`TinadSDKProvider: ${ setPageId, setApiUrlString }`);
  return (
    <TinadSDKContext.Provider value={{ pageId, setPageId, apiUrlString, setApiUrlString  }}>
      {children}
    </TinadSDKContext.Provider>
  );
}

// Provide hook for consuming our context.
export const useTinadSDKContext = () => {
  const tinadContext = useContext(TinadSDKContext);
  if (tinadContext === undefined) {
    throw new Error('useTinadSDKContext must be used within a TinadSDKProvider');
  }
  return tinadContext;
};

// Export the context to be used by other parts of the SDK or the consuming app.
export { TinadSDKCoreProvider };
