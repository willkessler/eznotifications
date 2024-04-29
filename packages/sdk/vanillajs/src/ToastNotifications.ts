import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export interface ToastNotificationOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  stayOpen?: boolean;
  duration?: number; // Duration should be a number
  dismissFunction?: () => void;
}

export class ToastNotification {
  toastContainer: HTMLDivElement;
  duration: number;
  dismissFunction: () => void;

  constructor(options: ToastNotificationOptions) {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    this.duration = options.duration || 3000;
    const genericDismissFunction = () => { console.log('TINAD Toast dismissed') };
    this.dismissFunction = options.dismissFunction || genericDismissFunction;
    document.body.appendChild(this.toastContainer);
  }

  show( content = 'Default message' ) {
    // use toastify-js to actually display the toast
    Toastify({
      text: content,
      duration: this.duration,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      onClick: function(){} // Callback after click
    }).showToast();
  }

}
