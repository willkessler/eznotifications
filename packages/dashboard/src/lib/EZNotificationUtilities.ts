import type EZNotification from './lib/shared_dts/EZNotification';

export const createBlankEZNotification = (): EZNotification => {
    return {
        uuid: '', 
        creatorUuid: '',
        organizationUuid: '',
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
        environments: ['Development'],

        creator: null,
        organization:null,
        editing: false,
        clerkCreatorId: null,
        clerkUserId: null,
    };
};
