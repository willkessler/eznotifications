import './css/inlineNotifications.css';

export class InlineNotification {
  private containers: HTMLElement[];  // Store references to all containers
  private dismissCallback: (notificationUuid: string) => Promise<void>;
  private notificationUuid: string;

  constructor(dismissCallback: (notificationUuid:string) => Promise<void>) {
    this.containers = Array.from(document.querySelectorAll('.tinad-inline'));
    this.dismissCallback = dismissCallback;
  }

  private clearContainers() {
    this.containers.forEach(container => {
      container.innerHTML = '';
    });
    this.dismissCallback(this.notificationUuid).catch(console.error);
  }

  private createContentDiv(content: string, container: HTMLElement): HTMLElement {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'tinadNotification';

    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    notificationDiv.appendChild(contentDiv);

    const dismissButtonX = document.createElement('button');
    dismissButtonX.className = 'dismiss-x';
    dismissButtonX.textContent = 'x';
    dismissButtonX.onclick = () => this.clearContainers();
    notificationDiv.appendChild(dismissButtonX);

    const okButton = document.createElement('button');
    okButton.className = 'ok-button';
    okButton.textContent = 'OK';
    okButton.onclick = () => this.clearContainers();
    notificationDiv.appendChild(okButton);

    return notificationDiv;
  }

  show(content: string, notificationUuid: string) {
    // Fill all containers with the same content
    this.notificationUuid = notificationUuid;
    this.containers.forEach(container => {
      container.innerHTML = '';  // Clear previous content
      container.appendChild(this.createContentDiv(content, container));
    });
  }

}
