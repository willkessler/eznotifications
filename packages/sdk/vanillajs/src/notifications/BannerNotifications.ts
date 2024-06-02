import '../css/bannerNotifications.css';
import { MarkdownLib } from '../lib/Markdown';
import { SDKConfiguration } from '../types';
import { SDKNotification } from '../../../react-core/src/types';
import { ConfigStore } from '../lib/ConfigStore';

export interface BannerOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  duration?: number; // Duration should be a number
  dismissCallback: (notificationUuid: string) => Promise<void>;
}

export class BannerNotification {
  private banner: HTMLDivElement | null;
  private bannerOn: boolean;
  //private content: string;
  private bannerTargets: {
    outer: string;
    slideDown: string;
    slideUp: string;
    content: string;
    dismiss: string;
  };
  
  constructor(dismissFunction:() => Promise<void>) {
    const configuration = ConfigStore.getConfiguration();
    this.bannerTargets = {
      outer: 'tinad-notification-banner',
      slideDown: 'slideDown',
      slideUp: 'slideUp',
      content: 'content',
      dismiss: 'dismiss',
    }

    if (configuration && configuration.banner && configuration.banner.target) {
      if (configuration.banner.target.outer) {
        this.bannerTargets.outer = configuration.banner.target.outer;
      }
      if (configuration.banner.target.slideDown) {
        this.bannerTargets.slideDown = configuration.banner.target.slideDown;
      }
      if (configuration.banner.target.slideUp) {
        this.bannerTargets.slideUp = configuration.banner.target.slideUp;
      }
      if (configuration.banner.target.content) {
        this.bannerTargets.content = configuration.banner.target.content;
      }
      if (configuration.banner.target.dismiss) {
        this.bannerTargets.dismiss = configuration.banner.target.dismiss;
      }
    }

    const existingBanner = document.getElementById(this.bannerTargets.outer);
    if (existingBanner === null) {
      this.banner = document.createElement('div');
      this.banner.id = this.bannerTargets.outer;
      document.body.appendChild(this.banner);
    } else {
      this.banner = existingBanner as HTMLDivElement;
    }

    this.banner.addEventListener('animationend', async () => {
      if (this.banner && this.banner.style && configuration.api && (this.banner.className === this.bannerTargets.slideUp)) {
        this.bannerOn = false;
        this.banner.style.display = 'none';
        console.log(`removeBanner calling dismiss on uuid: ${configuration.api.currentNotificationUuid}`);
        await dismissFunction();
      }
    });

    this.bannerOn = false;
  }
    
  removeBanner() {
    if (this.banner) {
      this.banner.className = this.bannerTargets.slideUp;
    }
  }

  public show = async (notification:SDKNotification):Promise<boolean> => {
    const configuration = ConfigStore.getConfiguration();
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
    if (this.banner) {
      this.banner.innerHTML = `<div>${protectedContent}</div>`;
    }
    
    // Create and insert "X" button for instant dismissal, if active
    if (configuration.banner && configuration.banner.show && configuration.banner.show.dismiss) {
      const dismissButton = document.createElement('button');
      dismissButton.className = this.bannerTargets.dismiss;
      dismissButton.textContent = 'x';
      dismissButton.onclick = () => this.removeBanner();
      if (this.banner) {
        this.banner.appendChild(dismissButton);
      }
    }
    
    if (this.banner) {
      this.banner.className = this.bannerTargets.slideDown;
      this.banner.style.display = 'flex';
    }

    this.bannerOn = true;

    setTimeout(() => {
      this.removeBanner();
      // Listen for the end of the animation to hide the banner
    }, configuration.banner?.duration);

    return true;
  }

  hide(): void {
    if (this.bannerOn) {
      this.bannerOn = false;
      if (this.banner) {
        this.banner.style.display = 'none';
      }
      console.log('Banner programmatically hidden.');
    }
  }
  
}
