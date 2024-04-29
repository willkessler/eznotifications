import Swal from 'sweetalert2';
import './css/modalNotifications.css';

export class ModalNotification {
  show(content:string) {
    Swal.fire({
      allowOutsideClick: false,
      allowEscapeKey: true,
      allowEnterKey: true,
      text: content,
      showConfirmButton: true,
      showCloseButton: true,
      confirmButtonText: 'OK',
    });
  }
}
