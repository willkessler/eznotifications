import { EZNotification } from '../../../../api/src/EZNotifications/EZNotifications.entity';

export default interface NotificationsContextType {
    formatNotificationDatesBlock: (notification: EZNotification) => React.ReactNode;
    formatNotificationConditionsBlock: (notification: EZNotification) => React.ReactNode;
    formatNotificationControlIcons: (notification: EZNotification, showTooltip: boolean) => React.ReactNode;
    formatCreateInfo : (notification: EZNotification) => null;
    formatNotificationType: (prefix: string, notificationType: string, iconSize: number) => {};

    notifications: EZNotification[];
    fetchNotifications: () => Promise<void>;
    submitNotification: (notification: EZNotification) => Promise<void>;
    notificationsLastUpdated: Date | null;
    notificationsLoading: boolean;

    highlightedId: string | null;
    highlightNotification: (id: string) => void;

    isModalOpen : boolean;
    modalInitialData  : EZNotification;
    openModal:  (data : EZNotification) => void;
    closeModal: (data : EZNotification) => void;

    isStatisticsDrawerOpen : boolean;
    setIsStatisticsDrawerOpen: (statisticsDrawerOpen: boolean) => void;
    openStatisticsDrawer: (notification: EZNotification) => void;
    closeStatisticsDrawer: () => void;

    isPreviewBannerVisible: boolean;
    setIsPreviewBannerVisible: (previewBannerVisible: boolean) => void;
    previewBannerContent: string;
    showPreviewBanner: (notificationData: EZNotification) => void;
    closePreviewBanner: () => void;

    isPreviewModalOpen: boolean;
    setIsPreviewModalOpen: (previewModalOpen: boolean) => void;
    showPreviewModal: (notification: EZNotification) => void;
    closePreviewModal: () => void;
    previewModalContent: string;
    previewNotificationType: string;
    setPreviewNotificationType: (notificationType: string) => void;

    isDeleteModalOpen: boolean;
    deletedNotificationContents: string;
    showDeleteModal: (notification: EZNotification) => void;
    closeDeleteModal: () => void;
    deleteNotification: () => Promise<void>;

    isResetViewsModalOpen: boolean;
    resetViewsNotificationContents: string;
    resetViewsForNotification: () => Promise<void>;
    showResetViewsModal: (notification: EZNotification) => void;
    closeResetViewsModal: () => void;
};
