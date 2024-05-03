// Todo
// X pass eznotifications around
// X create a src/lib directory
// generate on-demand user id, store in local storage
// allow for a css url that would load css for the toasts and modals as users prefer
// make it easy from the dashboard to configure these script snippets to drop into a page
// test what happens if this snippet is dropped into the HEAD in Umso test site -- use "defer" keyword
// make sure users realize they have to create a div for the inline modal, or an existing target to insert as a child or right after
// support markdown rendering

import { SDKNotification } from '../../../react-core/src/types';
import { Poller } from '../lib/Poller';
import { ToastNotification, ToastNotificationOptions } from './ToastNotifications';
import { InlineNotification } from './InlineNotifications';
import { ModalNotification, ModalNotificationOptions } from './ModalNotifications';
import { BannerNotification } from './BannerNotifications';

export class SDK {
  poller: Poller;
  toastNotification: ToastNotification;
  inlineNotification: InlineNotification;
  modalNotification: ModalNotification;
  bannerNotification: BannerNotification;
  apiEndpoint: string;
  apiKey: string;
  apiEnvironments: string;
  apiDomains: string;
  displayMode: string;
  userId: string;
  pollingInterval: number;
  notificationQueue: SDKNotification[] = [];
  currentlyDisplayedNotificationUuid: string;

  constructor(apiEndpoint: string, 
              apiKey: string, 
              apiEnvironments: string, 
              apiDomains: string, 
              displayMode: string, 
              toastPosition: string,
              toastDuration: number,
              userId: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;
    this.userId = userId;
    this.currentlyDisplayedNotificationUuid = null;

    const toastOptions:ToastNotificationOptions = {
      dismissCallback: this.markAsDismissed,
      // One of these (from swal2): 
      // 'top', 'top-start', 'top-end', 'center', 'center-start', 'center-end', 
      // 'bottom', 'bottom-start', or 'bottom-end'.
      position: toastPosition,
      duration: toastDuration,
    };
    this.toastNotification = new ToastNotification(toastOptions);

    this.inlineNotification = new InlineNotification(this.markAsDismissed);

    const modalOptions: ModalNotificationOptions = {
      dismissCallback: this.markAsDismissed,
    };
    this.modalNotification = new ModalNotification(modalOptions);

    this.bannerNotification = new BannerNotification({ dismissCallback: this.markAsDismissed, duration: 5000 });
    this.displayMode = displayMode;

    const pollingErrorHandler = (error: any) => { 
      if (error !== null) { 
        console.log('Polling Error:', error);
      }
    };
    this.pollingInterval = 1000; // ms
    this.poller = Poller.getInstance(this.pollApi, this.pollingInterval, pollingErrorHandler);  // Directly pass as arrow function

  }

  addToNotificationQueue(rawNotification: any): void {
    // Check for existing notification by UUID
    const exists = this.notificationQueue.some(n => n.uuid === rawNotification.uuid) || (rawNotification.uuid === this.currentlyDisplayedNotificationUuid);

    if (!exists) {
      const newNotification:SDKNotification = {
        uuid:             rawNotification.uuid,
        createdAt:        rawNotification.createdAt,
        content:          rawNotification.content,
        pageId:           rawNotification.pageId,
        notificationType: rawNotification.notificationType,
        environments:     rawNotification.environments,
        domains:          rawNotification.domains,
        startDate:        rawNotification.startDate,
        endDate:          rawNotification.endDate,
        live:             rawNotification.live,
        dismissed:        rawNotification.dismissed,
      }
      this.notificationQueue.push(newNotification);  // Add if not a duplicate
    }
  }

  pollApi = async ():Promise<number> => {
    //console.log('pollApi running');
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${this.apiKey}`, 
        'Content-type': 'application/json' ,
        'X-Tinad-Source': 'vanillaJsSdk',
      }),
    }

    try {
      const fullUrl = `${this.apiEndpoint}/notifications?userId=${this.userId}&environments=${this.apiEnvironments}`;
      const response = await fetch(fullUrl, fetchOptions);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        for (const notification of data) {
          this.addToNotificationQueue(notification);
        }
      }

      // Display the next notification if there is one and nothing is currently displayed
      await this.displayNextNotification();
      return this.pollingInterval;  // Return updated interval if applicable
    } catch (error) {
      return -1;
    }
  }

  async displayNotification(notification: any, dismissCallback: () => void): Promise<void> {
    console.log('displayNotification');
    try {
//      notification.content = notification.content + 
//        'Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. ' +
//        'Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus,'+
//        ' iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet.'; 
      //console.log('Content:', notification.content);
      switch (this.displayMode) {
        case 'toast':
          this.toastNotification.show(notification);
          break;
        case 'inline':
          await this.inlineNotification.show(notification);
          break;
        case 'modal':
          this.modalNotification.show(notification);
          break;
        case 'banner':
          await this.bannerNotification.show(notification);
          break;
      }
      this.currentlyDisplayedNotificationUuid = notification.uuid;
    } catch (error) {
      console.error('Display notification error: ', error);
    }
  }

  displayNextNotification = async () => {
    //console.log('displayNextNotification');
    if (this.notificationQueue.length === 0) return;  // Exit if no notifications in queue

    const notification = this.notificationQueue.shift();  // Get the next notification

    const dismissCallback = async () => { 
      await this.markAsDismissed(notification.uuid);
    };
    this.displayNotification(notification, dismissCallback);
  }  

  markAsDismissed = async (notificationUuid: string): Promise<void> => {
    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Tinad-Source': 'vanillaJsSdk',
        }),
        body: JSON.stringify({ 
          notificationUuid,
          userId: this.userId,
        }),
      };

      const response = await fetch(`${this.apiEndpoint}/notifications/dismiss`, fetchOptions);
      const data = await response.json();
      console.log('Notification dismissed:', data);
      this.currentlyDisplayedNotificationUuid = null;
      this.poller.restartPolling();
    } catch (error) {
      console.error('Display notification error: ', error);
    }
  }
}
