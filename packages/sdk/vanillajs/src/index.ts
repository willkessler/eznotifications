// Assuming this file is `sdk.ts`

interface ToastOptions {
  message: string;
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  stayOpen?: boolean;
  duration?: number; // Duration should be a number
}

class SDK {
  apiKey: string;
  apiUrl: string = 'https://api.example.com/data'; // API endpoint

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

  pollApi() {
    fetch(`${this.apiUrl}?apiKey=${this.apiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((message: string) => this.showToast({ message }));
        }
      })
      .catch(console.error);
  }
}


class Toast {
  private toastContainer: HTMLDivElement;

  constructor() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }

  show(options: ToastOptions = { message: 'Default message' }) {
    const { message = "Default message" } = options; // Provide a default message
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Apply custom styles if any
    if (options.styles) {
      Object.assign(toast.style, options.styles);
    }

    // Auto-dismiss
    if (!options.stayOpen) {
      setTimeout(() => {
        if (this.toastContainer.contains(toast)) {
          this.toastContainer.removeChild(toast);
        }
      }, options.duration || 3000);
    }

    this.toastContainer.appendChild(toast);
  }

  // Static method to handle automatic initialization
  static init() {
    const instance = new Toast();
    return instance;
  }
}

// Adding event listener to initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  const scriptTag = document.getElementById('api-script') as HTMLScriptElement;
  const apiKey = scriptTag.getAttribute('data-api-key') || '';
  const sdk = new SDK(apiKey);
  sdk.pollApi();

  // Listen for custom events
  document.addEventListener('dismissToast', () => {
    console.log('Toast dismissed!');
  });

  const toaster = Toast.init();
  toaster.show({
    message: 'Welcome! This toast is auto-initialized on DOM content load.',
    duration: 5000
  });
});
