import React, { createContext, ReactNode, useState, useContext } from 'react';
import type { SDKConfig } from './types';

// Creating a context with a default undefined value or a default config
const TinadSDKContext = createContext<{ pageId? : string}>({});;

interface TinadSDKProviderProps {
    children: ReactNode;
    config: Partial<SDKConfig>;
}

// Define a provider component. This will allow clients to persist their API key and other important configurations.
const TinadSDKProvider: React.FC<TinadSDKProviderProps> = ({ children }) => {
    const [pageId, setPageId] = useState<string | undefined>();

    return (
        <TinadSDKContext.Provider value={{ pageId }}>
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
export { TinadSDKContext, TinadSDKProvider };
