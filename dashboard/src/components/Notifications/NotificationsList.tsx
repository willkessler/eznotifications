import cx from 'clsx';
import { Anchor, Box, Button, Menu, ScrollArea, Switch, Table, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import classes from './Notifications.module.css';
import toast, { Toaster } from 'react-hot-toast';

import { useNotifications } from './NotificationsContext';

export function NotificationsList({onEdit, onCancel, displayBanner}) {
  const [scrolled, setScrolled] = useState(false);
  const { refreshToken, highlightedId } = useNotifications();
  const [notificationsState, setNotificationsState] = useState([]);

  // Set up the demo toaster
  const toastNotify = (message) => { 
    toast.success(message, {
      duration: 4000,
      position: 'top-center',

      // Styling
      style: {
        minWidth:'1000px',
        transition: "all 0.5s ease-out"
      },
      className: '',



      // Custom Icon
      icon: '👏',

      // Change colors of success/error/loading icon
      iconTheme: {
        primary: '#000',
        secondary: '#fff',
      },

      // Aria
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  };

  const updateNotificationStatus = async (notification, status) => {
    try {
      const modifiedNotification = {
        ...notification,
        live: status
      };
      const apiUrl = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}` +
            `/eznotifications/${notification.id}`;
      const response =
            await fetch(apiUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(modifiedNotification),
            });
      if (!response.ok) {
        throw new Error (`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error updating notification ${notification.id}: `, error);
      throw error;
    }
  };

  const handleSwitchChange = async (notification, checked) => {
    // Update local state
    const notificationId = notification.id;
    const savedCurrentNotifications = [...notificationsState];
    const updatedNotifications = notificationsState.map(notification => 
      notification.id === notificationId ? { ...notification, live: checked } : notification
    );
    setNotificationsState(updatedNotifications);

    // Update database
    try {
      const statusChangeResult = await updateNotificationStatus(notification, checked);
    } catch (error) {
      console.error('Failed to update notification status', error);
      // Revert the change in local state if the database update fails
      setNotificationsState(savedNotifications);      
    }
  };

  const sortNotifications = (data) => {
    return [...data].sort((a, b) => {
      // Group 1: Non-null startDate and not canceled
      if ((a.startDate !== null && a.live) && (b.startDate === null || !b.live)) {
        return -1;
      }
      if ((b.startDate !== null && b.live) && (a.startDate === null || !a.live)) {
        return 1;
      }

      // Group 2: Null startDate and not live
      if (a.startDate === null && a.live && !b.live) {
        return -1;
      }
      if (b.startDate === null && b.live && !a.live) {
        return 1;
      }

      // Group 3: Not Live notifications
      // For items within the same group, sort by content alphabetically
      return a.content.localeCompare(b.content);
    });
  };

  const getNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/eznotifications`);
      const data = await response.json();
      return data; // Return the fetched data
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return []; // Return empty array in case of error
    }
  };

  // Fetch the notifications list on component mount
  useEffect(() => {
    const acquireNotifications = async () => {
      try {
        const notifications = await getNotifications();
        const sortedNotifications = sortNotifications([...notifications]);
        setNotificationsState(sortedNotifications);
      } catch(error) {
        console.error('Error fetching notifications:', error);
      }
    };

    acquireNotifications();
  }, [refreshToken]);


  const editNotification = (notificationData) => {
    onEdit(notificationData);
  };

  const rows = notificationsState.map((row, index) => (
    <Table.Tr key={row.id || index} className={row.id === highlightedId ? classes['highlighted-row'] : ''}>
      <Table.Td>
        <Switch
          color="lime"
          checked={row.live}
          size="md"
          onLabel="ON"
          offLabel="OFF"
          onChange={(event) => handleSwitchChange(row, event.currentTarget.checked)}
        />
      </Table.Td>
      <Table.Td><Box w="300"><Text truncate="end">{row.content.length == 0 ? '(Not set)' : row.content }</Text></Box></Table.Td>
      <Table.Td>{row.pageId}</Table.Td>
      <Table.Td>{row.notificationType}</Table.Td>
      <Table.Td>{row.startDate == null ? '' : new Date(row.startDate).toLocaleString() }</Table.Td>
      <Table.Td>{row.endDate == null   ? '' : new Date(row.endDate).toLocaleString()}</Table.Td>
        <Table.Td>
          <Menu shadow="md" width={200}>
            <Menu.Target>
                <Anchor component="button" type="button">...</Anchor>
            </Menu.Target>
  
            <Menu.Dropdown>
              <Menu.Label>Previews</Menu.Label>
              <Menu.Item onClick={ () => { displayBanner(row.content.length==0 ? '(Not set)' : row.content) }}>
                <Text>Banner</Text>
              </Menu.Item>
              <Menu.Item onClick={ () => { toastNotify(row.content.length==0 ? '(Not set)' : row.content) }}>
                <Text>Toast</Text>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Label>Changes</Menu.Label>
              <Menu.Item onClick= { () => { editNotification(row); }}>
                <Text>Edit</Text>
              </Menu.Item>
              <Menu.Item>
                <Text>Duplicate</Text>
              </Menu.Item>
              <Menu.Item>
                <Text c={'#f00'}>Cancel</Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={700} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={1300} verticalSpacing="md" highlightOnHover >
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th> </Table.Th>
            <Table.Th>Contents</Table.Th>
            <Table.Th>Page</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Starts on</Table.Th>
            <Table.Th>Ends on</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
