import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export interface ToastNotificationOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  stayOpen?: boolean;
  duration?: number; // Duration should be a number
  dismissCallback: (notificationUuid: string) => void;
}

export class ToastNotification {
  private toastContainer: HTMLDivElement;
  private duration: number;
  private dismissCallback: (notificationUuid: string) => void;
  private notificationUuid: string;

  constructor(options: ToastNotificationOptions) {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    this.duration = options.duration || 3000;
    this.dismissCallback = options.dismissCallback;
    document.body.appendChild(this.toastContainer);
  }

  show( content = 'Default message', notificationUuid: string ) {
    this.notificationUuid = notificationUuid;
    // use toastify-js to actually display the toast
    Toastify({
      text: content,
      duration: this.duration,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
    }).showToast();
  }

}
