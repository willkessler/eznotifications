import { Card, Text, Title } from '@mantine/core';
import { useNotifications } from './NotificationsContext';
import classes from './Notifications.module.css';

function NotificationCard({ notification }) {
  const { 
    formatNotificationControlIcons,
    formatNotificationDatesBlock,
    formatNotificationConditionsBlock,
  } = useNotifications();

  return (
      <Card shadow="sm" p="lg" radius="md" mb="md" key={notification.id}>
        <Title order={4}>
          {notification.content}
        </Title>
        <div className={classes.cardDetails}>
        <div>
        { formatNotificationDatesBlock(notification) }
        </div>
        <div>
        { formatNotificationConditionsBlock(notification) }
        </div>
        <div className={classes.cardControls}>
          {formatNotificationControlIcons(notification,false)}
        </div>
      </div>
      </Card>
  );
}

export default NotificationCard;
