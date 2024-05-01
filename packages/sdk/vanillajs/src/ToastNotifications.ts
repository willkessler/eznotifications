import Swal, { SweetAlertResult, SweetAlertPosition } from 'sweetalert2';
import './css/modalAndToastNotifications.css';

export interface ToastNotificationOptions {
  onClose?: () => void;
  styles?: Record<string, any>; // Define style as an object with string keys and any type values
  stayOpen?: boolean;
  duration?: number; // Duration should be a number
  dismissCallback: (notificationUuid: string) => void;
  position?: string;
}

const positionMap: Record<string, SweetAlertPosition> = {
  "top": "top",
  "top-start": "top-start",
  "top-end": "top-end",
  "center": "center",
  "center-start": "center-start",
  "center-end": "center-end",
  "bottom": "bottom",
  "bottom-start": "bottom-start",
  "bottom-end": "bottom-end",
};

export class ToastNotification {
  private toastContainer: HTMLDivElement;
  private duration: number;
  private dismissCallback: (notificationUuid: string) => void;
  private position: SweetAlertPosition;
  private toastOn: boolean = false;

  constructor(options: ToastNotificationOptions) {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    this.duration = options.duration || 5000;
    this.position = positionMap[options.position] || 'top-end';
    this.dismissCallback = options.dismissCallback;
    document.body.appendChild(this.toastContainer);
  }

  
  async show( content = 'Default message', notificationUuid: string ):Promise<boolean> {
    let timerInterval: number | null = null;

    if (this.toastOn) {
      return false; // do not try to show two toasts at once
    }

    this.toastOn = true;
    try {
      const swalOutcome: SweetAlertResult = await Swal.fire({
        toast:true,
        title: content,
        timer: this.duration,
        width: '20em',
        position: this.position,
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          const closeBtn = Swal.getPopup().querySelector('.close-btn');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => Swal.close());
          }
        },
      });
      if (swalOutcome.dismiss === Swal.DismissReason.timer) {
        console.log("Closed by the timer");
      } else if (swalOutcome.dismiss === Swal.DismissReason.cancel) {
        console.log(`Dismissed by : ${swalOutcome.dismiss}`);
      }
      await this.dismissCallback(notificationUuid);
      this.toastOn = false;
      return true;
    } catch (error) {
      console.error(`Error displaying toast: ${error}`);
    }
    return false;
  }
}
