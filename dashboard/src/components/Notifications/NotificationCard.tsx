import { Card, Text, Title } from '@mantine/core';
import { useNotifications } from './NotificationsContext';
import classes from './Notifications.module.css';

function NotificationCard({ notification }) {
  const { 
    formatNotificationDatesBlock,
    formatNotificationConditionsBlock,
  } = useNotifications();

  return (
      <Card shadow="sm" p="lg" radius="md" mb="md">
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
        </div>
      </div>
      </Card>
  );
}

export default NotificationCard;
