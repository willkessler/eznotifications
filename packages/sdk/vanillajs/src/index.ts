import { SDK } from './notifications/SDK';
import { UserIdGenerator } from './lib/UserIdGenerator';
import { TargetInsertType, SDKConfiguration } from './types';
import JSON5 from 'json5';


// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
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
    inline: {
      target: {
        outer: 'tinad-inline-container',
        content: 'tinad-inline-content',
        confirm: 'tinad-inline-confirm',
        dismiss: 'tinad-inline-dismiss',
      },
    },
    toast: {
      position: 'bottom-end',
      duration: 5000,
    },
    banner: {
      duration: 5000,
    },
    modal: {
      confirmButtonLabel: 'OK',
    }
  };
  
  const constructConfiguration = (): SDKConfiguration => {
    const scriptTag = document.getElementById('tinad-sdk') as HTMLScriptElement;
    const userSuppliedConfiguration = scriptTag ? scriptTag.getAttribute('tinad-configuration') : null;
    console.log(userSuppliedConfiguration);
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

    console.log('Reinitializing tinad sdk');
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

});
