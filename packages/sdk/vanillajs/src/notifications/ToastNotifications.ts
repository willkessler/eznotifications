import Swal, { SweetAlertResult, SweetAlertPosition } from 'sweetalert2';
import { MarkdownLib } from '../lib/Markdown';
import '../css/modalAndToastNotifications.css';
import { SDKConfiguration } from '../types';
import { SDKNotification } from '../../../react-core/src/types';

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
  "top-left": "top-start",
  "top-right": "top-end",
  "center": "center",
  "center-left": "center-start",
  "center-right": "center-end",
  "bottom": "bottom",
  "bottom-left": "bottom-start",
  "bottom-right": "bottom-end",
};

export class ToastNotification {
  private toastContainer: HTMLDivElement;
  private configuration: SDKConfiguration;
  private toastOn: boolean = false;

  constructor(configuration: SDKConfiguration) {
    this.configuration = configuration;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }

  
  async show( notification: SDKNotification ):Promise<boolean> {
    const content = notification.content || 'Default text';
    const uuid = notification.uuid;
    
    let timerInterval: number | null = null;

    if (this.toastOn) {
      return false; // do not try to show two toasts at once
    }

    this.toastOn = true;
    const markedContent = await MarkdownLib.renderMarkdown(content);
    const protectedContent = MarkdownLib.protectMdStyles(markedContent);
    const customClassObject = { // these all come from swal2: https://sweetalert2.github.io/#customClass
      container: 'tinad-custom-toast-container',
      popup: 'tinad-custom-toast-popup',
      header: 'tinad-custom-toast-header',
      title: 'tinad-custom-toast-title',
      closeButton: 'tinad-custom-toast-closeButton',
      htmlContainer: 'tinad-custom-toast-htmlContainer',
      actions: 'tinad-custom-toast-actions',
      confirmButton: 'tinad-custom-toast-confirmButton',
      denyButton: 'tinad-custom-toast-denyButton',
      cancelButton: 'tinad-custom-toast-cancelButton',
      footer: 'tinad-custom-toast-footer',
      timerProgressBar: 'tinad-custom-toast-timerProgressBar',
    };

    try {
      const swalOutcome: SweetAlertResult = await Swal.fire({
        toast:true,
        html: protectedContent,
        timer: this.configuration?.toast?.duration ?? 5000,
        timerProgressBar: this.configuration.toast?.progressBar,
        customClass: (this.configuration.toast?.useCustomClasses ? customClassObject : {}),
        width: '20em',
        position: positionMap[this.configuration?.toast?.position ?? 'top-right'],
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          const closeBtn = Swal.getPopup()?.querySelector('.close-btn') as HTMLElement | null;
          if (closeBtn) {
            closeBtn.addEventListener('click', () => Swal.close());
          }
        }
      });
      if (swalOutcome.dismiss === Swal.DismissReason.timer) {
        console.log("Closed by the timer");
      } else if (swalOutcome.dismiss === Swal.DismissReason.cancel) {
        console.log(`Dismissed by : ${swalOutcome.dismiss}`);
      }
      uuid && await this.configuration?.api?.dismissFunction?.(uuid);
      this.toastOn = false;
      return true;
    } catch (error) {
      console.error(`Error displaying toast: ${error}`);
    }
    return false;
  }
  
  hide(): void {
    if (this.toastOn && Swal.isVisible()) {
      Swal.close();
      this.toastOn = false;
      console.log('Toast programmatically hidden.');
    }
  }


}
