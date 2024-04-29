import Swal from 'sweetalert2';
//import './css/modalNotifications.css';

export class ModalNotification {
  show(content:string) {
    Swal.fire({
      title: 'Notification',
      text: content,
      confirmButtonText: 'OK',
    });
  }
}
