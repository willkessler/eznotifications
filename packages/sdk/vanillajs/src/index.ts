import { SDK } from './SDK';
import { SimpleToast } from './SimpleToast';
import Toastify from 'toastify-js';

// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded');
  const scriptTag = document.getElementById('api-script') as HTMLScriptElement;
  const apiKey = scriptTag.getAttribute('data-api-key') || '';
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || '';
  const apiEnvironments = scriptTag.getAttribute('data-api-environments') || '';
  const apiDomains = scriptTag.getAttribute('data-api-domains') || '';
  const sdk = new SDK(apiEndpoint, apiKey, apiEnvironments, apiDomains );
  try {
    await sdk.pollApi();
  } catch (error) {
    console.error(`Failed to poll TINAD API: ${error}`);
  }

  // Listen for custom events
  document.addEventListener('dismissToast', () => {
    console.log('Toast dismissed!');
  });

  const toaster = SimpleToast.init();
  toaster.show({
    content: 'Welcome! This toast is auto-initialized on DOM content load.',
    duration: 1000
  });
});
