import { SDK } from './notifications/SDK';
import { UserIdGenerator } from './lib/UserIdGenerator';
import { TargetInsertType, SDKConfiguration } from './types';
import JSON5 from 'json5';


// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  //console.log('DOMContentLoaded');
  const defaultConfiguration:SDKConfiguration = 
    {
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
    
  const scriptTag = document.getElementById('tinad-sdk') as HTMLScriptElement;
  const userSuppliedConfiguration = scriptTag ? scriptTag.getAttribute('tinad-configuration') : null;
  console.log(userSuppliedConfiguration);
  const userConfiguration = userSuppliedConfiguration ? JSON5.parse(userSuppliedConfiguration) : {};
  userConfiguration.api.userId = UserIdGenerator.generate(userConfiguration.api.userId, userConfiguration.api.key);
  const finalConfiguration = { ...defaultConfiguration, ...userConfiguration };
  console.log('Here is the final configuration: ', finalConfiguration);
  
  const apiKey = scriptTag.getAttribute('data-api-key') || '';
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || 'https://api.this-is-not-a-drill.com';
  const displayMode = scriptTag.getAttribute('data-api-display-mode') || 'inline';
  const inlineTargetClassname = scriptTag.getAttribute('data-api-inline-target-classname') || null;
  const inlineTargetPlacement:TargetInsertType = scriptTag.getAttribute('data-api-inline-target-placement') as TargetInsertType || 'target-inside' as TargetInsertType;
  const inlineCustomControls:string = scriptTag.getAttribute('data-api-inline-custom-controls') || null;

  const toastPosition = scriptTag.getAttribute('data-api-toast-position') || 'top-left';
  const toastDuration = parseInt(scriptTag.getAttribute('data-api-toast-duration')) || 5000;
  const apiEnvironments = scriptTag.getAttribute('data-api-environments') || 'Development';
  const apiDomains = scriptTag.getAttribute('data-api-domains') || '';
  let userId = UserIdGenerator.generate(scriptTag.getAttribute('data-api-user-id'), apiKey);

  const sdk = new SDK(finalConfiguration);

  try {
    await sdk.pollApi(); // kick off polling
  } catch (error) {
    console.error(`Failed to poll TINAD API: ${error}`);
  }

});
