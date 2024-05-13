import React, { createContext, ReactNode, useState, useRef, useContext } from 'react';

const defaultSdkConfiguration = {
  api: {
    displayMode : 'toast',
    userId: undefined, // will be set later by either the user or autoset
    key: '',
    endpoint: 'https://api.this-is-not-a-drill.com',
    environments: [ 'Development' ],
    domains: [],
  },
  toast: {
    position: 'bottom-end',
    duration: 5000,
  },
  modal: {
    confirmButtonLabel: 'OK',
  },
  inline: {
    targetClassname: '',
    targetPlacement: 'target-inside' as TargetInsertType,
    customControlClasses: {
      content: 'my-content',
      confirm: 'my-confirm',
      dismiss: 'my-dismiss',
    },
  },
  banner: {
    duration: 5000,
  },
};

interface ConfigurationContextType {
  config: SDKConfiguration;
  customCss: string;
}

const ConfigurationContext = createContext<ConfigurationContextType>({
  getSdkConfiguration: () => SDKConfiguration,
  setSdkConfiguration: (newConfig: SDKConfiguration) => {},
  getCustomCss: () => string,
  setCustomCss: (newCss: string) => {},
});

const ConfigurationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sdkConfiguration = useRef<SDKConfiguration>(defaultSdkConfiguration);
  const [ configurationChanged, setConfigurationChanged ] = useState<boolean>(false);
  const [ customCss, setCustomCss ] = useState<string | null>(null);

  const getSdkConfiguration = (): SDKConfiguration => {
    return sdkConfiguration.current;
  }
  
  const setSdkConfiguration = (newConfiguration: SDKConfiguration) => {
    sdkConfiguration.current = newConfiguration;
    setConfigurationChanged(true);
  }
  
  return (
    <ConfigurationContext.Provider value={{
      getSdkConfiguration,
      setSdkConfiguration,
      configurationChanged,
      setConfigurationChanged,
      customCss,
      setCustomCss
      }}>
      {children}
    </ConfigurationContext.Provider>
  );

};

export default ConfigurationContextProvider;

export const useSdkConfiguration = () => useContext(ConfigurationContext);
