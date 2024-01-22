import cx from 'clsx';
import { Table, ScrollArea } from '@mantine/core';
import { useState, useEffect } from 'react';
import classes from './TableScrollArea.module.css';

import { useNotifications } from './NotificationsContext';

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


export function NotificationsList(parameters) {
    const [scrolled, setScrolled] = useState(false);
    const { refreshToken } = useNotifications();

    const [notifications, setNotifications] = useState([]);

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


    const sortedNotifications = sortNotifications(notifications);
    const rows = sortedNotifications.map((row, index) => (
    <Table.Tr key={row.id || index}>
      <Table.Td>{row.content.length > 100 ? row.content.substr(0,100) + '...' : (row.content.length == 0 ? '(Not set)' : row.content) }</Table.Td>
      <Table.Td>{row.startDate == null ? '' : new Date(row.startDate).toLocaleString() }</Table.Td>
      <Table.Td>{row.endDate == null   ? '' : new Date(row.endDate).toLocaleString()}</Table.Td>
      <Table.Td>{row.pageId}</Table.Td>
      <Table.Td>{row.canceled ? 'X' : ''}</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={700} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={1000} verticalSpacing="md" highlightOnHover >
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>Contents</Table.Th>
            <Table.Th>Starts</Table.Th>
            <Table.Th>Ends</Table.Th>
            <Table.Th>Page ID</Table.Th>
            <Table.Th>Canceled?</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
