import './css/inlineNotifications.css';
import { MarkdownLib } from './Markdown';

export class InlineNotification {
  private containers: HTMLElement[];  // Store references to all containers
  private dismissCallback: (notificationUuid: string) => Promise<void>;
  private currentNotificationUuid: string;
  private inlineNotifOn:boolean;

  constructor(dismissCallback: (notificationUuid:string) => Promise<void>) {
    this.containers = Array.from(document.querySelectorAll('.tinad-inline'));
    this.dismissCallback = dismissCallback;
    this.inlineNotifOn = false;
  }

  private async clearContainers() {
    this.containers.forEach(container => {
      container.innerHTML = '';
    });
    try {
      await this.dismissCallback(this.currentNotificationUuid);
      this.inlineNotifOn = false;
    } catch(error) {
      console.log(`inlineNotification dismiss error: ${error}`);
    }
  }

  private async createContentDiv(content: string, container: HTMLElement): Promise<HTMLElement> {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'tinadNotification';

    // Insert content
    await MarkdownLib.insertMarkdownInDOM(content, notificationDiv, 'div', 'content');

    const dismissButtonX = document.createElement('button');
    dismissButtonX.className = 'dismiss-x';
    dismissButtonX.textContent = 'x';
    dismissButtonX.onclick = async () => { await this.clearContainers(); };
    notificationDiv.appendChild(dismissButtonX);

    const okButton = document.createElement('button');
    okButton.className = 'ok-button';
    okButton.textContent = 'OK';
    okButton.onclick = () => this.clearContainers();
    notificationDiv.appendChild(okButton);

    return notificationDiv;
  }

  public show = async (content: string = 'Default text', notificationUuid: string):Promise<void> => {
    if (this.inlineNotifOn) {
      return;
    }
    // Fill all containers with the same content
    this.currentNotificationUuid = notificationUuid;
    for (const container of this.containers) {
      container.innerHTML = '';  // Clear previous content

      const contentDiv = await this.createContentDiv(content, container);
      container.appendChild(contentDiv);
    }
    this.inlineNotifOn = true;
  }

}
