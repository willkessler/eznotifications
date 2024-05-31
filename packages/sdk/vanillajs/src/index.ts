import { SDK } from './notifications/SDK';
import { UserIdGenerator } from './lib/UserIdGenerator';
import { TargetInsertType, SDKConfiguration } from './types';
import JSON5 from 'json5';

// Adding event listener to initialize when the DOM is fully loaded
const initializeSDK = async () => {
  console.log('DOMContentLoaded, initializing TINAD plainJS SDK');
  const tinadMessageIdentifier = 'tinadReconfigure';
  const defaultConfiguration:SDKConfiguration = {
    api: {
      displayMode : 'inline',
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
      show: {
        confirm: true,
        dismiss: true,
      },
    },
    inline: {
      target: {
        outer: 'tinad-inline-container',
        content: 'tinad-inline-content',
        confirm: 'tinad-inline-confirm',
        dismiss: 'tinad-inline-dismiss',
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
  
  const constructConfiguration = (): SDKConfiguration => {
    const scriptTag = document.getElementById('tinad-sdk') as HTMLScriptElement;
    const userSuppliedConfiguration = scriptTag ? scriptTag.getAttribute('tinad-configuration') : null;
    // console.log(`userSuppliedConfiguration: ${JSON.stringify(userSuppliedConfiguration,null,2)});
    const userConfiguration = userSuppliedConfiguration ? JSON5.parse(userSuppliedConfiguration) : {};
    userConfiguration.api.userId = UserIdGenerator.generate(userConfiguration.api.userId, userConfiguration.api.key);
    const finalConfiguration = { ...defaultConfiguration, ...userConfiguration };
    //console.log('Here we now really have the absolute, really, final configuration: ', finalConfiguration);
    return finalConfiguration;
  };  

  const initialConfiguration = constructConfiguration();
  const sdk = new SDK(initialConfiguration);

  try {
    await sdk.pollApi(); // kick off polling
  } catch (error) {
    console.error(`Failed to poll TINAD API: ${error}`);
  }

  const handlePostMessage = async (event:MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return; // ignore unknown origin messages
    }

    if (event.data && typeof(event.data) === 'string') {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage.name === 'tinadReconfigure') {
        const updatedSdkConfig = receivedMessage.config;
        console.log(`TINAD reconfiguring itself with this new config: ${JSON.stringify(updatedSdkConfig,null,2)}`);
        updatedSdkConfig.api.userId = UserIdGenerator.generate(updatedSdkConfig.api.userId, updatedSdkConfig.api.key);
        if (!updatedSdkConfig.api?.key) {
          updatedSdkConfig.api.key = sdk.getStoredApiKey(); // continue using the previously set api key
        }
        await sdk.updateConfiguration(updatedSdkConfig);
      }
    }
  }
  
  console.log(`adding event listener for ${tinadMessageIdentifier}`);
  window.addEventListener("message", handlePostMessage);  // listen for post messages from the demo site

};

// Make sure DOM is ready before initializing. If we somehow missed the DOMContentLoaded event, then just run the script.

console.log('%%%%%%% TINAD SDK: running, document.readyState=', document.readyState);

const initializeIfReady = ():void => {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('TINAD: Document is ready, initializing SDK');
    initializeSDK();
  } else {
    console.log('TINAD: Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initializeSDK);
  }
}

// Check if the script is running after DOMContentLoaded has fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeIfReady();
} else {
  //console.log('Document not fully loaded yet');
  document.addEventListener('DOMContentLoaded', initializeIfReady);
}

if (document.readyState === 'complete') {
  //console.log('readyState==complete');
  initializeSDK();
} else {
  //console.log('wait for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initializeSDK);
}

console.log('%%%%%%% TINAD SDK: done with initializer setup.');
