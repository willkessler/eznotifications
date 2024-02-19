import cx from 'clsx';
import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Anchor, Box, Button, Menu, Modal, Pill, ScrollArea, Skeleton, Spoiler, Switch, Table, Text, Tooltip, rem } from '@mantine/core';
import { IconArrowElbowRight, 
         IconEdit, 
         IconLayoutNavbarExpand, 
         IconMessageDown, 
         IconAlignBoxCenterMiddle, 
         IconCopy, 
         IconInfoCircle,
         IconRotate,
         IconTrash,
         IconFidgetSpinner } from '@tabler/icons-react';
import classes from './Notifications.module.css';
import toast, { Toaster } from 'react-hot-toast';

import { useNotifications } from './NotificationsContext';
import { useSettings } from '../Account/SettingsContext';
import { addPreviewCaveatToString } from '../../lib/RenderMarkdown';

const NotificationsList = () => {
    const [ scrolled, setScrolled ] = useState(false);
    const { openModal, showPreviewBanner, 
            showPreviewModal, showDeleteModal, showResetViewsModal,
            highlightedId, notifications, submitNotification, 
            fetchNotifications,
            notificationsLoading,
            formatDisplayTime, 
            formatDisplayDate,
            formatCreateInfo,
            formatNotificationType,
          } = useNotifications();
    const { isSetupComplete } = useSettings();
    const { isSignedIn, user, isLoaded } = useUser();

    if (!isLoaded || !isSignedIn ) {
        return null;
    }


  // Set up the demo toaster
    const toastNotify = (notificationData: EZNotification) => { 
        const content = (notificationData.content?.length == 0 ? 'not set' : notificationData.content);
        toast.success(content, {
            duration: 4000,
            position: 'top-center',

            // Styling
            style: {
                minWidth:'500px',
                transition: "all 0.5s ease-out"
            },
            className: '',

            // Custom Icon
            icon: formatNotificationType('', notificationData.notificationType, 35),

            // Aria
            ariaProps: {
                role: 'status',
                'aria-live': 'polite',
            },
        });
  };
  
  // Handle turning a notification on and off
  const handleSwitchChange = async (notificationData, checked) => {
      const notificationDataCopy = {
          ...notificationData,
      };

      notificationDataCopy.live = checked;
      notificationDataCopy.editing = true;
      notificationDataCopy.updatedAt = new Date().toISOString();
      notificationDataCopy.clerkUserId = user?.id;
      await submitNotification(notificationDataCopy);
  }
  
    useEffect(() => {
        const fetchData = async () => {
            //console.log('clerkUserId in fetchData=', clerkUserId);
            await fetchNotifications();
        };

        if (isLoaded && isSignedIn && isSetupComplete) {
            fetchData();
        }
    }, [fetchNotifications, isSetupComplete]);
    
    
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
      <Table.Tr key={row.id || index} className={row.id === highlightedId ? classes['highlighted-row'] : ''} >
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
              <Tooltip openDelay={1000} label={formatCreateInfo(row)} position="bottom" withArrow>
               <Anchor component="button" type="button">
                  <IconInfoCircle size={20}  style={{ marginRight: '10px' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Edit this notification" position="bottom" withArrow>
               <Anchor component="button" type="button" onClick={ () => { openModal(row)}} >
                  <IconEdit size={20}  style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Reset views" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { showResetViewsModal(row)}} >
                  <IconRotate size={20}  style={{ marginRight: '10px' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Delete this notification" position="bottom" withArrow>
               <Anchor component="button" type="button" onClick={ () => { showDeleteModal(row)}} >
                  <IconTrash size={20}  style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
              <Tooltip openDelay={1000} label="Show Banner preview" position="bottom" withArrow>
          <Anchor component="button" type="button" onClick={ () => { showPreviewBanner(row) }}>
                  <IconLayoutNavbarExpand size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Show Modal preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { showPreviewModal(row) }}>
                  <IconAlignBoxCenterMiddle size={20} style={{ marginRight: '10px', cursor:'pointer' }} />
                </Anchor>
              </Tooltip>
              <Tooltip openDelay={1000} label="Show Toast preview" position="bottom" withArrow>
                <Anchor component="button" type="button" onClick={ () => { toastNotify(row) }}>
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
          Envs: <Pill style={{ backgroundColor: '#6aa', color: 'navy', margin:'4px' }} radius="md">{row.environments != null ? (row.environments.length ? row.environments.join(', ') : 'Any') : 'Any'}</Pill><br/>
          {formatNotificationType('Type:',row.notificationType, 24)}
      </Table.Td>
    </Table.Tr>
  ));
  }

  return (
      <>
      <Skeleton visible={notificationsLoading} height="100vh">
          <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="md" highlightOnHover >
            <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
              <Table.Tr>
                <Table.Th><span style={{color:'#5c5'}}>Active?</span></Table.Th>
                <Table.Th><span style={{color:'#5c5'}}>What</span> <span style={{color:'#888'}}>Will It Tell Your User?</span></Table.Th>
                <Table.Th><span style={{color:'#5c5'}}>When</span> <span style={{color:'#888'}}>Will It Display?</span></Table.Th>
                <Table.Th><span style={{color:'#5c5'}}>Where</span> <span style={{color:'#888'}}>Will It Display?</span></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
      </Table.ScrollContainer>
    </Skeleton>
    </>
  );
}

export default NotificationsList;
