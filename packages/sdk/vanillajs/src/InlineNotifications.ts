import './css/inlineNotifications.css';

export class InlineNotifications {
  private containers: HTMLElement[];  // Store references to all containers

  constructor() {
    this.containers = Array.from(document.querySelectorAll('.tinad-inline'));
  }

  private clearContainers() {
    this.containers.forEach(container => {
      container.innerHTML = '';
    });
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

  show(content: string) {
    // Fill all containers with the same content
    this.containers.forEach(container => {
      container.innerHTML = '';  // Clear previous content
      container.appendChild(this.createContentDiv(content, container));
    });
  }


}
