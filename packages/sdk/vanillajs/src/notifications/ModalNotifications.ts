import Swal, { SweetAlertResult } from 'sweetalert2';
import '../css/modalAndToastNotifications.css';
import { SDKConfiguration } from '../types';
import { SDKNotification } from '../../../react-core/src/types';

export interface ModalNotificationOptions {
  dismissCallback: (notificationUuid: string) => void;
}

export class ModalNotification {
  private modalOn: boolean;
  private configuration: SDKConfiguration;

  constructor(configuration: SDKConfiguration) {
    this.configuration = configuration;
    this.modalOn = false;
  }
  
  async show(notification:SDKNotification):Promise<boolean> {
    const content = notification.content || 'Default text';
    const uuid = notification.uuid;

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
        confirmButtonText: this.configuration.modal.confirmButtonLabel,
      });

      if (swalOutcome.isConfirmed) {
        console.log('Confirm button clicked');
      } else if (swalOutcome.dismiss) {
        console.log(`Dismissed by: ${swalOutcome.dismiss}`);
      }
      await this.configuration.api.dismissFunction(uuid);
      this.modalOn = false;
      return true;
    } catch (error) {
      console.error(`Error displaying modal: ${error}`);
    }
    return false;
  }

  hide(): void {
    if (this.modalOn && Swal.isVisible()) {
      Swal.close();
      this.modalOn = false;
      console.log('Modal programmatically hidden, but not dismissed.');
    }
  }

}
