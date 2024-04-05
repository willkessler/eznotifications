import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";
import { DateTime } from 'luxon';
import { Anchor, Group, Pill, Space, Stack, Text, Title, Tooltip } from '@mantine/core';
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
import { useConfig } from '../../lib/ConfigContext';
import { useDateFormatters } from '../../lib/DateFormattersProvider';
import { useTimezone } from '../../lib/TimezoneContext';
import type EZNotification from '../../lib/shared_dts/EZNotification';
import { NotificationType, NotificationsContextType, TypeMapValue } from '../../lib/shared_dts/NotificationsContext.d';
import classes from './Notifications.module.css';

const defaultContextValue: NotificationsContextType = {
    formatNotificationDatesBlock: (notification: EZNotification) => <></>,
    formatNotificationConditionsBlock: (notification: EZNotification) => <></>,
    formatNotificationControlIcons: (notification: EZNotification, showTooltip: boolean) => <></>,
    formatCreateInfo : (notification: EZNotification) => <></>,
    formatUpdateInfo : (notification: EZNotification) => <></>,
    formatNotificationType: (prefix: string, notificationType: NotificationType, iconSize: number) => <></>,

    notifications: [],
    fetchNotifications: () => Promise.resolve(),
    submitNotification: (notification: EZNotification) => Promise.resolve(),
    handleSwitchChange: (notification: EZNotification) => Promise.resolve(),
    notificationsLastUpdated: null,
    notificationsLoading: false,

    highlightedId: null,
    highlightNotification: (id: string) => {},

    isModalOpen : false,
    modalInitialData: null,
    openModal:  (data: EZNotification) => {},
    closeModal: () => {},

    isPreviewBannerVisible: false,
    setIsPreviewBannerVisible: (previewBannerVisible: boolean) => {},
    previewBannerContent: '',
    showPreviewBanner: (notification: EZNotification) => {},
    closePreviewBanner: () => {},

    isPreviewModalOpen: false,
    setIsPreviewModalOpen: (previewModalOpen: boolean) => {},
    showPreviewModal: (notification: EZNotification) => {},
    previewModalContent: '',
    closePreviewModal: () => {},
    previewNotificationType: 'info',
    setPreviewNotificationType: (notificationType: string) => {},

    isStatisticsDrawerOpen : false,
    setIsStatisticsDrawerOpen: (statisticsDrawerOpen: boolean) => {},
    openStatisticsDrawer: (notification: EZNotification) => {},
    closeStatisticsDrawer: () => {},

    toastNotify: (notification: EZNotification) => {},

    isDeleteModalOpen: false,
    showDeleteModal: (notification: EZNotification) => {},
    closeDeleteModal: () => {},
    deleteNotification: async () => Promise.resolve(),
    deletedNotificationContents: '',

    isResetViewsModalOpen: false,
    showResetViewsModal: () => {},
    resetViewsNotificationContents: '',
    resetViewsForNotification: () => Promise.resolve(),
    closeResetViewsModal: () => {},

    displayPastNotifications: false,
    setDisplayPastNotifications: (newSetting: boolean) => {},
};

const NotificationsContext = createContext<NotificationsContextType>(defaultContextValue);

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{children : React.ReactNode}> = ({ children }) => {
    const { apiBaseUrl, getBearerHeader } = useConfig();
    const { userTimezone, setUserTimezone } = useTimezone();
    const { formatDisplayDate, formatDisplayTime } = useDateFormatters();
    const [notifications, setNotifications] = useState<EZNotification[]>([]);
    const [notificationsLastUpdated, setNotificationsLastUpdated] = useState<number | null>(null);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [displayPastNotifications, setDisplayPastNotifications] = useState(() => {
        const saved = localStorage.getItem('displayPastNotifications');
        return saved ? saved === 'true' : false;
    });

    const { user } = useUser();
    // When we create or update a notification, we'll highlight it in the notificationsList.
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const notificationTypeMap: { [key in NotificationType]: TypeMapValue } = {
        info: { icon: IconInfoCircle,
                title: 'Info',
                bgColor: '2f2'
              },
        change: { icon: IconExchange,
                  title: 'Breaking change',
                  bgColor: 'aaf'
                },
        alert: { icon: IconAlertTriangle,
                 title: 'Alert',
                 bgColor: '#fa0'
               },
        outage: { icon: IconCloudStorm,
                  title: 'Outage',
                  bgColor: '#f22'
                },
        call_to_action: { icon: IconCloudStorm,
                          title: 'Call to action',
                          bgColor: 'ff2'
                        },
        other: { icon: IconCloudStorm,
                 title: 'Other',
                 bgColor: '666'
               },
    };  

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
        const notificationType: NotificationType = 
            (notification.notificationType as NotificationType) in notificationTypeMap ? 
            notification.notificationType as NotificationType : 'info';
        return (
            <>
              <Text size="sm" span>Page:</Text>
              <Text size="sm" style={{ margin:'2px', padding:'2px 4px 2px 4px', border: '1px dotted #aaa' }} span className={classes.pageId}>{notification.pageId ? notification.pageId : 'All pages'}</Text><br />
                <Text size="sm" span>Environments:</Text>
                <Pill style={{ backgroundColor: '#6aa', color: 'navy', margin:'4px' }} radius="md" title={'Environments served: ' + notification.environments?.join(',')}>
                  {notification.environments != null ? 
                   (notification.environments.length ? notification.environments.join(', ') : 'All') : 'All'}
                </Pill><br/>
                <Text size="sm" span>Domains:</Text>
                <Pill style={{ backgroundColor: '#6aa', color: 'navy', margin:'4px' }} radius="md" title={'Domains served: ' + notification.domains?.join(',')}>
                  {notification.domains != null ? 
                   (notification.domains.length ? notification.domains.join(', ') : 'All') : 'All'}
                </Pill><br/>
                {formatNotificationType('Type:',notificationType, 20)}
            </>
        );
    }

    const formatCreateInfo = (notificationData: EZNotification) => {
        const jsDate = new Date(notificationData.createdAt);
        const humanFormattedDate = jsDate.toLocaleDateString() + ' ' + jsDate.toLocaleTimeString();
        return (
            <>
              <b>Created On:</b> {humanFormattedDate}, by {notificationData.creator?.primaryEmail}
            </>
        );
    };

    const formatUpdateInfo = (notificationData: EZNotification) => {
      const jsDate = notificationData.updatedAt ? new Date(notificationData.updatedAt) : null;
      const humanFormattedDate = jsDate ? jsDate.toLocaleDateString() + ' ' + jsDate.toLocaleTimeString() : 'N/A';
      return (
        <>
          <b>Last Updated:</b> {humanFormattedDate}, by {notificationData.creator?.primaryEmail}
        </>
      );
    };

    const formatNotificationType = (prefix: string, notificationType: NotificationType , iconSize: number) => {
        let elem;
        let icon;
        let title;
        let bgColor;
        let tooltip;
        if (notificationType) {
            elem = notificationTypeMap[notificationType];
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
              <Text size="sm">{prefix}&nbsp;</Text>
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
                    return null;
                }

                if (blank) {
                    return null;
                }

                const iconElement = Icon ? (
                    <Icon size={20} className={classes.notificationsListControlIcons} />
                ) : null; // Conditionally render the Icon component

                return (
                    showTooltip ? (
                    <Tooltip key={index} openDelay={1200} label={label} position="bottom" withArrow>
                        <Anchor component="button" type="button" onClick={action}>
                            {iconElement}
                        </Anchor>
                    </Tooltip>
                ) : (
                        <Anchor key={index} component="button" type="button" onClick={action}>
                            {iconElement}
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
    const toastNotify = (notification: EZNotification) => { 
        const content = (notification.content?.length == 0 ? 'not set' : notification.content);
        const notificationType: NotificationType = 
            (notification.notificationType as NotificationType) in notificationTypeMap ? 
            notification.notificationType as NotificationType : 'info';
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
            icon: formatNotificationType('', notificationType, 35),

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
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalInitialData, setModalInitialData] = useState<EZNotification | null>(null);

    const openModal = useCallback((data:EZNotification | null = null) => {
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
    const [previewNotificationType, setPreviewNotificationType] = useState<NotificationType>('info');
    const showPreviewBanner = (notificationData: EZNotification) => {
        console.log('notificationData:',notificationData);
        const content = (notificationData.content?.length == 0 ? 'not set' : notificationData.content);
        setPreviewBannerContent(content);
        setPreviewNotificationType(notificationData.notificationType as NotificationType);
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
        setPreviewNotificationType(notificationData.notificationType as NotificationType);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
    };

    //
    // Delete a notification
    //
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletedNotificationId, setDeletedNotificationId] = useState<string | null>(null);
    const [deletedNotificationContents, setDeletedNotificationContents] = useState('');

    const showDeleteModal = (notification: EZNotification) => {
        console.log('deleting this notification uuid:', notification.uuid);
        setDeletedNotificationId(notification.uuid);
        setDeletedNotificationContents(notification.content);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletedNotificationContents('');
        setDeletedNotificationId(null);
        setIsDeleteModalOpen(false);
    };

    const actuallyDeleteNotification = useCallback(async (): Promise<boolean> => {
        console.log(`Trying to delete notif id: ${deletedNotificationId}`);
        let success = false;
        try {
            const method = 'DELETE';
            const apiUrl = `${apiBaseUrl}/notifications/${deletedNotificationId}`;
            //console.log('in actuallyDeleteNotification, deletedNotificationId:', deletedNotificationId);
            const response = await fetch(apiUrl, {
                method: method,
                credentials: 'include',
                headers: await getBearerHeader(),
            });
            if (!response.ok) throw new Error('Failed to delete notification with id: ' + deletedNotificationId);

            success = true;
            await fetchNotifications();
            setNotificationsLastUpdated(Date.now()); // update state to trigger the notifications list to rerender
        } catch (error) {
            console.error(`Error deleting notification with id:${deletedNotificationId}`, error);
        } finally {
            setNotificationsLoading(false);
            return success;
        }
    }, [deletedNotificationId]);
    
    const deleteNotification = async () => {
        console.log('Actually deleting notification with id:', deletedNotificationId);
        await actuallyDeleteNotification();
        setIsDeleteModalOpen(false);
        setDeletedNotificationContents('');
        setDeletedNotificationId(null);
    };

    //
    // Show statistics drawer, which will also have the "Reset Views" button
    //
    const [ isStatisticsDrawerOpen,setIsStatisticsDrawerOpen ] = useState<boolean>(false);
    const [ statisticsNotificationId, setStatisticsNotificationId] = useState<string | null>(null);
    const [ statisticsNotificationContents, setStatisticsNotificationContents] = useState<string>('');

    const openStatisticsDrawer = (notification: EZNotification) => {
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
    const [ resetViewsNotificationId, setResetViewsNotificationId] = useState<string | null>(null);
    const [ resetViewsNotificationContents, setResetViewsNotificationContents] = useState('');

    const showResetViewsModal = () => {
        console.log('resetting views on this notif', statisticsNotificationId);
        setResetViewsNotificationId(statisticsNotificationId);
        setResetViewsNotificationContents(statisticsNotificationContents);
        setIsResetViewsModalOpen(true);
    };

    const closeResetViewsModal = () => {
        setResetViewsNotificationId(null);
        setResetViewsNotificationContents('');
        setIsResetViewsModalOpen(false);
    };

    const actuallyResetViews = useCallback(async (): Promise<boolean> => {
        try {
            const method = 'PUT';
            const apiUrl = `${apiBaseUrl}/notifications/reset-views/${resetViewsNotificationId}`;
            //console.log('in actuallyDeleteNotification, deletedNotificationId:', deletedNotificationId);
            const response = await fetch(apiUrl, {
                method: method,
                credentials: 'include',
                headers: await getBearerHeader(),
            });
            if (!response.ok) throw new Error('Failed to reset views for notification w/id: ' + resetViewsNotificationId);

        } catch (error) {
            console.error(`Error resetting views on notification with id:${resetViewsNotificationId}`, error);
            return false;
        }
        return true;
    }, [resetViewsNotificationId]);
    
    const resetViewsForNotification = async () => {
        //console.log('Actually resetting views for notification with id:', resetViewsNotificationId);
        await actuallyResetViews();
        setIsResetViewsModalOpen(false);
        setResetViewsNotificationContents('');
        setResetViewsNotificationId(null);
    };

    const sortNotifications = (data: EZNotification[]) => {
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

    const fetchNotifications = useCallback(async (): Promise<void> => {
        if (user) {
            setNotificationsLoading(true); // start loading process
            try {
                const queryParams = new URLSearchParams({ clerkUserId: user.id }).toString();
                const apiUrl = `${apiBaseUrl}/notifications?${queryParams}`;
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: await getBearerHeader(),
                });
                const data = await response.json();
                if (data && data.length > 0) {
                    let filteredNotifications;
                    if (displayPastNotifications) {
                        //console.log('Displaying all notifs');
                        filteredNotifications = sortNotifications(data);
                    } else {
                        //console.log('Displaying none of the past notifs out of data:', data);
                        const now = new Date();
                        filteredNotifications = sortNotifications(data)
                            .filter(notification =>
                                ((notification.endDate === null) ||
                                    (notification.endDate &&
                                        new Date(notification.endDate) > now)));
                        //console.log('filteredNotifications:', filteredNotifications);
                    };
                    setNotifications(filteredNotifications);
                } else {
                    setNotifications([]);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setNotificationsLoading(false);
            }
        }
    }, [displayPastNotifications]);
    
    const highlightNotification = useCallback((id:string) => {
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
    
    // Handle turning a notification on and off
    const handleSwitchChange = async (notificationData: EZNotification, checked: boolean) => {
        const notificationDataCopy:EZNotification = {
            ...notificationData,
        };
  
        notificationDataCopy.live = checked;
        notificationDataCopy.editing = true;
        notificationDataCopy.updatedAt = new Date();
        notificationDataCopy.clerkUserId = user?.id;
        await submitNotification(notificationDataCopy);
    }

    const submitNotification = useCallback(async (notificationData: EZNotification): Promise<void> => {
        console.log('Notification data on form submit:', notificationData);
        const method = (notificationData.editing ? 'PUT' : 'POST' ); // PUT will do an update, POST will create a new posting
        const action = (notificationData.editing ? 'updated' : 'created' );
        const apiUrl = `${apiBaseUrl}/notifications` + (notificationData.editing ? '/' + notificationData.uuid : '/new');

        try {
            const postingObject = {
                EZNotificationData: {
                    content: notificationData.content,
                    startDate: notificationData.startDate ? formatDateForAPISubmission(notificationData.startDate) : null,
                    endDate: notificationData.endDate ? formatDateForAPISubmission(notificationData.endDate) : null,
                    environments: notificationData.environments ? [...notificationData.environments] : [],
                    domains: notificationData.domains ? [...notificationData.domains] : [],
                    live: notificationData.live,
                    mustBeDismissed: notificationData.mustBeDismissed,
                    notificationType: (notificationData.notificationType ? notificationData.notificationType : 'info'),
                    notificationTypeOther: notificationData.notificationTypeOther,
                    pageId: notificationData.pageId || '',
                },
                clerkCreatorId: notificationData.clerkCreatorId,
            };
            console.log('Posting object before stringification:', postingObject);
            const postingObjectString = JSON.stringify(postingObject);
            console.log(`submitNotification with body: ${JSON.stringify(postingObject)}`);
            const response = await fetch(apiUrl, {
                method: method,
                credentials: 'include',
                headers: await getBearerHeader ({ 'Content-Type': 'application/json' }),
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
        formatUpdateInfo,
        formatNotificationType,

        notifications,
        fetchNotifications, 
        handleSwitchChange,
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
        setIsPreviewBannerVisible,
        previewBannerContent,
        showPreviewBanner,
        closePreviewBanner,
        
        isPreviewModalOpen,
        setIsPreviewModalOpen,
        showPreviewModal,
        previewModalContent,
        closePreviewModal,
        previewNotificationType,
        setPreviewNotificationType,

        toastNotify,
        
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
        displayPastNotifications,
        setDisplayPastNotifications,
        
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
