"use client";
import React, { createContext, ReactNode, useEffect, useState, useRef, useContext, useCallback } from 'react';
import { TargetInsertType, SDKConfiguration } from './types';

const defaultSdkConfiguration:SDKConfiguration = {
  api: {
    displayMode : 'toast',
    endpoint: (process.env.NEXT_PUBLIC_TINAD_API_BASEURL ? process.env.NEXT_PUBLIC_TINAD_API_BASEURL : 'https://demo-api.this-is-not-a-drill.com'),
    key: (process.env.NEXT_PUBLIC_TINAD_API_KEY ? process.env.NEXT_PUBLIC_TINAD_API_KEY : 'notset'),
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
      confirm: true,
      dismiss: true,
    },
  },
  inline: {
    target: {
      useDefaults: true,
    },
    show: {
      confirm: true,
      dismiss: true,
    },
  },
  banner: {
    duration: 5000,
    target: {
      useDefaults: true,
    },
    show: {
      dismiss: true,
    },
  },
};

interface ConfigurationContextType {
  configurationChanged: boolean;
  setConfigurationChanged: (newValue:boolean) => void;
  setBankIframeIsReadyState: (ready:boolean) => void;
  getSdkConfiguration: () => SDKConfiguration;
  setSdkConfiguration: (newConfig: SDKConfiguration) => void;
  getFilteredSdkConfiguration: () => SDKConfiguration | null;
  getCustomCss: () => string;
  setCustomCss: (newCss: string) => void;
  postMessageViaQueue: (newMessage: any) => void;
  activeTab: string | null;
  setActiveTab: (tabId:string | null) => void;  
  setActiveTabDelayed: (tabId:string | null) => void;
}

const ConfigurationContext = createContext<ConfigurationContextType>({
  configurationChanged: false,
  setConfigurationChanged: (newValue:boolean) => {},
  getSdkConfiguration: () => defaultSdkConfiguration,
  setSdkConfiguration: (newConfig: SDKConfiguration) => {},
  getFilteredSdkConfiguration: () => defaultSdkConfiguration,
  getCustomCss: () => '',
  setCustomCss: (newCss: string) => {},
  setBankIframeIsReadyState: () => {},
  postMessageViaQueue: (newMessage:any) => {},
  activeTab: 'snippet.js',
  setActiveTab: (tabId:string | null) => {},
  setActiveTabDelayed: (tabId:string | null) => {},
});

const ConfigurationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sdkConfiguration = useRef<SDKConfiguration>(defaultSdkConfiguration);
  const filteredSdkConfiguration = useRef<SDKConfiguration | null>(null);
  const [ configurationChanged, setConfigurationChanged ] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string | null>('snippet.js');
  const customCss = useRef<string>('Custom css');
  const [ bankIframeIsReadyState, setBankIframeIsReadyState ] = useState<boolean>(false);
  const messageQueue = useRef<string[]>([]);

  const getSdkConfiguration = useCallback((): SDKConfiguration => {
    return sdkConfiguration.current;
  },[]);
  
  const getCustomCss = useCallback(():string => {
    return customCss.current;
  }, []);
  
  const setCustomCss = useCallback((newCustomCss:string) => {
    customCss.current = newCustomCss;
  }, []);
  
  const setActiveTabDelayed = (tabId: string | null) => {
    setTimeout(() => {
      setActiveTab(tabId);
    }, 10);
  };
  
  const postMessageViaQueue = useCallback((message:any) => {
    const messageString = JSON.stringify(message);
    if (bankIframeIsReadyState) {
      // you can post directly to the iframe, we've received ready state
      const bankIframeElement = document.getElementById('bank-app') as HTMLIFrameElement;
      if (bankIframeElement) {
        bankIframeElement.contentWindow?.postMessage(messageString, window.location.origin);
      }
    } else {
      // queue for later
      messageQueue.current.push(messageString);
    }
  }, [bankIframeIsReadyState]);
  
  const processMessageQueue = ():void => {
    const bankIframeElement = document.getElementById('bank-app') as HTMLIFrameElement;
    if (bankIframeElement) {
      while (messageQueue.current.length > 0) {
        const messageString = messageQueue.current.shift();
        bankIframeElement.contentWindow?.postMessage(messageString, window.location.origin);
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
      [displayMode]: { ...(config[displayMode as keyof SDKConfiguration] as object) }  // Copying only the relevant display mode settings
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
        newConfig.inline = inline;
        break;
      case 'banner':
        newConfig.banner = banner;
        break;
    }

    console.log(`createFilteredConfiguration: ${JSON.stringify(newConfig,null,2)}`);
    return newConfig;
  }

  const getFilteredSdkConfiguration = useCallback((): SDKConfiguration|null => {
    return filteredSdkConfiguration.current;
  }, []);

  const setSdkConfiguration = useCallback((newConfiguration: SDKConfiguration) => {
    sdkConfiguration.current = newConfiguration;
    const filteredConfig = createFilteredConfiguration();
    filteredSdkConfiguration.current = filteredConfig;
    setConfigurationChanged(true);
  }, []);

  return (
    <ConfigurationContext.Provider value={{
      getSdkConfiguration,
      setSdkConfiguration,
      getFilteredSdkConfiguration,
      getCustomCss,
      setCustomCss,
      configurationChanged,
      setConfigurationChanged,
      activeTab,
      setActiveTab,
      setActiveTabDelayed,
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
