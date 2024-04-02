import type EZNotification from './shared_dts/EZNotification';

export const createBlankEZNotification = (): EZNotification => {
    return {
        uuid: '', 
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: null,
        startDate: null,
        endDate: null,
        deleted: false,
        live: false,
        content: '',
        pageId: null,
        notificationType: 'info',
        notificationTypeOther: null,
        environments: ['Development'],
        domains: ['example.com'],

        creator: null,
        organization:null,
        editing: false,
        mustBeDismissed: true,
        clerkCreatorId: null,
        clerkUserId: null,
    };
};
