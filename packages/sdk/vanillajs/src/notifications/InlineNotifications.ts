import '../css/inlineNotifications.css';
import { MarkdownLib } from '../lib/Markdown';
import { SDKConfiguration, TargetInsertType } from '../types';
import { ConfigStore } from '../lib/ConfigStore';
import { SDKNotification } from '../../../react-core/src/types';

export class InlineNotification {
  private cannotRender:boolean;
  private notificationElements: {
    outer: HTMLElement[],
    content: HTMLElement[],
    confirm: HTMLElement[],
    dismiss: HTMLElement[],
  };
  private TINAD_CONTAINER_CLASSNAME            = 'tinad-inline-container';
  private TINAD_NOTIFICATION_CONTENT_CLASSNAME = 'tinad-inline-content';
  private TINAD_CONFIRM_CLASSNAME              = 'tinad-inline-confirm';
  private TINAD_DISMISS_CLASSNAME              = 'tinad-inline-dismiss';
  private dismissFunction:() => Promise<void>;

  constructor(dismissFunction:() => Promise<void>) {
    this.dismissFunction = dismissFunction;
    this.cannotRender = true;
    this.notificationElements = {
      outer: [],
      content: [],
      confirm: [],
      dismiss: [],
    };
    // console.log('Tinad inline: constructor done');
    this.bindDomElements();
  }

  public bindDomElements():void {
    // Set up TINAD notifications in the dom, either before/inside/after containers defined by the user,
    // or inside a .tinad-container element.
    // console.log(`Tinad inline constructor: ${JSON.stringify(configuration.inline,null,2)}`);
    const configuration = ConfigStore.getConfiguration();
    const inlineConfig = configuration.inline;
    if (inlineConfig && inlineConfig.target && inlineConfig.target.useDefaults) {
      // if user just passed our default container class, then we assume all the rest are defaults
      this.notificationElements.outer   = Array.from(document.querySelectorAll(`.${this.TINAD_CONTAINER_CLASSNAME}`));
      this.notificationElements.content = Array.from(document.querySelectorAll(`.${this.TINAD_CONTAINER_CLASSNAME} > .${this.TINAD_NOTIFICATION_CONTENT_CLASSNAME}`));
      this.notificationElements.confirm = Array.from(document.querySelectorAll(`.${this.TINAD_CONTAINER_CLASSNAME} > .${this.TINAD_CONFIRM_CLASSNAME}`));
      this.notificationElements.dismiss = Array.from(document.querySelectorAll(`.${this.TINAD_CONTAINER_CLASSNAME} > .${this.TINAD_DISMISS_CLASSNAME}`));
      this.cannotRender = false;
    } else {
      const target = inlineConfig?.target;
      if (target && target.outer && target.confirm && target.dismiss) {
        this.notificationElements.outer   = Array.from(document.querySelectorAll(`.${target.outer}`));
        this.notificationElements.content = Array.from(document.querySelectorAll(`.${target.outer} > .${target.content}`));
        this.notificationElements.confirm = Array.from(document.querySelectorAll(`.${target.outer} > .${target.confirm}`));
        this.notificationElements.dismiss = Array.from(document.querySelectorAll(`.${target.outer} > .${target.dismiss}`));
        this.cannotRender = false;
      }
    }
    for (const container of this.notificationElements.confirm) {
      container.onclick = async () => { await this.hideContainers(); };
    }
    for (const container of this.notificationElements.dismiss) {
      container.onclick = async () => { await this.hideContainers(); };
    }
  }

  private async hideContainers() {
    const configuration = ConfigStore.getConfiguration();
    console.log(`hideContainers, configuration=${JSON.stringify(configuration,null,2)}`);
    this.notificationElements?.outer?.forEach(notificationElement => {
      notificationElement.style.display = 'none';
    });
    console.log('inline hideContainers, currentNotificationUuid=', configuration.api.currentNotificationUuid);
    configuration.api.currentNotificationUuid && await this.dismissFunction?.();
  }

  private async setAndShowNotifications(content:string):Promise<void> {
    const configuration = ConfigStore.getConfiguration();
    console.log('setAndShowNotifications');
    // Insert content.
    const markedContent = await MarkdownLib.renderMarkdown(content);
    const protectedContent = MarkdownLib.protectMdStyles(markedContent);
    for (const notificationContentElement of this.notificationElements.content) {
      notificationContentElement.innerHTML = protectedContent;
    }
    // Show all containers.
    this.notificationElements.outer.forEach(notificationElement => {
      notificationElement.style.display = 'block';
    });
    this.notificationElements.confirm.forEach(notificationElement => {
      if (configuration.inline?.show?.confirm) {
        notificationElement.style.display = 'block';
      } else {
        notificationElement.style.display = 'none';
      }
    });
    this.notificationElements.dismiss.forEach(notificationElement => {
      if (configuration.inline?.show?.dismiss) {
        notificationElement.style.display = 'block';
      } else {
        notificationElement.style.display = 'none';
      }
    });

  }

  public show = async (notification:SDKNotification):Promise<void> => {
    const configuration = ConfigStore.getConfiguration();
    const content = notification.content || 'Default text';
    const uuid = notification.uuid;

    if (configuration.api.currentNotificationUuid) {
      console.log('Already displaying a notification, show() returning early');
      return;
    }

    // Fill all containers with the same content
    await this.setAndShowNotifications(content);

    console.log('inlineNotifications show: configuration.api.currentNotificationUuid=', configuration.api.currentNotificationUuid);

  }

  hide(): void {
    this.notificationElements?.outer?.forEach(notificationElement => {
      notificationElement.style.display = 'none';
    });
    console.log('Inline notifications programmatically hidden.');
  }

  public logNotificationUuid() {
    const configuration = ConfigStore.getConfiguration();
    console.log('inlineNotifications show: configuration.api.currentNotificationUuid=', configuration.api.currentNotificationUuid);
  }

}
