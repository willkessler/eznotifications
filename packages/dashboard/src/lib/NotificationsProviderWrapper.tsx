import React from 'react';
import { NotificationsProvider } from '../components/Notifications/NotificationsContext';

const NotificationsProviderWrapper:React.FC<{ children: React.ReactNode}> = ({ children }) => {
  return <NotificationsProvider>{children}</NotificationsProvider>;
};

export default NotificationsProviderWrapper;
