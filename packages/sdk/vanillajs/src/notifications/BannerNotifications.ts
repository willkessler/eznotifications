import '../css/bannerNotifications.css';
import { MarkdownLib } from '../lib/Markdown';
import { SDKConfiguration } from '../types';
import { SDKNotification } from '../../../react-core/src/types';

export interface BannerOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  duration?: number; // Duration should be a number
  dismissCallback: (notificationUuid: string) => Promise<void>;
}

export class BannerNotification {
  private banner: HTMLElement;
  private bannerOn: boolean;
  private configuration: SDKConfiguration;
  private currentNotificationUuid: string;
  private content: string;
  private bannerTargets: {
    outer: string;
    slideDown: string;
    slideUp: string;
    content: string;
    dismiss: string;
  };
  
  constructor(configuration:SDKConfiguration) {
    this.configuration = configuration;
    this.bannerTargets = {
      outer: 'notification-banner',
      slideDown: 'slideDown',
      slideUp: 'slideUp',
      content: 'content',
      dismiss: 'dismiss',
    }

    if (this.configuration.banner.target) {
      if (this.configuration.banner.target.outer) {
        this.bannerTargets.outer = this.configuration.banner.target.outer;
      }
      if (this.configuration.banner.target.outer) {
        this.bannerTargets.slideDown = this.configuration.banner.target.slideDown;
      }
      if (this.configuration.banner.target.outer) {
        this.bannerTargets.slideUp = this.configuration.banner.target.slideUp;
      }
      if (this.configuration.banner.target.outer) {
        this.bannerTargets.content = this.configuration.banner.target.content;
      }
      if (this.configuration.banner.target.dismiss) {
        this.bannerTargets.dismiss = this.configuration.banner.target.dismiss;
      }
    }

    this.banner = document.getElementById('notification-banner');
    if (this.banner) {
      this.banner.remove(); // remove element if previously existing
    }
    this.banner = document.createElement('div');
    this.banner.id = this.bannerTargets.outer;
    document.body.appendChild(this.banner);

    this.banner.addEventListener('animationend', async () => {
      if (this.banner.className === this.bannerTargets.slideUp) {
        this.bannerOn = false;
        this.banner.style.display = 'none';
        console.log(`removeBanner calling dismiss on uuid: ${this.currentNotificationUuid}`);
        await this.configuration.api.dismissFunction(this.currentNotificationUuid);
      }
    });

    this.bannerOn = false;
  }
    
  removeBanner() {
    this.banner.className = this.bannerTargets.slideUp;
  }

  public show = async (notification:SDKNotification):Promise<boolean> => {
    const content = notification.content || 'Default text';
    const uuid = notification.uuid;

    if (this.bannerOn) {
      console.log('Banner currently showing, not running show.');
      return false;
    }
    console.log(`Showing banner with content: ${content}`);
    // Clear previous contents
    const markedContent =  await MarkdownLib.renderMarkdown(content);
    const protectedContent = MarkdownLib.protectMdStyles(markedContent);
    this.banner.innerHTML = `<div>${protectedContent}</div>`;
    
    // Create and insert "X" button for instant dismissal, if active
    if ((this.configuration.banner.show?.dismiss) ||
      (!this.configuration.banner.show)) {
      const dismissButton = document.createElement('button');
      dismissButton.className = this.bannerTargets.dismiss;
      dismissButton.textContent = 'x';
      dismissButton.onclick = () => this.removeBanner();
      this.banner.appendChild(dismissButton);
    }
    
    this.banner.className = this.bannerTargets.slideDown;
    this.banner.style.display = 'flex';

    this.currentNotificationUuid = uuid;
    this.bannerOn = true;

    setTimeout(() => {
      this.removeBanner();
      // Listen for the end of the animation to hide the banner
    }, this.configuration.banner.duration);

    return true;
  }

  hide(): void {
    if (this.bannerOn) {
      this.bannerOn = false;
      this.banner.style.display = 'none';
      console.log('Banner programmatically hidden.');
    }
  }
  
}
