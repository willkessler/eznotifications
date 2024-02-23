import React from 'react';
import { Anchor, Button, Grid, Group, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useDisclosure } from '@mantine/hooks';
import { useNotifications } from './NotificationsContext';
import notificationClasses from './Notifications.module.css';

const NotificationsHeader = () => {
  const { openModal } = useNotifications();
  const [opened, handlers] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  if (isSmallScreen) {
    if (opened) {
      return null;
    }
    return (
      <div className={notificationClasses.notificationsListHeader}>
      
        <Group justify="space-between" style={{ marginBottom: '20px'}}>
          <Text size="xl" tt="capitalize" style={{ fontSize:'24px', marginLeft:'0px'}}>All Notifications</Text>
          <Button size="sm" onClick={() => { openModal(null) }} style={{ marginRight: '0px', backgroundColor: '#03acca' }}>+ Create a new notification</Button>
        </Group>
      </div>
      );
  }
  
  return (
    <div className={notificationClasses.notificationsListHeader}>
      
      <Group justify="space-between" style={{ marginBottom: '20px'}}>
        <Text size="xl" tt="capitalize" style={{ fontSize:'24px', marginLeft:'0px'}}>All Notifications</Text>
        <Button size="sm" onClick={() => { openModal(null) }} style={{ marginRight: '0px', backgroundColor: '#03acca' }}>+ Create a new notification</Button>
      </Group>
      <Grid gutter={{ base: 5, xs: 20, md: 20, xl: 20 }}>
        <Grid.Col span={1}>
          <span>Active?</span>
        </Grid.Col>
        <Grid.Col span={6}>
          <span style={{color:'#5c5'}}>What</span> <span style={{color:'#888'}}>Will It Tell Your User?</span>
        </Grid.Col>
        <Grid.Col span={3}>
          <span style={{color:'#5c5'}}>When</span> <span style={{color:'#888'}}>Will It Display?</span>
        </Grid.Col>
        <Grid.Col span={2}>
          <span style={{color:'#5c5'}}>Where</span> <span style={{color:'#888'}}>Will It Display?</span>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default NotificationsHeader;
