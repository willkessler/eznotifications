import './css/bannerNotifications.css';

export interface BannerOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  duration?: number; // Duration should be a number
  okButtonText?: string;
}

export class BannerNotification {
  banner: HTMLElement;
  duration: number;
  okButtonText: string;
  content:string;
  
  constructor(options: BannerOptions) {
    this.banner = document.getElementById('notification-banner');
    this.okButtonText = options.okButtonText || 'OK';
    this.duration = options.duration || 5000;
    if (!this.banner) {
      this.banner = document.createElement('div');
      this.banner.id = 'notification-banner';
      document.body.appendChild(this.banner);
      this.banner.className = 'slideDown';
    }
  }
    
  show(content:string = 'Default message') {
    this.banner.textContent = content;
    this.banner.className = 'slideDown';
    setTimeout(() => {
      this.banner.className = 'slideUp';

      // Listen for the end of the animation to hide the banner
      this.banner.addEventListener('animationend', () => {
        this.banner.style.display = 'none';
      }, { once: true });  // Only trigger this listener once
    }, this.duration);
  }
  
}
