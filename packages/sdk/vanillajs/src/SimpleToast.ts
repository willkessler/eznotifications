import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export interface SimpleToastOptions {
  content: string;
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  stayOpen?: boolean;
  duration?: number; // Duration should be a number
}

export class SimpleToast {
  private toastContainer: HTMLDivElement;

  constructor() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }

  show(options: SimpleToastOptions = { content: 'Default message' }) {
    Toastify({
      text: options.content,
      duration: 3000,
      destination: "https://github.com/apvarun/toastify-js",
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "left", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
      onClick: function(){} // Callback after click
    }).showToast();
  }

  // Static method to handle automatic initialization
  static init() {
    const instance = new SimpleToast();
    return instance;
  }
}
