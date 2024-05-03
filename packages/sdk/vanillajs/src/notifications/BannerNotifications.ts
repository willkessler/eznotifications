import '../css/bannerNotifications.css';
import { MarkdownLib } from '../lib/Markdown';
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
  private dismissCallback: (notificationUuid: string) => Promise<void>;
  private currentNotificationUuid: string;
  private duration: number;
  private content: string;
  
  constructor(options: BannerOptions) {
    this.banner = document.getElementById('notification-banner');
    if (!this.banner) {
      this.banner = document.createElement('div');
      this.banner.id = 'notification-banner';
      document.body.appendChild(this.banner);
    }

    this.banner.addEventListener('animationend', () => {
      if (this.banner.className === 'slideUp') {
        this.bannerOn = false;
        this.banner.style.display = 'none';
        console.log(`removeBanner calling dismiss on uuid: ${this.currentNotificationUuid}`);
        this.dismissCallback(this.currentNotificationUuid);
      }
    });

    this.bannerOn = false;
    this.duration = options.duration || 5000;
    this.dismissCallback = options.dismissCallback;
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
    this.banner.innerHTML = '';

    // Insert content
    await MarkdownLib.insertMarkdownInDOM(content, this.banner, 'div', 'content');

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
    }, this.duration);

    return true;
  }
}
