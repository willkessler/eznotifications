import { SDK } from './notifications/SDK';
import { UserIdGenerator } from './lib/UserIdGenerator';
import { TargetInsertType, SDKConfiguration } from './types';
import JSON5 from 'json5';


// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  //console.log('DOMContentLoaded');
  const tinadPrefixString = 'TINAD_RECONFIGURE';
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
      targetClassname: '',
      targetPlacement: 'target-inside' as TargetInsertType,
      customControlClasses: {
        content: 'my-content',
        confirm: 'my-confirm',
        dismiss: 'my-dismiss',
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
    console.log('Here is the final configuration: ', finalConfiguration);
    return finalConfiguration;
  };  

  const initialConfiguration = constructConfiguration();
  const sdk = new SDK(initialConfiguration);

  try {
    await sdk.pollApi(); // kick off polling
  } catch (error) {
    console.error(`Failed to poll TINAD API: ${error}`);
  }

  const handlePostMessage = (event:MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return; // ignore unknown origin messages
    }

    if (event.data && typeof(event.data) === 'string' && event.data.startsWith(tinadPrefixString)) {
      const updatedSdkConfigStr = event.data.replace(`${tinadPrefixString}:`, '');
      const updatedSdkConfig = JSON.parse(updatedSdkConfigStr);
      sdk.updateConfiguration(updatedSdkConfig);
    }
  }
  window.addEventListener('message', handlePostMessage);  // listen for post messages from the demo site

});
