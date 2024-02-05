import { NotificationsProvider, useNotifications } from './NotificationsContext';
import toast, { Toaster } from 'react-hot-toast';

import PreviewBanner from '../Preview/PreviewBanner';
import PreviewModal from '../Preview/PreviewModal';
import NotificationsHeader from './NotificationsHeader';
import NotificationsList from './NotificationsList';
import NotificationsModal from './NotificationsModal';
import DeleteModal from './DeleteModal';

const Notifications = () => {

  return (
      <>
          <NotificationsProvider>
            <NotificationsHeader />
            <NotificationsList />
            <NotificationsModal />
            <PreviewBanner />
            <PreviewModal />
            <DeleteModal />
            <Toaster />
          </NotificationsProvider>
      </>
  );
}

export default Notifications;
