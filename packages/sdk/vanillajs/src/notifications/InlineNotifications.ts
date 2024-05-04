import '../css/inlineNotifications.css';
import { MarkdownLib, InsertType } from '../lib/Markdown';
import { SDKNotification } from '../../../react-core/src/types';

export class InlineNotification {
  private tinadNotificationElements: HTMLElement[];         // Store references to all containers
  private tinadNotificationContentElements: HTMLElement[];  // Store references to all divs in those containers
  private dismissCallback: (notificationUuid: string) => Promise<void>;
  private currentNotificationUuid: string;
  private inlineNotifOn:boolean;
  private foundTargetElements:boolean;
  private targetElementClassname: string;
  private targetElementPlacement: InsertType;
  private TINAD_CONTAINER_DEFAULT_CLASSNAME = 'tinad-container';
  private TINAD_NOTIFICATION_DEFAULT_CLASSNAME = 'tinad-notification';

  constructor(targetElementClassname: string, targetElementPlacement: InsertType, dismissCallback: (notificationUuid:string) => Promise<void> ) {
    // Set up TINAD notifications in the dom, either before/inside/after containers defined by the user, or inside a .tinad-container element.
    this.targetElementPlacement = targetElementPlacement || 'target-inside' as InsertType;
    this.targetElementClassname = (targetElementClassname === null ? this.TINAD_CONTAINER_DEFAULT_CLASSNAME : targetElementClassname);

    // if user passed a target class then we should make sure that target exists, and then create tinad containers before, inside, or after that target
    this.foundTargetElements = true;
    const targetContainers = Array.from(document.querySelectorAll('.' + targetElementClassname));
    if (targetContainers.length == 0) {
      this.foundTargetElements = false;
      console.error(`TINAD: No target elements found with classname ${this.targetElementClassname} for placing inline notifications.`);
    } else {
      // create notification divs to put our content in, with "display:none"
      for (const container of targetContainers) {
        const notificationElement = document.createElement('div');
        notificationElement.className = this.TINAD_CONTAINER_DEFAULT_CLASSNAME;
        notificationElement.style.display = 'none';

        const contentDiv = document.createElement('div');
        contentDiv.className = this.TINAD_NOTIFICATION_DEFAULT_CLASSNAME;
        notificationElement.appendChild(contentDiv);
        
        const dismissButtonX = document.createElement('button');
        dismissButtonX.className = 'dismiss-x';
        dismissButtonX.textContent = 'x';
        dismissButtonX.onclick = async () => { await this.hideContainers(); };
        notificationElement.appendChild(dismissButtonX);

        const okButton = document.createElement('button');
        okButton.className = 'ok-button';
        okButton.textContent = 'OK';
        okButton.onclick = async () => { await this.hideContainers(); };
        notificationElement.appendChild(okButton);

        switch (this.targetElementPlacement) {
          case InsertType.TargetInside:
            console.log('trying to insert inside');
            container.innerHTML = '';  // Clear previous content
            container.appendChild(notificationElement);
            break;
          case InsertType.TargetBefore:
            console.log('trying to insert before');
            if (container !== document.body) {
              container.parentElement.insertBefore(notificationElement, container);
              console.log('inserted before');
            }
            break;
          case InsertType.TargetAfter:
            console.log('trying to insert after');
            if (container !== document.body) {
              container.insertAdjacentElement('afterend', notificationElement);
            }
            break;
        }
      }
    }
    // Any div element inside the tinad-containers is for holding the content.
    this.tinadNotificationElements = Array.from(document.querySelectorAll('.' + this.TINAD_CONTAINER_DEFAULT_CLASSNAME));
    this.tinadNotificationContentElements = Array.from(document.querySelectorAll('.' + this.TINAD_NOTIFICATION_DEFAULT_CLASSNAME));
    this.dismissCallback = dismissCallback;
    this.inlineNotifOn = false;
  }


  private async hideContainers() {
    this.tinadNotificationElements.forEach(notificationElement => {
      notificationElement.style.display = 'none';
    });
    this.inlineNotifOn = false;
    await this.dismissCallback(this.currentNotificationUuid);
  }

  private async setAndShowNotifications(content):Promise<void> {
    console.log('setAndShowNotifications');
    // Insert content.
    const markedContent = await MarkdownLib.renderMarkdown(content);
    for (const notificationContentElement of this.tinadNotificationContentElements) {
      notificationContentElement.innerHTML = markedContent;
    }
    // Show all containers.
    this.tinadNotificationElements.forEach(notificationElement => {
      notificationElement.style.display = 'block';
    });
  }

  public show = async (notification:SDKNotification):Promise<void> => {
    const content = notification.content || 'Default text';
    const uuid = notification.uuid;

    if (this.inlineNotifOn) {
      return;
    }

    if (!this.foundTargetElements) {
      return; // can't target TINAD notifs anywhere on the page
    }

    // Fill all containers with the same content
    this.currentNotificationUuid = uuid;
    await this.setAndShowNotifications(content);

    this.inlineNotifOn = true;
  }

}
