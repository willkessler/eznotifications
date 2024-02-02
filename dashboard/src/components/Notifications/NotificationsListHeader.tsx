import React from 'react';
import { Anchor, Button, Group, Text } from '@mantine/core';
import classes from './MainLayout.module.css';

const NotificationsListHeader = ({ openModal }) => {
  return (
    <Group justify="space-between" style={{ marginBottom: '20px'}}>
      <Text size="xl" tt="capitalize" style={{ fontSize:'24px'}}>All Notifications</Text>
      <Button size="sm" onClick={() => { openModal(null) }} style={{ marginLeft: '15px' }}>+ Create new notification</Button>
    </Group>
  );
}

export default NotificationsListHeader;

