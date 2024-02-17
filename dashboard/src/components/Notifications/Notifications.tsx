import { useEffect } from 'react';

import { NotificationsProvider, useNotifications } from './NotificationsContext';
import toast, { Toaster } from 'react-hot-toast';

import PreviewBanner from '../Preview/PreviewBanner';
import PreviewModal from '../Preview/PreviewModal';
import NotificationsHeader from './NotificationsHeader';
import NotificationsList from './NotificationsList';
import NotificationsModal from './NotificationsModal';
import DeleteModal from './DeleteModal';
import { useSettings } from '../Account/SettingsContext';
import { useAPIKeys } from '../Account/APIKeysContext';
import { useUser } from "@clerk/clerk-react";

const Notifications = () => {

  const { setupClerkOrganizationAndMirrorRecords, isSetupComplete, setIsSetupComplete } = useSettings();
  const { createAPIKey } = useAPIKeys();
  const { user } = useUser();

  const componentLoadCallbackFn = () => {
    console.log("We've completed setting things up.");
  };

  useEffect(() => {
    console.log('Notifications component mount');
    if (!isSetupComplete) {
      setupClerkOrganizationAndMirrorRecords(componentLoadCallbackFn);
      setIsSetupComplete(true);
    }
    console.log('Notifications component completed');
  }, []);

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
