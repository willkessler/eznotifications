import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";
import { DateTime } from 'luxon';
import { Pill, Tooltip } from '@mantine/core';
import {  IconInfoCircle, IconAlertTriangle, IconExchange,
          IconCloudStorm, IconExclamationCircle, IconDots,
          IconQuestionMark,
          IconSpeakerphone} from '@tabler/icons-react';
import { useTimezone } from '../../lib/TimezoneContext';

const NotificationsContext = createContext({
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
    const { userTimezone, setUserTimezone } = useTimezone();
    const [notifications, setNotifications] = useState([]);
    const [notificationsLastUpdated, setNotificationsLastUpdated] = useState([null]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const { user } = useUser();
    // When we create or update a notification, we'll highlight it in the notificationsList.
    const [highlightedId, setHighlightedId] = useState(null);

    /**
     * Converts an ISO date string from the API into the user's chosen timezone.
     * @param {string} apiDate - The ISO date string from the API (e.g., "2024-02-09T17:00:00.665Z").
     * @param {string} userTimezone - The user's chosen timezone (e.g., "America/New_York").
     * @returns {string} - The date formatted in the user's timezone.
     */
    const formatDisplayDate = (prefix, date) => {
        if (date === null) {
            return '';
        }
        
        // Parse the ISO date string as UTC
        const utcDate = DateTime.fromISO(date, { zone: 'utc' });

        // Convert the DateTime object to the user's timezone
        const userTimezoneDate = utcDate.setZone(userTimezone);

        // Format the DateTime object for display. Adjust the format as needed.
        // This example uses a format like "February 9, 2024, 12:00 PM".
        const displayDate = userTimezoneDate.toLocaleString(DateTime.DATETIME_FULL,
                                                            { weekday: 'short', 
                                                              year: 'numeric', 
                                                              month: 'short', 
                                                              day: 'numeric', 
                                                              hour: '2-digit', 
                                                              minute: '2-digit' }
                                                           );
        return displayDate;    
    };

    function formatDisplayTime(date) {
        if (!date) return '';

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
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
        setDeletedNotificationId(notification.id);
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
            const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/notifications/` +
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
        console.log('resetting views on this notif', notification);
        setStatisticsNotificationId(notification.id);
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

    const showResetViewsModal = (notification) => {
        console.log('resetting views on this notif', notification);
        setResetViewsNotificationId(notification.id);
        setResetViewsNotificationContents(notification.content);
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
                `${window.location.protocol}//${window.location.hostname}/api/eznotifications/notifications` +
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
            const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/notifications?${queryParams}`;
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
        const apiUrl = `/api/eznotifications/notifications` + (notificationData.editing ? '/' + notificationData.id : '/new');

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
            highlightNotification(data.id);
            await fetchNotifications();
            setNotificationsLastUpdated(Date.now()); // update state to trigger the notifications list to rerender
        } catch(error) {
            console.error('Error creating notification:', error);
        }
    }, []);
  

  return (
    <NotificationsContext.Provider value={{ 
        formatDisplayDate,
        formatDisplayTime,
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
