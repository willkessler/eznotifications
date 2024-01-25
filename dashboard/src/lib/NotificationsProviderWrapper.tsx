// NotificationsProviderWrapper.js
import { NotificationsProvider } from '../components/Notifications/NotificationsContext';

const NotificationsProviderWrapper = ({ children }) => {
  return <NotificationsProvider>{children}</NotificationsProvider>;
};

export default NotificationsProviderWrapper;
