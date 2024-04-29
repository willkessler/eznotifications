export interface ToastOptions {
  message: string;
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  stayOpen?: boolean;
  duration?: number; // Duration should be a number
}


export class Toast {
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
