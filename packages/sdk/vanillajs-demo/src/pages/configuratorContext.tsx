"use client";
import React, { createContext, ReactNode, useEffect, useState, useRef, useContext } from 'react';

const defaultSdkConfiguration = {
  api: {
    displayMode : 'toast',
    endpoint: process.env.NEXT_PUBLIC_TINAD_API_TARGET,
    key: process.env.NEXT_PUBLIC_TINAD_API_KEY,
    environments: [ 'Development' ],
    domains: [],
  },
  toast: {
    position: 'top-end',
    duration: 5000,
  },
  modal: {
    confirmButtonLabel: 'OK',
    show: {
      dismiss: true,
    },
  },
  inline: {
    target: 'default',
    show: {
      confirm: true,
      dismiss: true,
    },
  },
  banner: {
    duration: 5000,
    target: 'default',
    show: {
      dismiss: true,
    },
  },
};

interface ConfigurationContextType {
  config: SDKConfiguration;
  customCss: string;
  setBankIframeIsReadyState: (ready:boolean) => void;
}

const ConfigurationContext = createContext<ConfigurationContextType>({
  getSdkConfiguration: () => SDKConfiguration,
  setSdkConfiguration: (newConfig: SDKConfiguration) => {},
  getFilteredSdkConfiguration: () => SDKConfiguration,
  getCustomCss: () => string,
  setCustomCss: (newCss: string) => {},
  setBankIframeIsReadyState: () => { console.log('placeholder for setBankIframeIsReadyState'); },
  postMessageViaQueue: (newMessage:any) => {},
});

const ConfigurationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sdkConfiguration = useRef<SDKConfiguration>(defaultSdkConfiguration);
  const filteredSdkConfiguration = useRef<SDKConfiguration | null>(null);
  const [ configurationChanged, setConfigurationChanged ] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string | null>('snippet.js');
  const customCss = useRef<string>('Custom css');
  const [ bankIframeIsReadyState, setBankIframeIsReadyState ] = useState<boolean>(false);
  const messageQueue = useRef<string[]>([]);

  const getSdkConfiguration = (): SDKConfiguration => {
    return sdkConfiguration.current;
  }
  
  const getCustomCss = ():string => {
    return customCss.current;
  }
  
  const setCustomCss = (newCustomCss:string) => {
    customCss.current = newCustomCss;
  }
  
  const postMessageViaQueue = (message:any) => {
    const messageString = JSON.stringify(message);
    if (bankIframeIsReadyState) {
      // you can post directly to the iframe, we've received ready state
      const bankIframeElement = document.getElementById('bank-app') as HTMLIFrameElement;
      if (bankIframeElement) {
        bankIframeElement.contentWindow.postMessage(messageString, window.location.origin);
      }
    } else {
      // queue for later
      messageQueue.current.push(messageString);
    }
  }
  
  const processMessageQueue = ():void => {
    const bankIframeElement = document.getElementById('bank-app') as HTMLIFrameElement;
    if (bankIframeElement) {
      while (messageQueue.current.length > 0) {
        const messageString = messageQueue.current.shift();
        bankIframeElement.contentWindow.postMessage(messageString, window.location.origin);
      }
    }
  }
  
  useEffect(() => {
    if (bankIframeIsReadyState) {
      processMessageQueue();
    }
  }, [bankIframeIsReadyState]);

  const createFilteredConfiguration = ():SDKConfiguration => {
    // Destructuring extracts displayMode, inline, etc from the top level of config
    const config = sdkConfiguration.current;
    const { api, inline, modal, banner, toast, ...rest } = config;
    const displayMode = api.displayMode;

    // Prepare a new object to store the filtered config
    let newConfig: SDKConfiguration = {
      ...rest,
      api: { ...config.api },  // Copying api settings
      [displayMode]: { ...config[displayMode] }  // Copying only the relevant display mode settings
    };

    // Check the displayMode and remove unnecessary properties
    switch (displayMode) {
      case 'toast':
        // Include only 'toast' related settings
        break;  // Already copied toast settings above
      case 'modal':
        newConfig.modal = modal;
        break;
      case 'inline':
        // do nothing, we can't configure this except with css
        break;
      case 'banner':
        newConfig.banner = banner;
        break;
    }

    return newConfig;
  }

  const getFilteredSdkConfiguration = (): SDKConfiguration => {
    return filteredSdkConfiguration.current;
  }

  const setSdkConfiguration = (newConfiguration: SDKConfiguration) => {
    sdkConfiguration.current = newConfiguration;
    const filteredConfig = createFilteredConfiguration();
    filteredSdkConfiguration.current = filteredConfig;
    setConfigurationChanged(true);
  }

  return (
    <ConfigurationContext.Provider value={{
      getSdkConfiguration,
      setSdkConfiguration,
      getFilteredSdkConfiguration,
      configurationChanged,
      setConfigurationChanged,
      getCustomCss,
      setCustomCss,
      activeTab,
      setActiveTab,
      setBankIframeIsReadyState,
      postMessageViaQueue,
    }}>
      {children}
    </ConfigurationContext.Provider>
  );

};

export { ConfigurationContextProvider, ConfigurationContext };

export const useSdkConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useSdkConfiguration must be used within a ConfigurationContextProvider');
  }
  return context;
};
