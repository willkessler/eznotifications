import { SDKConfiguration } from '../types';

export class ConfigStore {
  public static getConfiguration():SDKConfiguration {
    const defaultConfiguration:SDKConfiguration = {
      api: {
        displayMode : 'toast',
        userId: undefined, // will be set later by either the user or autoset
        key: '',
        endpoint: 'https://api.this-is-not-a-drill.com',
        environments: [ 'Development' ],
        domains: [],
        currentNotificationUuid: undefined,
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

    let tinadConfig = defaultConfiguration;
    const tinadConfigStr = localStorage.getItem('tinad');
    if (tinadConfigStr) {
      tinadConfig = JSON.parse(tinadConfigStr);
    }
    return tinadConfig;
  }
  
  public static setConfiguration(newConfiguration:SDKConfiguration):void {
    const tinadConfigString = JSON.stringify(newConfiguration);
    localStorage.setItem('tinad', tinadConfigString);
  }
}
