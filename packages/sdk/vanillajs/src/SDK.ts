import { SimpleToast, SimpleToastOptions } from './SimpleToast';
import { InlineNotifications } from './InlineNotifications';
import Toastify from 'toastify-js';

export class SDK {
  apiKey: string;
  apiEndpoint: string;
  apiEnvironments: string;
  apiDomains: string;
  inlineNotifications: InlineNotifications;

  constructor(apiEndpoint: string, apiKey: string, apiEnvironments: string, apiDomains: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;
    this.initializeToasts();
    this.inlineNotifications = new InlineNotifications();
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
/*
          const simpleToastOptions:Partial<SimpleToastOptions> = {
            content: notification.content,
            onClose: () => { console.log('toast closed') },
            duration:5000,
          };
          this.showToast(simpleToastOptions);
*/
          this.inlineNotifications.show(notification.content);
        });

      }

    } catch (error) {
      console.error(error);
    }
  }
}
