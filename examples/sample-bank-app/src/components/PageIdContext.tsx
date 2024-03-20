import React, { createContext, useContext, useState } from 'react';

// Define the context shape
interface PageIdContextType {
  pageId: string;
  setPageId: (pageId: string) => void;
}

// Create context with an undefined default value, but it will be always provided by PageIdProvider
const PageIdContext = createContext<PageIdContextType | undefined>(undefined);

// Custom hook to use the context
export const usePageId = (): PageIdContextType => {
  const context = useContext(PageIdContext);
  if (!context) {
    throw new Error('usePageId must be used within a PageIdProvider');
  }
  return context;
};

// Provider component
export const PageIdProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [pageId, setPageId] = useState('');

  return (
    <PageIdContext.Provider value={{ pageId, setPageId }}>
      {children}
    </PageIdContext.Provider>
  );
};
