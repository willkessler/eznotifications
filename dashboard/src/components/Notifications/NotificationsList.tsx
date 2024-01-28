import cx from 'clsx';
import { Anchor, Box, Button, Menu, Modal, Pill, ScrollArea, Spoiler, Switch, Table, Text, Tooltip, rem } from '@mantine/core';
import { IconArrowElbowRight, IconEdit, IconFlag2Filled, IconBread, IconAppWindow, IconCopy } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import classes from './Notifications.module.css';
import toast, { Toaster } from 'react-hot-toast';

import { useNotifications } from './NotificationsContext';

export function NotificationsList({onEdit, onCancel, displayBanner, displayPreviewModal, closePreviewModal }) {
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

  const formatDisplayDate = (date) => {
      return (date == null ? '' : 
          new Date(date).toLocaleString('en-US', 
                                        { weekday: 'short', 
                                          year: 'numeric', 
                                          month: 'short', 
                                          day: 'numeric', 
                                          hour: '2-digit', 
                                          minute: '2-digit' }
                                       )
           );
  };
    
  const rows = notificationsState.map((row, index) => (
    <Table.Tr key={row.id || index} className={row.id === highlightedId ? classes['highlighted-row'] : ''}>
      <Table.Td className={classes.tableCellToTop}>
        <Switch
          color="lime"
          checked={row.live}
          size="md"
          onLabel="ON"
          offLabel="OFF"
          onChange={(event) => handleSwitchChange(row, event.currentTarget.checked)}
        />
      </Table.Td>
      <Table.Td className={`${classes.tableCellToTop} ${classes.tableCellWithHover}`}>
         <Box w="400">
            <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Hide">
              <Text>{row.content.length === 0 ? '(Not set)' : row.content}</Text>
            </Spoiler>
            <div className={`${classes.hoverIcons}`}>
              <Tooltip openDelay={1000} label="Edit this notification" position="bottom" withArrow>
               <Anchor component="button" type="button" onClick={ () => { editNotification(row)}} >
                  <IconEdit size={20}  style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Duplicate this notification" position="bottom" withArrow>
                <IconCopy size={20}  style={{ marginRight: '10px', cursor:'pointer' }} />
              </Tooltip>
              &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
              <Tooltip openDelay={1000} label="Banner preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { displayBanner(row.content.length==0 ? '(Not set)' : row.content) }}>
                  <IconFlag2Filled size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Popup preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { displayPreviewModal(row.content.length==0 ? '(Not set)' : row.content) }}>
                  <IconAppWindow size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Toast preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { toastNotify(row.content.length==0 ? '(Not set)' : row.content) }}>
                  <IconBread size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
            </div>
          </Box>
      </Table.Td>
      <Table.Td className={classes.tableCellToTop}>
          Page: {(row.pageId ? <Text size="sm" style={{ margin:'2px', padding:'1px', border: '1px dotted #aaa'}} span className={classes.pageId}>{row.pageId}</Text> : '(not set)')}<br/>
          Environments: <Pill style={{ backgroundColor: 'lightblue', color: 'navy' }} radius="xs">{row.environment ? row.environment : 'All'}</Pill><br/>
        Type:<Pill radius="sm">{row.notificationType ? row.notificationType : 'Any'}</Pill>
      </Table.Td>
      <Table.Td className={classes.tableCellToTop}>
          {formatDisplayDate(row.startDate)} <br />
          <IconArrowElbowRight style={{transform: 'rotate(45deg)', padding:'2px', marginTop:'2px' }} color="orange" />
          {formatDisplayDate(row.endDate)}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={700} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={1300} verticalSpacing="md" highlightOnHover >
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th> </Table.Th>
            <Table.Th>Notification Contents</Table.Th>
            <Table.Th>Display Conditions</Table.Th>
            <Table.Th>Timeframe</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
