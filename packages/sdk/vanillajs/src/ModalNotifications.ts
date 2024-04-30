import Swal, { SweetAlertResult } from 'sweetalert2';
import './css/modalNotifications.css';

export interface ModalNotificationOptions {
  dismissCallback: (notificationUuid: string) => void;
}

export class ModalNotification {
  private dismissCallback: (notificationUuid: string) => void;
  private modalOn: boolean;

  constructor(options: ModalNotificationOptions) {
    this.dismissCallback = options.dismissCallback;
    this.modalOn = false;
  }
  
  async show(content:string, notificationUuid: string):Promise<boolean> {
    if (this.modalOn) {
      return false; // do not try to show two modals at once
    }
    try {
      this.modalOn = true;
      const swalOutcome: SweetAlertResult = await Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: true,
        allowEnterKey: true,
        text: content,
        showConfirmButton: true,
        showCloseButton: true,
        confirmButtonText: 'OK',
      });

      if (swalOutcome.isConfirmed) {
        console.log('Confirm button clicked');
      } else if (swalOutcome.dismiss) {
        console.log(`Dismissed by: ${swalOutcome.dismiss}`);
      }
      await this.dismissCallback(notificationUuid);
      this.modalOn = false;
      return true;
    } catch (error) {
      console.error(`Error displaying modal: ${error}`);
    }
    return false;
  }
}
