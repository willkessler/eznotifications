import { Toast, ToastOptions } from './Toast';

export class SDK {
  apiKey: string;
  apiEndpoint: string;
  apiEnvironments: string;
  apiDomains: string;

  constructor(apiEndpoint: string, apiKey: string, apiEnvironments: string, apiDomains: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;
    this.initializeToasts();
  }

  initializeToasts() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  showToast(options: ToastOptions) {
    const { message, onClose } = options;
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';

    toast.onclick = () => {
      document.getElementById('toast-container')?.removeChild(toast);
      if (onClose) {
        onClose();
      }
    };

    document.getElementById('toast-container')?.appendChild(toast);

    setTimeout(() => {
      toast.click(); // Automatically close after 5 seconds
    }, 5000);
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
      if (data.messages && Array.isArray(data.messages)) {
        data.messages.forEach((message: string) => this.showToast({ message }));
      }
    } catch (error) {
      console.error(error);
    }
  }
}
