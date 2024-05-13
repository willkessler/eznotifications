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
  
  constructor(configuration:SDKConfiguration) {
    this.configuration = configuration;
    this.banner = document.getElementById('notification-banner');
    if (!this.banner) {
      this.banner = document.createElement('div');
      this.banner.id = 'notification-banner';
      document.body.appendChild(this.banner);
    }

    this.banner.addEventListener('animationend', async () => {
      if (this.banner.className === 'slideUp') {
        this.bannerOn = false;
        this.banner.style.display = 'none';
        console.log(`removeBanner calling dismiss on uuid: ${this.currentNotificationUuid}`);
        await this.configuration.api.dismissFunction(this.currentNotificationUuid);
      }
    });

    this.bannerOn = false;
  }
    
  removeBanner() {
    this.banner.className = 'slideUp';
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
    this.banner.innerHTML = `<div>${markedContent}</div>`;
    
    // Create and insert "X" button for instant dismissal
    const dismissButtonX = document.createElement('button');
    dismissButtonX.className = 'dismiss-x';
    dismissButtonX.textContent = 'x';
    dismissButtonX.onclick = () => this.removeBanner();
    this.banner.appendChild(dismissButtonX);
    
    this.banner.className = 'slideDown';
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
