import React from 'react';
import { Anchor, Button, Group, Text } from '@mantine/core';
import { useNotifications } from './NotificationsContext';
import classes from './MainLayout.module.css';

const NotificationsHeader = () => {
  const { openModal } = useNotifications();
  return (
    <Group justify="space-between" style={{ marginBottom: '20px'}}>
      <Text size="xl" tt="capitalize" style={{ fontSize:'24px', marginLeft:'10px'}}>Your Notifications</Text>
      <Button size="sm" onClick={() => { openModal(null) }} style={{ marginRight: '30px' }}>+ Create a new notification</Button>
    </Group>
  );
}

export default NotificationsHeader;
