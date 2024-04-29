import { SimpleToast, SimpleToastOptions } from './SimpleToast';
import { InlineNotifications } from './InlineNotifications';
import { ModalNotification } from './ModalNotification';
import { BannerNotification } from './BannerNotification';
import Toastify from 'toastify-js';

export class SDK {
  toastNotification: SimpleToast;
  inlineNotifications: InlineNotifications;
  modalNotification: ModalNotification;
  bannerNotification: BannerNotification;
  apiKey: string;
  apiEndpoint: string;
  apiEnvironments: string;
  apiDomains: string;
  displayMode: string;

  constructor(apiEndpoint: string, apiKey: string, apiEnvironments: string, apiDomains: string, displayMode: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;
    this.initializeToasts();
/*
    const simpleToastOptions:Partial<SimpleToastOptions> = {
      onClose: () => { console.log('toast closed') },
      duration:5000,
    };
*/

    this.toastNotification = new SimpleToast();
    this.inlineNotifications = new InlineNotifications();
    this.modalNotification = new ModalNotification();
    this.bannerNotification = new BannerNotification({ okButtonText:'Got it', duration: 3000 });
    this.displayMode = displayMode;
  }

  initializeToasts() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  showToast(options: Partial<SimpleToastOptions>) {
    const { content, onClose } = options;
    Toastify({
      text: options.content,
      duration: options.duration,
      destination: "https://github.com/apvarun/toastify-js",
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "left", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#000",
        color: '#fff',
        padding: '20px',
      },
      onClick: onClose,
    }).showToast();

  }


  async pollApi() {
    const fetchOptions = {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${this.apiKey}`, 
        'Content-type': 'application/json' ,
        'X-Tinad-Source': 'vanillajsSdk',
      }),
    }

    try {
      const fullUrl = `${this.apiEndpoint}/notifications?environments=${this.apiEnvironments}`;
      const response = await fetch(fullUrl, fetchOptions);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        console.log('data:', data);
        data.forEach((notification) => {
          console.log('Content:', notification.content);
          switch (this.displayMode) {
            case 'toast':
              //this.showToast(simpleToastOptions);
              break;
            case 'inline':
              this.inlineNotifications.show(notification.content);
              break;
            case 'modal':
              this.modalNotification.show(notification.content);
              break;
            case 'banner':
              this.bannerNotification.show(notification.content);
              break;
          }
        });

      }

    } catch (error) {
      console.error(error);
    }
  }
}
