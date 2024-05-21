import Swal, { SweetAlertResult } from 'sweetalert2';
import { MarkdownLib } from '../lib/Markdown';
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
      console.log(`Inside ModalNotification constructor we have configuration: ${JSON.stringify(this.configuration,null,2)}`);
      let showConfirm = true;
      let showDismiss = true;
      const { modal } = this.configuration;
      if (modal?.show) {
        showConfirm = modal.show.confirm ?? showConfirm;
        showDismiss = modal.show.dismiss ?? showDismiss;
      }

      const markedContent =  await MarkdownLib.renderMarkdown(content);
      const protectedContent = MarkdownLib.protectMdStyles(markedContent);
      console.log(`markedContent: ${markedContent}`);
      // these all come from swal2: https://sweetalert2.github.io/#customClass
      const customClassObject = { 
        container: 'tinad-custom-modal-container',
        popup: 'tinad-custom-modal-popup',
        header: 'tinad-custom-modal-header',
        title: 'tinad-custom-modal-title',
        closeButton: 'tinad-custom-modal-closeButton',
        htmlContainer: 'tinad-custom-modal-htmlContainer',
        confirmButton: 'tinad-custom-modal-confirmButton',
        footer: 'tinad-custom-modal-footer',
      };

      const swalOutcome:SweetAlertResult = await Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: true,
        allowEnterKey: true,
        html: protectedContent,
        customClass: (this.configuration.modal?.useCustomClasses ? customClassObject : {}),
        showConfirmButton: showConfirm,
        showCloseButton: showDismiss,
        confirmButtonText: (modal?.confirmButtonLabel ? modal.confirmButtonLabel : 'OK'),
      });

      if (swalOutcome.isConfirmed) {
        console.log('Confirm button clicked');
      } else if (swalOutcome.dismiss) {
        console.log(`Dismissed by: ${swalOutcome.dismiss}`);
      }
      uuid && await this.configuration?.api?.dismissFunction?.(uuid);
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
