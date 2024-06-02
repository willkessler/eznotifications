// Todo
// X support markdown rendering
// X pass eznotifications around
// X create a src/lib directory
// X generate on-demand user id, store in local storage
// x change script tags so they don't all start with 'data-api'
// X make sure users realize they have to create a div for the inline modal, or an existing target to insert as a child or right after: target-inside, target-before, target-after.
// X   allow definition of a "close" element and a callback function... how?
// X   can they target just a message element and a dismiss element as well, so it's entirely custom? provide: outer div classname, message div classname, dismiss div classname. they should set outer div display:none so TINAD can show it
// X Replace InsertType with something clearer; create a types.ts file
// X Figure out why a notif shows up twice after you reset the db -- turn off polling during dismiss
// X Figure out a way to do a configurator with iframe into the same page? or two pages in a vertical format in stackblitz. nextjs? ideally, codepen
// publish to npm
// allow for a css url that would load css for the toasts and modals as users prefer -- or inject the custom css from the editor!
// make it easy from the dashboard to configure these script snippets to drop into a page
// test what happens if this snippet is dropped into the HEAD in Umso test site -- use "defer" keyword
// can i make a demo in codepen.io work?

import { SDKNotification } from '../../../react-core/src/types';
import { SDKConfiguration, TargetInsertType } from '../types';
import { Poller } from '../lib/Poller';
import { ToastNotification } from './ToastNotifications';
import { InlineNotification } from './InlineNotifications';
import { ModalNotification } from './ModalNotifications';
import { BannerNotification } from './BannerNotifications';
import { ConfigStore } from '../lib/ConfigStore';

export class SDK {
  poller: Poller;
  toastNotification: ToastNotification;
  inlineNotification: InlineNotification;
  modalNotification: ModalNotification;
  bannerNotification: BannerNotification;
  pollingInterval: number;
  notificationQueue: SDKNotification[] = [];

  constructor() {
    const configuration = ConfigStore.getConfiguration();

    this.toastNotification = new ToastNotification(this.markAsDismissed);
    this.inlineNotification = new InlineNotification(this.markAsDismissed);
    this.modalNotification = new ModalNotification(this.markAsDismissed);
    this.bannerNotification = new BannerNotification(this.markAsDismissed);

    const pollingErrorHandler = (error: any) => {
      if (error !== null) {
        console.log('Polling Error:', error);
      }
    };
    this.pollingInterval = 1000; // ms, start as soon as possible, but then ease up
    this.poller = Poller.getInstance(this.pollApi, this.pollingInterval, pollingErrorHandler);  // Directly pass as arrow function
  }

  addToNotificationQueue(rawNotification: any): void {
    const configuration = ConfigStore.getConfiguration();
    // Check for existing notification by UUID
    const exists = this.notificationQueue.some(n => n.uuid === rawNotification.uuid) || (rawNotification.uuid === configuration.api.currentNotificationUuid);

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
      console.log('addToNotificationQueue:', newNotification);
      this.notificationQueue.push(newNotification);  // Add if not a duplicate
    }
  }

  pollApi = async ():Promise<number> => {
    //console.log('pollApi running');
    const configuration = ConfigStore.getConfiguration();
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${configuration.api.key}`,
        'Content-type': 'application/json' ,
        'X-Tinad-Source': 'vanillaJsSdk',
      }),
    }

    //this.inlineNotification.logNotificationUuid();

    try {
      const fullUrl = `${configuration.api.endpoint}/notifications?userId=${configuration.api.userId}&environments=${configuration.api.environments}`;
      const response = await fetch(fullUrl, fetchOptions);
      const newPollInterval = response.headers.get('x-tinad-poll-interval');
      const data = await response.json();

      if (data && Array.isArray(data)) {
        for (const notification of data) {
          this.addToNotificationQueue(notification);
        }
      }

      // Display the next notification if there is one and nothing is currently displayed
      await this.displayNextNotification();
      if (newPollInterval) {
        const numericPollInterval = parseInt(newPollInterval) * 1000;
        return numericPollInterval;   // Return updated interval if applicable
      }        
      return this.pollingInterval;
    } catch (error) {
      return -1;
    }
  }

  async displayNotification(notification: any, dismissCallback: () => void): Promise<void> {
    console.log('displayNotification');
    const configuration = ConfigStore.getConfiguration();
    try {
//      notification.content = notification.content +
//        'Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. ' +
//        'Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus,'+
//        ' iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet.';
      //console.log('Content:', notification.content);
      switch (configuration.api.displayMode) {
        case 'toast':
          this.toastNotification.show(notification);
          break;
        case 'inline':
          console.log(`displayNotification displaying an inline notification: ${JSON.stringify(notification,null,2)}`);
          await this.inlineNotification.show(notification);
          break;
        case 'modal':
          this.modalNotification.show(notification);
          break;
        case 'banner':
          await this.bannerNotification.show(notification);
          break;
      }
      configuration.api.currentNotificationUuid = notification.uuid;
      ConfigStore.setConfiguration(configuration);
    } catch (error) {
      console.error('Display notification error: ', error);
    }
  }

  displayNextNotification = async () => {
    const configuration = ConfigStore.getConfiguration();
    //console.log(`displayNextNotification configuration.api.currentNotificationUuid ${configuration.api.currentNotificationUuid}`);
    if (this.notificationQueue.length === 0) return;  // Exit if no notifications in queue
    if (configuration.api.currentNotificationUuid !== undefined) return; // don't try to display if something currently displayed

    const notification = this.notificationQueue.shift();  // Get the next notification

    const dismissCallback = async () => {
      notification && notification.uuid && await this.markAsDismissed();
    };
    this.displayNotification(notification, dismissCallback);
    console.log('notificationQueue:');
    console.log(JSON.stringify(this.notificationQueue, null,2));
  }

  clearNotificationQueue = () => {
    this.notificationQueue = [];
  }

  markAsDismissed = async (): Promise<void> => {
    console.log('markAsDismissed pausing polling.');
    const configuration = ConfigStore.getConfiguration();
    const notificationUuid = configuration.api.currentNotificationUuid;
    if (notificationUuid === undefined) {
      console.log('markAsDismissed: returning early because no currentNotificationUuid set.');
      return;
    }
    const pauseId = Math.random() * 10000;
    this.poller.pausePolling(pauseId); // prevent race conditions by stopping polling during the dismiss process
    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${configuration.api.key}`,
          'Content-Type': 'application/json',
          'X-Tinad-Source': 'vanillaJsSdk',
        }),
        body: JSON.stringify({
          notificationUuid,
          userId: configuration.api.userId,
        }),
      };

      const response = await fetch(`${configuration.api.endpoint}/notifications/dismiss`, fetchOptions);
      const data = await response.json();
      console.log('Notification dismissed:', data);
      configuration.api.currentNotificationUuid = undefined;
      ConfigStore.setConfiguration(configuration);
      this.poller.restartPolling();
    } catch (error) {
      console.error('Display notification error: ', error);
    } finally {
      console.log('markAsDismissed resuming polling.');
      this.poller.resumePolling(pauseId);
    }
  }

  resetViewsForCurrentEndUser = async (): Promise<void> => {
    const configuration = ConfigStore.getConfiguration();
    console.log(`resetViewsForSingleUser resetting views for user ${configuration.api.userId}.`);
    try {
      const fetchOptions: RequestInit = {
        method: 'PUT',
        headers: new Headers({
          'Authorization': `Bearer ${configuration.api.key}`,
          'Content-Type': 'application/json',
          'X-Tinad-Source': 'vanillaJsSdk',
        }),
      };

      const response = await fetch(`${configuration.api.endpoint}/notifications/reset-views/user/${configuration.api.userId}`, fetchOptions);
      const data = await response.json();
      console.log('End user reset results:', data);
    } catch (error) {
      console.error('End user reset views error: ', error);
    }
  }

  updateConfiguration = async (newConfiguration: SDKConfiguration):Promise<void> => {
    this.poller.cancelPolling();
    this.clearNotificationQueue();
    const configuration = ConfigStore.getConfiguration();
    switch (configuration.api.displayMode) {
      case 'toast':
        this.toastNotification.hide();
        break;
      case 'inline':
        this.inlineNotification.hide();
        break;
      case 'modal':
        this.modalNotification.hide();
        break;
      case 'banner':
        this.bannerNotification.hide();
        break;
    }
    configuration.api.currentNotificationUuid = undefined;
    ConfigStore.setConfiguration(newConfiguration);
    // Need to rebind the inline elements in case we switched from
    // standard to custom div elements
    this.inlineNotification.bindDomElements();

    // Automatically reset views for the current (demo) user.
    await this.resetViewsForCurrentEndUser();
    this.poller.restartPolling();
  }

}
