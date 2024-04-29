import './css/bannerNotifications.css';

export interface BannerOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  duration?: number; // Duration should be a number
}

export class BannerNotification {
  banner: HTMLElement;
  duration: number;
  content:string;
  
  constructor(options: BannerOptions) {
    this.banner = document.getElementById('notification-banner');
    this.duration = options.duration || 5000;
    if (!this.banner) {
      this.banner = document.createElement('div');
      this.banner.id = 'notification-banner';
      document.body.appendChild(this.banner);
    }
  }
    
  removeBanner() {
    this.banner.className = 'slideUp';
    this.banner.addEventListener('animationend', () => {
      this.banner.style.display = 'none';
      this.banner.addEventListener('animationend', () => this.banner.style.display = 'none', { once: true }); // Only trigger this listener once
    });
  }

  show(content:string = 'Default message') {
  // Clear previous contents
    this.banner.innerHTML = '';

    // Insert content
    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    contentDiv.className = 'content';
    this.banner.appendChild(contentDiv);

    // Create and insert "X" button for instant dismissal
    const dismissButtonX = document.createElement('button');
    dismissButtonX.className = 'dismiss-x';
    dismissButtonX.textContent = 'x';
    dismissButtonX.onclick = () => this.removeBanner();
    this.banner.appendChild(dismissButtonX);
    
    this.banner.className = 'slideDown';

    setTimeout(() => {
      this.removeBanner();
      // Listen for the end of the animation to hide the banner
    }, this.duration);
  }
}
