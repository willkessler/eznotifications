"use client";
import React, { createContext, ReactNode, useEffect, useState, useRef, useContext } from 'react';
import { TargetInsertType, SDKConfiguration } from './types';

const defaultSdkConfiguration:SDKConfiguration = {
  api: {
    displayMode : 'toast',
    endpoint: process.env.NEXT_PUBLIC_TINAD_API_BASEURL ?? 'https://demo-api.this-is-not-a-drill.com',
    key: process.env.NEXT_PUBLIC_TINAD_API_KEY ?? 'notset',
    userId: 'user-1',
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
        bankIframeElement.contentWindow?.postMessage(messageString, window.location.origin);
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
        break;
      case 'banner':
        newConfig.banner = banner;
        break;
    }

    return newConfig;
  }

  const getFilteredSdkConfiguration = (): SDKConfiguration|null => {
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
      getCustomCss,
      setCustomCss,
      configurationChanged,
      setConfigurationChanged,
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
