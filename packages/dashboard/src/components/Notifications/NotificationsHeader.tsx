import React from 'react';
import { Anchor, Box, Button, Checkbox, Grid, Group, Text, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useDisclosure } from '@mantine/hooks';
import { useNotifications } from './NotificationsContext';
import notificationClasses from './Notifications.module.css';

const NotificationsHeader:React.FC = () => {
  const { openModal } = useNotifications();
  const [opened, handlers] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { displayPastNotifications, setDisplayPastNotifications } = useNotifications();

  const handleShowPastNotificationsChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    // Save to localStorage
    localStorage.setItem('displayPastNotifications', isChecked.toString());
    setDisplayPastNotifications(isChecked);
  }

  if (isSmallScreen) {
    if (opened) {
      return null;
    }
    return (
      <div className={notificationClasses.notificationsListHeader}>
      
        <Group justify="space-between" style={{ marginBottom: '20px'}}>
          <Text size="xl" tt="capitalize" style={{ fontSize:'24px', marginLeft:'0px'}}>All Notifications</Text>
          <Checkbox 
            checked={displayPastNotifications}
            onChange={handleShowPastNotificationsChange} 
            label="Include past notifications"
          />
          <Button size="sm" onClick={() => { openModal(null) }} style={{ marginRight: '0px', backgroundColor: '#03acca' }}>+ Create a new notification</Button>
        </Group>
      </div>
      );
  }
  
  return (
    <div className={notificationClasses.notificationsListHeader}>
      
      <Group justify="space-between" style={{ marginBottom: '20px'}}>
        <Group justify="flex-left">
          <Text size="xl" tt="capitalize" style={{ fontSize:'24px', marginLeft:'0px'}}>All Notifications</Text>
          <Tooltip openDelay={1000} label="Show scheduled notifications that ended before right now" position="bottom" withArrow>
            <Box>
              <Checkbox
                style={{marginLeft:'10px'}}
                size="xs"
                checked={displayPastNotifications}
                onChange={handleShowPastNotificationsChange} 
                label={<span>Include past notifications</span>}
              />
            </Box>
          </Tooltip>
        </Group>
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
