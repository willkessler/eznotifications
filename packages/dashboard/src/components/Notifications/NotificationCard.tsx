import { Card, Group, Switch, Text, Title } from '@mantine/core';
import type EZNotification from '../../lib/shared_dts/EZNotification';
import { useNotifications } from './NotificationsContext';
import classes from './Notifications.module.css';

function NotificationCard({ notification } : {notification : EZNotification }) {
  const { 
    formatNotificationControlIcons,
    formatNotificationDatesBlock,
    formatNotificationConditionsBlock,
    handleSwitchChange,
  } = useNotifications();

  return (
      <Card shadow="sm" p="lg" radius="md" mb="md" key={notification.uuid}>
        <Group justify="space-between">
          <Title order={4} style={{maxWidth:'350px'}}>
            {notification.content}
          </Title>
          <Switch
            color="lime"
            checked={notification.live}
            size="sm"
            onLabel="ON"
            offLabel="OFF"
            onChange={(event) => handleSwitchChange(notification, event.currentTarget.checked)}
          />
        </Group>
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
