import cx from 'clsx';
import { Anchor, Box, Button, Menu, Modal, Pill, ScrollArea, Spoiler, Switch, Table, Text, Tooltip, rem } from '@mantine/core';
import { IconArrowElbowRight, 
         IconEdit, 
         IconLayoutNavbarExpand, 
         IconMessageDown, 
         IconAlignBoxCenterMiddle, 
         IconCopy, 
         IconInfoCircle,
         IconTrash,
         IconFidgetSpinner } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import classes from './Notifications.module.css';
import toast, { Toaster } from 'react-hot-toast';

import { useNotifications } from './NotificationsContext';
import { addPreviewCaveatToString } from '../../lib/RenderMarkdown';

const NotificationsList = ({displayPreviewModal, closePreviewModal }) => {
    const [ scrolled, setScrolled ] = useState(false);
    const { openModal, showBanner, showPreviewModal, showDeleteModal, 
            highlightedId, notifications, submitNotification, fetchNotifications,
            notificationsLoading } = useNotifications();
    // const [notificationsState, setNotificationsState] = useState([]);

  // Set up the demo toaster
  const toastNotify = (message) => { 
    const caveatedMessage = addPreviewCaveatToString(message);
    toast.success(caveatedMessage, {
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

  // handle turning a notification on and off
  const handleSwitchChange = async (notificationData, checked) => {
      const notificationDataCopy = {
          ...notificationData,
      };

      notificationDataCopy.live = checked;
      notificationDataCopy.editing = true;
      notificationDataCopy.updatedAt = new Date().toISOString();
      await submitNotification(notificationDataCopy);
  }

  const formatCreateInfo = (notificationData) => {
    const jsDate = new Date(notificationData.createdAt);
    const humanFormattedDate = jsDate.toLocaleDateString() + ' ' + jsDate.toLocaleTimeString();
    return (
        <>
        Created: {humanFormattedDate} by Schmingle
      </>
    );
  };
  
  useEffect(() => {
      const fetchData = async () => {
          await fetchNotifications();
      };

      fetchData();
  }, [fetchNotifications]);
    
    const formatDisplayDate = (prefix, date) => {
      return (date == null ? '' : 
          prefix + ': ' +
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
    
  let rows;
  if (notificationsLoading) {
      rows = (
          <Table.Tr key={1}>
              <Table.Td>
              <Text size="sm" style={{fontStyle:'italic'}}>Loading...</Text>
              </Table.Td>
           </Table.Tr>
      );
  } else if (notifications.length === 0) {
      console.log('no notifs');
    rows = (
        <Table.Tr key={1} >
            <Table.Td>
            &nbsp;
            </Table.Td>
            <Table.Td>
              <Text style={{ fontStyle: 'italic' }}>
                Your notifications will appear here once you have created one.  <Anchor href="https://tellyourusers-help-pages.super.site">Need help?</Anchor>
              </Text>
            <Button onClick={() => 
                { openModal(null) }} style={{ marginTop: '15px', marginLeft:'15px' }}>+ Create my first notification
            </Button>
            </Table.Td>
            <Table.Td>
              &nbsp;
            </Table.Td>
        </Table.Tr>
    );
  } else {
  rows = notifications.map((row, index) => (
    <Table.Tr key={row.id || index} className={row.id === highlightedId ? classes['highlighted-row'] : ''}>
      <Table.Td className={classes.tableCellToTop}>
        <Switch
          color="lime"
          checked={row.live}
          size="sm"
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
               <Anchor component="button" type="button" onClick={ () => { openModal(row)}} >
                  <IconEdit size={20}  style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Delete this notification" position="bottom" withArrow>
               <Anchor component="button" type="button" onClick={ () => { showDeleteModal(row)}} >
                  <IconTrash size={20}  style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label={formatCreateInfo(row)} position="bottom" withArrow>
               <Anchor component="button" type="button">
                  <IconInfoCircle size={20}  style={{ marginRight: '10px' }} />
                </Anchor>
              </Tooltip>
              &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
              <Tooltip openDelay={1000} label="Banner preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { showBanner(row.content.length==0 ? '(Not set)' : row.content) }}>
                  <IconLayoutNavbarExpand size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Modal preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { showPreviewModal(row.content.length==0 ? '(Not set)' : row.content) }}>
                  <IconAlignBoxCenterMiddle size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Toast preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { toastNotify(row.content.length==0 ? '(Not set)' : row.content) }}>
                  <IconMessageDown size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
            </div>
          </Box>
      </Table.Td>
      <Table.Td className={classes.tableCellToTop}>
          {(row.startDate === null && row.endDate === null) && ( <> Served all the time </> )}
      {(row.startDate !== null) && formatDisplayDate('From', row.startDate)}
      {(row.startDate === null && row.endDate !== null) && ( <> From: Now... </> )}
          {((row.startDate !== null || row.endDate !== null)) && (
              <>
                  <br />
                  <IconArrowElbowRight style={{transform: 'rotate(45deg)', marginLeft:'4px',  marginTop:'-3px' }} color="#b63" />
                  </>
          )}
      {formatDisplayDate(' Until', row.endDate)}
          {(row.endDate === null && row.startDate !== null) && ( <> ...onwards </> )}
      </Table.Td>
      <Table.Td className={classes.tableCellToTop}>
          Page: {(row.pageId ? <Text size="sm" style={{ margin:'2px', padding:'1px', border: '1px dotted #aaa'}} span className={classes.pageId}>{row.pageId}</Text> : '<not set>')}<br/>
          Environments: <Pill style={{ backgroundColor: 'lightblue', color: 'navy', marginTop:'2px' }} radius="md">{row.environments != null ? (row.environments.length ? row.environments.join(', ') : 'Any') : 'Any'}</Pill><br/>
          Type:<Pill style={{ color:"white", backgroundColor:'#151', marginTop:'2px'}} radius="md">{row.notificationType ? row.notificationType : '<not set>'}</Pill>
      </Table.Td>
    </Table.Tr>
  ));
  }

  return (
      <>
          <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="md" highlightOnHover >
            <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
              <Table.Tr>
                <Table.Th>&nbsp;</Table.Th>
                <Table.Th><span style={{color:'#5c5'}}>What</span> <span style={{color:'#888'}}>Will It Tell Your User?</span></Table.Th>
                <Table.Th><span style={{color:'#5c5'}}>When</span> <span style={{color:'#888'}}>Will It Display?</span></Table.Th>
                <Table.Th><span style={{color:'#5c5'}}>Where</span> <span style={{color:'#888'}}>Will It Display?</span></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
      </Table.ScrollContainer>
    </>
  );
}

export default NotificationsList;
