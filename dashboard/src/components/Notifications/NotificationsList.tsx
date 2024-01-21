import cx from 'clsx';
import { Table, ScrollArea } from '@mantine/core';
import { useState, useEffect } from 'react';
import classes from './TableScrollArea.module.css';

import { useNotifications } from './NotificationsContext';

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

    const rows = notifications.map((row, index) => (
    <Table.Tr key={row.id || index}>
      <Table.Td>{row.content}</Table.Td>
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
