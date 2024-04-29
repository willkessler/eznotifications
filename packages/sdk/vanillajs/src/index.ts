import { SDK } from './SDK';
import { Toast } from './Toast';

// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  const scriptTag = document.getElementById('api-script') as HTMLScriptElement;
  const apiKey = scriptTag.getAttribute('data-api-key') || '';
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || '';
  const apiEnvironments = scriptTag.getAttribute('data-api-environments') || '';
  const apiDomains = scriptTag.getAttribute('data-api-domains') || '';
  const sdk = new SDK(apiEndpoint, apiKey, apiEnvironments, apiDomains );
  sdk.pollApi();

  // Listen for custom events
  document.addEventListener('dismissToast', () => {
    console.log('Toast dismissed!');
  });

  const toaster = Toast.init();
  toaster.show({
    message: 'Welcome! This toast is auto-initialized on DOM content load.',
    duration: 5000
  });
});
