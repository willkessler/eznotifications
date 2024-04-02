// Define a type for the keys of typeMap
export type NotificationType = 'info' | 'change' | 'alert' | 'outage' | 'call_to_action' | 'other';

// Define the structure of the objects in typeMap
export interface TypeMapValue {
  icon: (props: TablerIconsProps) => JSX.Element;
  title: string;
  bgColor: string;
};

export interface NotificationsContextType {
    formatNotificationDatesBlock: (notification: EZNotification) => React.ReactNode;
    formatNotificationConditionsBlock: (notification: EZNotification) => React.ReactNode;
    formatNotificationControlIcons: (notification: EZNotification, showTooltip: boolean) => React.ReactNode;
    formatCreateInfo : (notification: EZNotification) => React.ReactNode;
    formatUpdateInfo : (notification: EZNotification) => React.ReactNode;
    formatNotificationType: (prefix: string, notificationType: NotificationType, iconSize: number) => React.ReactNode;

    notifications: EZNotification[];
    fetchNotifications: () => Promise<void>;
    submitNotification: (notification: EZNotification) => Promise<void>;
    notificationsLastUpdated: number | null;
    notificationsLoading: boolean;

    highlightedId: string | null;
    highlightNotification: (id: string) => void;

    isModalOpen : boolean;
    modalInitialData  : EZNotification;
    openModal:  (data : EZNotification | null) => void;
    closeModal: () => void;

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
    setPreviewNotificationType: (notificationType: NotificationType) => void;

    toastNotify: (notification: EZNotification) => void;

    isDeleteModalOpen: boolean;
    deletedNotificationContents: string;
    showDeleteModal: (notification: EZNotification) => void;
    closeDeleteModal: () => void;
    deleteNotification: () => Promise<void>;

    isResetViewsModalOpen: boolean;
    resetViewsNotificationContents: string;
    resetViewsForNotification: () => Promise<void>;
    showResetViewsModal: () => void;
    closeResetViewsModal: () => void;

    displayPastNotifications: boolean;
    setDisplayPastNotifications: (newSetting: boolean) => void;

};

