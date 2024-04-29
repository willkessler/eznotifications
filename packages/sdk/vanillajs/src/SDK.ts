// send notifs and toasts out one by one
// improve poller


import { ToastNotification, ToastNotificationOptions } from './ToastNotifications';
import { InlineNotification } from './InlineNotifications';
import { ModalNotification } from './ModalNotifications';
import { BannerNotification } from './BannerNotifications';
import Toastify from 'toastify-js';

export class SDK {
  toastNotification: ToastNotification;
  inlineNotification: InlineNotification;
  modalNotification: ModalNotification;
  bannerNotification: BannerNotification;
  apiKey: string;
  apiEndpoint: string;
  apiEnvironments: string;
  apiDomains: string;
  displayMode: string;

  constructor(apiEndpoint: string, apiKey: string, apiEnvironments: string, apiDomains: string, displayMode: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;

    const toastOptions:Partial<ToastNotificationOptions> = {
      duration: 10000,
    };
    this.toastNotification = new ToastNotification(toastOptions);
    this.inlineNotification = new InlineNotification();
    this.modalNotification = new ModalNotification();
    this.bannerNotification = new BannerNotification({ duration: 5000 });
    this.displayMode = displayMode;
  }

  async pollApi() {
    const fetchOptions = {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${this.apiKey}`, 
        'Content-type': 'application/json' ,
        'X-Tinad-Source': 'vanillajsSdk',
      }),
    }

    try {
      const fullUrl = `${this.apiEndpoint}/notifications?environments=${this.apiEnvironments}`;
      const response = await fetch(fullUrl, fetchOptions);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        console.log('data:', data);
        data.forEach((notification) => {
          console.log('Content:', notification.content);
          switch (this.displayMode) {
            case 'toast':
              this.toastNotification.show(notification.content);
              break;
            case 'inline':
              this.inlineNotification.show(notification.content);
              break;
            case 'modal':
              this.modalNotification.show(notification.content);
              break;
            case 'banner':
              this.bannerNotification.show(notification.content);
              break;
          }
        });

      }

    } catch (error) {
      console.error(error);
    }
  }
}
