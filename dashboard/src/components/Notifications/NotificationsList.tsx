import cx from 'clsx';
import { Anchor, Box, Button, Menu, ScrollArea, Table, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import classes from './TableScrollArea.module.css';
import toast, { Toaster } from 'react-hot-toast';

import { useNotifications } from './NotificationsContext';

export function NotificationsList({onEdit, onCancel, displayBanner}) {
  const [scrolled, setScrolled] = useState(false);
  const { refreshToken } = useNotifications();

  const [notifications, setNotifications] = useState([]);

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

  const sortNotifications = (data) => {
    return data.sort((a, b) => {
      // Group 1: Non-null startDate and not canceled
      if (a.startDate !== null && !a.canceled && (b.startDate === null || b.canceled)) {
        return -1;
      }
      if (b.startDate !== null && !b.canceled && (a.startDate === null || a.canceled)) {
        return 1;
      }

      // Group 2: Null startDate and not canceled
      if (a.startDate === null && !a.canceled && b.canceled) {
        return -1;
      }
      if (b.startDate === null && !b.canceled && a.canceled) {
        return 1;
      }

      // Group 3: Canceled notifications
      // For items within the same group, sort by content alphabetically
      return a.content.localeCompare(b.content);
    });
  };


  // Fetch the notifications list on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      // Fetch records from the API
      fetch(`${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/eznotifications`)
        .then((response) => response.json())
        .then((data) => {
          setNotifications(data);
        })
        .catch((error) => console.error('Error fetching notifications:', error));
    };
    fetchNotifications();
  }, [refreshToken]);


    const editNotification = (notificationData) => {
      console.log('Editing record with id:', notificationData.id);
      onEdit(notificationData);
    };

    const sortedNotifications = sortNotifications(notifications);
    const rows = sortedNotifications.map((row, index) => (
    <Table.Tr key={row.id || index}>
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
        <Table.Td>{row.canceled ? 'X' : ''}</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={700} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={1300} verticalSpacing="md" highlightOnHover >
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>Contents</Table.Th>
            <Table.Th>Page ID</Table.Th>
            <Table.Th>Notification type</Table.Th>
            <Table.Th>Starts</Table.Th>
            <Table.Th>Ends</Table.Th>
            <Table.Th>Action</Table.Th>
            <Table.Th>Canceled</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
