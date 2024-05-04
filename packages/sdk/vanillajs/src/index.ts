import { SDK } from './notifications/SDK';
import { UserIdGenerator } from './lib/UserIdGenerator';
import { InsertType } from './lib/Markdown';

// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  //console.log('DOMContentLoaded');
  const scriptTag = document.getElementById('api-script') as HTMLScriptElement;
  const apiKey = scriptTag.getAttribute('data-api-key') || '';
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || 'https://api.this-is-not-a-drill.com';
  const displayMode = scriptTag.getAttribute('data-api-display-mode') || 'inline';
  const inlineTargetClassname = scriptTag.getAttribute('data-api-inline-target-classname') || null;
  const inlineTargetPlacement:InsertType = scriptTag.getAttribute('data-api-inline-target-placement') as InsertType || 'target-inside' as InsertType;

  const toastPosition = scriptTag.getAttribute('data-api-toast-position') || 'top-left';
  const toastDuration = parseInt(scriptTag.getAttribute('data-api-toast-duration')) || 5000;
  const apiEnvironments = scriptTag.getAttribute('data-api-environments') || 'Development';
  const apiDomains = scriptTag.getAttribute('data-api-domains') || '';
  let userId = UserIdGenerator.generate(scriptTag.getAttribute('data-api-user-id'), apiKey);
  const sdk = new SDK(apiEndpoint,
                      apiKey,
                      apiEnvironments,
                      apiDomains,
                      displayMode,
                      inlineTargetClassname,
                      inlineTargetPlacement,
                      toastPosition,
                      toastDuration,
                      userId );
  try {
    await sdk.pollApi(); // kick off polling
  } catch (error) {
    console.error(`Failed to poll TINAD API: ${error}`);
  }

});
