import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";
import { DateTime } from 'luxon';
import { Anchor, Group, Pill, Space, Text, Tooltip } from '@mantine/core';
import toast, { Toaster } from 'react-hot-toast';
import { IconSpeakerphone,
         IconInfoCircle, 
         IconAlertTriangle, 
         IconExchange,
         IconArrowElbowRight, 
         IconCloudStorm, 
         IconExclamationCircle, 
         IconDots,
         IconQuestionMark,
         IconEdit, 
         IconLayoutNavbarExpand, 
         IconMessageDown, 
         IconAlignBoxCenterMiddle, 
         IconCopy, 
         IconRotate,
         IconTrash,
         IconChartLine,
         IconFidgetSpinner } from '@tabler/icons-react';
import { useDateFormatters } from '../../lib/DateFormattersProvider';
import { useTimezone } from '../../lib/TimezoneContext';
import classes from './Notifications.module.css';

const NotificationsContext = createContext({
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
    const { userTimezone, setUserTimezone } = useTimezone();
    const { formatDisplayDate, formatDisplayTime } = useDateFormatters();
    const [notifications, setNotifications] = useState([]);
    const [notificationsLastUpdated, setNotificationsLastUpdated] = useState([null]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const { user } = useUser();
    // When we create or update a notification, we'll highlight it in the notificationsList.
    const [highlightedId, setHighlightedId] = useState(null);

    const formatNotificationDatesBlock = (notification: EZNotification) => {
        return (
            <>
            {(notification.startDate === null && notification.endDate === null) && ( <> Served all the time </> )}
            {(notification.startDate !== null) && formatDisplayDate('From', notification.startDate)}
            {(notification.startDate === null && notification.endDate !== null) && ( <> From: Now... </> )}
            {((notification.startDate !== null || notification.endDate !== null)) && (
                <>
                  <br />
                  <IconArrowElbowRight 
                   style={{transform: 'rotate(45deg)', marginLeft:'4px',  marginTop:'-5px' }} color="#5c5" />
                </>
            )}
            {formatDisplayDate(' Until', notification.endDate)}
            {(notification.endDate === null && notification.startDate !== null) && ( <> ...onwards </> )}
            </>
        );
    }

    const formatNotificationConditionsBlock = (notification: EZNotification) => {
        return (
            <>
                Page: {(notification.pageId ? 
                    <Text size="sm" style={{ margin:'2px', padding:'2px 4px 2px 4px', border: '1px dotted #aaa' }} span className={classes.pageId}>{notification.pageId}</Text> : '<not set>')}<br />
                Envs: 
                <Pill style={{ backgroundColor: '#6aa', color: 'navy', margin:'4px' }} radius="md">
                {notification.environments != null ? 
                    (notification.environments.length ? notification.environments.join(', ') : 'Any') : 'Any'}
                </Pill><br/>
                {formatNotificationType('Type:',notification.notificationType, 24)}
            </>
        );
    }

    const formatCreateInfo = (notificationData) => {
        const jsDate = new Date(notificationData.createdAt);
        const humanFormattedDate = jsDate.toLocaleDateString() + ' ' + jsDate.toLocaleTimeString();
        return (
            <>
                Created: {humanFormattedDate} by {notificationData.creator?.primaryEmail}
            </>
        );
    };

    const formatNotificationType = (prefix, notificationType, iconSize: number) => {
        let typeMap = {
            'info' : { icon: IconInfoCircle,
                       title: 'Info',
                       bgColor: '2f2'
                     },
            'change' : { icon: IconExchange,
                       title: 'Breaking change',
                       bgColor: 'aaf'
                     },
            'alert' : { icon: IconAlertTriangle,
                        title: 'Alert',
                        bgColor: '#fa0'
                      },
            'outage' : { icon: IconCloudStorm,
                        title: 'Outage',
                        bgColor: '#f22'
                      },
            'call_to_action' : { icon: IconCloudStorm,
                                 title: 'Call to action',
                                 bgColor: 'ff2'
                               },
            'other' : { icon: IconCloudStorm,
                        title: 'Other',
                        bgColor: '666'
                      },
        };
        
        let elem;
        let icon;
        let title;
        let bgColor;
        let tooltip;
        if (notificationType) {
            elem = typeMap[notificationType];
            icon = elem.icon;
            title = elem.title;
            bgColor = elem.bgColor;
        } else {
            icon = IconQuestionMark;
            title = 'Not yet set';
            bgColor = 'fff';
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {prefix}
                <Tooltip openDelay={500} label={title} position="bottom" withArrow>
            {React.createElement(icon, { style: { color:bgColor } , size: iconSize} ) }
                </Tooltip>
            </div>
        );
    }

    const formatNotificationControlIcons = (notification: EZNotification, showTooltip: boolean) => {
        const controls = [
            {
                Icon: IconInfoCircle,
                label: formatCreateInfo(notification),
                action: () => {},
                skipIfMobile: true,
                blank: false,
            },
            {
                Icon: IconEdit,
                label: 'Edit this notification',
                action: () => openModal(notification),
                skipIfMobile: false,
                blank: false,
            },
            {
                Icon: IconChartLine,
                label: 'Notification Statistics',
                action: () => openStatisticsDrawer(notification),
                skipIfMobile: false,
                blank: false,
            },
            {
                Icon: IconTrash,
                label: 'Delete this notification',
                action: () => showDeleteModal(notification),
                skipIfMobile: false,
                blank: false,
            },
            {
                Icon: null,
                label: 'None',
                action: () => {},
                skipIfMobile: false,
                blank: true,
            },
            {
                Icon: IconLayoutNavbarExpand,
                label: 'Preview banner display',
                action: () => showPreviewBanner(notification),
                skipIfMobile: false,
                blank: false,
            },
            {
                Icon: IconAlignBoxCenterMiddle,
                label: 'Preview modal display',
                action: () => showPreviewModal(notification),
                skipIfMobile: false,
                blank: false,
            },
            {
                Icon: IconMessageDown,
                label: 'Preview toast display',
                action: () => toastNotify(notification),
                skipIfMobile: false,
                blank: false,
            },
        ];            
                  
        const controlsJsx = 
            controls.map(({Icon, label, action, skipIfMobile, blank}, index) => {
                if (!showTooltip && skipIfMobile) {
                    return '';
                }

                if (blank) {
                    return ''; // ( <Space w="xs" />);
                }

                return (
                    showTooltip ? (
                    <Tooltip key={index} openDelay={1200} label={label} position="bottom" withArrow>
                        <Anchor component="button" type="button" onClick={action}>
                          <Icon size={20} className={classes.notificationsListControlIcons} />
                        </Anchor>
                    </Tooltip>
                ) : (
                    <Anchor key={index} component="button" type="button" onClick={action}>
                        <Icon size={20} className={classes.notificationsListControlIcons} />
                    </Anchor>
                ));
            });
        if (showTooltip) {
            return (
            <Group gap="xs" >{controlsJsx}</Group>
            );
        }
        return (
            <Group grow wrap="nowrap">{controlsJsx}</Group>
        );
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

    //
    // Show & hide the create/edit notification modal
    //
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialData, setModalInitialData] = useState(null);

    const openModal = useCallback((data = null) => {
        setModalInitialData(data);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalInitialData(null); // Reset initial data on close
    }, []);

    //
    // Show and hide the demo banner
    //
    const [isPreviewBannerVisible, setIsPreviewBannerVisible] = useState(false);
    const [previewBannerContent, setPreviewBannerContent] = useState('');
    const [previewNotificationType, setPreviewNotificationType] = useState('info');
    const showPreviewBanner = (notificationData: EZNotification) => {
        console.log('notificationData:',notificationData);
        const content = (notificationData.content?.length == 0 ? 'not set' : notificationData.content);
        setPreviewBannerContent(content);
        setPreviewNotificationType(notificationData.notificationType);
        setIsPreviewBannerVisible(true);
    };
    const closePreviewBanner = () => {
        setIsPreviewBannerVisible(false);
    }

    //
    // Show and hide the notification preview modal
    //
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewModalContent, setPreviewModalContent] = useState('');
    const showPreviewModal = (notificationData: EZNotification) => {
        const content = (notificationData.content?.length == 0 ? 'not set' : notificationData.content);
        setPreviewModalContent(content);
        setPreviewNotificationType(notificationData.notificationType);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
    };

    //
    // Delete a notification
    //
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletedNotificationId, setDeletedNotificationId] = useState(null);
    const [deletedNotificationContents, setDeletedNotificationContents] = useState('');

    const showDeleteModal = (notification) => {
        //console.log('deleting this notif', notification);
        setDeletedNotificationId(notification.uuid);
        setDeletedNotificationContents(notification.content);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletedNotificationContents('');
        setDeletedNotificationId(null);
        setIsDeleteModalOpen(false);
    };

    const actuallyDeleteNotification = useCallback(async (deletedNotificationId) => {
        try {
            const method = 'DELETE';
            const apiUrl = `${window.location.origin}/api/notifications/` +
                `${deletedNotificationId}`;
            //console.log('in actuallyDeleteNotification, deletedNotificationId:', deletedNotificationId);
            const response = await fetch(apiUrl, {
                method: method
            });
            if (!response.ok) throw new Error('Failed to delete notification with id: ' + deletedNotificationId);

            await fetchNotifications();
            setNotificationsLastUpdated(Date.now()); // update state to trigger the notifications list to rerender
        } catch (error) {
            console.error(`Error deleting notification with id:${deletedNotificationId}`, error);
            return false;
        } finally {
            setNotificationsLoading(false);
        }
    }, []);
    
    const deleteNotification = () => {
        //console.log('Actually deleting notification with id:', deletedNotificationId);
        actuallyDeleteNotification(deletedNotificationId);
        setIsDeleteModalOpen(false);
        setDeletedNotificationContents('');
        setDeletedNotificationId(null);
    };

    //
    // Show statistics drawer, which will also have the "Reset Views" button
    //
    const [ isStatisticsDrawerOpen,setIsStatisticsDrawerOpen ] = useState(false);
    const [ statisticsNotificationId, setStatisticsNotificationId] = useState(null);
    const [ statisticsNotificationContents, setStatisticsNotificationContents] = useState('');

    const openStatisticsDrawer = (notification) => {
        console.log('Opening stats drawer for this notification:', notification);
        setStatisticsNotificationId(notification.uuid);
        setStatisticsNotificationContents(notification.content);
        setIsStatisticsDrawerOpen(true);
    };

    const closeStatisticsDrawer = () => {
        setStatisticsNotificationContents('');
        setStatisticsNotificationId(null);
        setIsStatisticsDrawerOpen(false);
    };

    //
    // Reset views on a notification
    //
    const [ isResetViewsModalOpen,setIsResetViewsModalOpen ] = useState(false);
    const [ resetViewsNotificationId, setResetViewsNotificationId] = useState(null);
    const [ resetViewsNotificationContents, setResetViewsNotificationContents] = useState('');

    const showResetViewsModal = () => {
        console.log('resetting views on this notif', statisticsNotificationId);
        setResetViewsNotificationId(statisticsNotificationId);
        setResetViewsNotificationContents(statisticsNotificationContents);
        setIsResetViewsModalOpen(true);
    };

    const closeResetViewsModal = () => {
        setResetViewsNotificationContents('');
        setResetViewsNotificationId(null);
        setIsResetViewsModalOpen(false);
    };

    const actuallyResetViews = useCallback(async (resetViewsNotificationId) => {
        try {
            const method = 'PUT';
            const apiUrl = 
                `${window.location.origin}/api/notifications` +
                `/${resetViewsNotificationId}/reset-views`;
            //console.log('in actuallyDeleteNotification, deletedNotificationId:', deletedNotificationId);
            const response = await fetch(apiUrl, {
                method: method
            });
            if (!response.ok) throw new Error('Failed to reset views for notification w/id: ' + resetViewsNotificationId);

        } catch (error) {
            console.error(`Error resetting views on notification with id:${resetViewsNotificationId}`, error);
            return false;
        }
    }, []);
    
    const resetViewsForNotification = () => {
        //console.log('Actually resetting views for notification with id:', resetViewsNotificationId);
        actuallyResetViews(resetViewsNotificationId);
        setIsResetViewsModalOpen(false);
        setResetViewsNotificationContents('');
        setResetViewsNotificationId(null);
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

    const fetchNotifications = useCallback(async () => {
        console.log(`Inside fetchNotifications, user.id = ${user.id}`);
        setNotificationsLoading(true); // start loading process
        try {
            const queryParams = new URLSearchParams({ clerkUserId: user.id }).toString();
            const apiUrl = `${window.location.origin}/api/notifications?${queryParams}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                const sortedNotifications = sortNotifications(data);
                setNotifications(sortedNotifications);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);
    
    const highlightNotification = useCallback((id) => {
        setHighlightedId(id);
        // Remove highlight after 5 seconds
        setTimeout(() => setHighlightedId(null), 5000);
    }, []);
        
    const formatDateForAPISubmission = (frontendDate : Date) => {
        console.log(`Formatting date: ${frontendDate} for backend, timezone: ${userTimezone}`);
        const backendDateTime = DateTime.fromJSDate(frontendDate, { zone: userTimezone });
        const backendDateTimeUTC = backendDateTime.toUTC();
        const backendDateTimeUTCString = backendDateTimeUTC.toISO();
        return backendDateTimeUTCString;
    };
    
    const submitNotification = useCallback(async (notificationData) => {
        console.log('Notification data on form submit:', notificationData);
        const method = (notificationData.editing ? 'PUT' : 'POST' ); // PUT will do an update, POST will create a new posting
        const action = (notificationData.editing ? 'updated' : 'created' );
        const apiUrl = `/api/notifications` + (notificationData.editing ? '/' + notificationData.uuid : '/new');

        try {
            const postingObject = {
                EZNotificationData: {
                    content: notificationData.content,
                    startDate: formatDateForAPISubmission(notificationData.startDate),
                    endDate: formatDateForAPISubmission(notificationData.endDate),
                    environments: [...notificationData.environments],
                    live: notificationData.live,
                    notificationType: (notificationData.notificationType ? notificationData.notificationType : 'info'),
                    notificationTypeOther: notificationData.notificationTypeOther,
                    pageId: notificationData.pageId || '',
                },
                clerkCreatorId: notificationData.clerkCreatorId,
            };
            console.log('Posting object before stringificiation:', postingObject);
            const postingObjectString = JSON.stringify(postingObject);
            console.log(`submitNotification with body: ${JSON.stringify(postingObject)}`);
            const response = await fetch(apiUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: postingObjectString,
            });
            const data = await response.json();
            console.log('Notification was ' + action + ' with:', data);
            highlightNotification(data.uuid);
            await fetchNotifications();
            setNotificationsLastUpdated(Date.now()); // update state to trigger the notifications list to rerender
        } catch(error) {
            console.error('Error creating notification:', error);
        }
    }, []);
  

  return (
    <NotificationsContext.Provider value={{ 
        formatNotificationDatesBlock,
        formatNotificationConditionsBlock,
        formatNotificationControlIcons,
        formatCreateInfo,
        formatNotificationType,

        notifications,
        fetchNotifications, 
        submitNotification,
        notificationsLastUpdated,
        notificationsLoading,

        highlightedId, 
        highlightNotification,

        isModalOpen,
        modalInitialData,
        openModal,
        closeModal,

        isStatisticsDrawerOpen,
        setIsStatisticsDrawerOpen,
        openStatisticsDrawer,
        closeStatisticsDrawer,
        
        isPreviewBannerVisible,
        previewBannerContent,
        showPreviewBanner,
        closePreviewBanner,
        
        isPreviewModalOpen,
        showPreviewModal,
        previewModalContent,
        closePreviewModal,
        previewNotificationType,

        isDeleteModalOpen,
        showDeleteModal,
        closeDeleteModal,
        deleteNotification,
        deletedNotificationContents,
        
        isResetViewsModalOpen,
        resetViewsNotificationContents,
        resetViewsForNotification,
        closeResetViewsModal,
        showResetViewsModal,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
