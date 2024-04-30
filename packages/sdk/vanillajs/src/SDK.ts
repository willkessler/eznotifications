// TODO
// send notifs and toasts out one by one
// improve poller

import { ToastNotification, ToastNotificationOptions } from './ToastNotifications';
import { InlineNotification } from './InlineNotifications';
import { ModalNotification } from './ModalNotifications';
import { BannerNotification } from './BannerNotifications';
import { Poller } from './Poller';
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
  pollingInterval: number;
  notificationQueue: any[] = [];

  constructor(apiEndpoint: string, apiKey: string, apiEnvironments: string, apiDomains: string, displayMode: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;

    const toastOptions:Partial<ToastNotificationOptions> = {
      duration: 10000,
    };
    this.toastNotification = new ToastNotification(toastOptions);
    this.inlineNotification = new InlineNotification(this.markAsDismissed);
    this.modalNotification = new ModalNotification();
    this.bannerNotification = new BannerNotification({ duration: 5000 });
    this.displayMode = displayMode;

    const pollingErrorHandler = (error: any) => { 
      if (error !== null) { 
        console.error('Polling Error:', error);
      }
    };
    this.pollingInterval = 10000; // ms
    Poller.getInstance(this.pollApi, 5000, pollingErrorHandler);  // Directly pass as arrow function

  }

  pollApi = async ():Promise<number> => {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${this.apiKey}`, 
        'Content-type': 'application/json' ,
        'X-Tinad-Source': 'vanillaJsSdk',
      }),
    }

    try {
      const fullUrl = `${this.apiEndpoint}/notifications?environments=${this.apiEnvironments}`;
      const response = await fetch(fullUrl, fetchOptions);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        for (const notification of data) {
          this.notificationQueue.push(...data);
          this.displayNextNotification();  // Ensure sequential display with delay
        }
      }

      return this.pollingInterval;  // Return updated interval if applicable
    } catch (error) {
      console.error('API Poll Error:', error);
      throw error;
    }
  }

  async displayNotification(notification: any, dismissCallback: () => void): Promise<void> {
    try {
      notification.content = notification.content + 
        'Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. ' +
        'Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus,'+
        ' iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet.'; 
      console.log('Content:', notification.content);
      switch (this.displayMode) {
        case 'toast':
          this.toastNotification.show(notification.content);
          break;
        case 'inline':
          this.inlineNotification.show(notification.content, notification.uuid);
          break;
        case 'modal':
          this.modalNotification.show(notification.content);
          break;
        case 'banner':
          this.bannerNotification.show(notification.content);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  displayNextNotification() {
    if (this.notificationQueue.length === 0) return;  // Exit if no notifications in queue

    const notification = this.notificationQueue.shift();  // Get the next notification

    this.displayNotification(notification, () => this.markAsDismissed(notification.uuid));
  }  

  markAsDismissed = (notificationUuid: string): Promise<void> => {
    const fetchOptions: RequestInit = {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Tinad-Source': 'vanillaJsSdk',
      }),
      body: JSON.stringify({ 
        notificationUuid,
        userId: 'user123',
      }),
    };

    return fetch(`${this.apiEndpoint}/notifications/dismiss`, fetchOptions)
      .then(response => response.json())
      .then(data => console.log('Notification dismissed:', data))
      .catch(console.error)
      .finally(() => this.displayNextNotification());  // Trigger the next notification
  }

}
