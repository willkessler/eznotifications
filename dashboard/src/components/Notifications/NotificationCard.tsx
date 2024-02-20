import { MediaQuery, Card, Text } from '@mantine/core';

function NotificationCard({ notification }) {
  return (
    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
      <Card shadow="sm" p="lg" radius="md" mb="md">
        <Text weight={500}>{notification.title}</Text>
        <Text size="sm">{notification.content}</Text>
        <Text size="xs">Start: {notification.startDate}</Text>
        <Text size="xs">End: {notification.endDate}</Text>
        <Text size="xs">Conditions: {notification.conditions}</Text>
      </Card>
    </MediaQuery>
  );
}

export default NotificationCard;
