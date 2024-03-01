export default interface EZNotification {
    uuid:                  string;
    createdAt:             Date;
    updatedAt:             Date | null;
    deletedAt:             Date;
    startDate:             Date | null,
    endDate:               Date | null,
    deleted:               boolean;
    live:                  boolean;
    content:               string;
    pageId:                string | null;
    notificationType:      string;
    notificationTypeOther: string | null;
    environments:          string[];
    creator?: {
        uuid:              string;
        primaryEmail:      string;
        createdAt:         Date;
        updatedAt:         Date;
        clerkId:           string;
        lastLoginAt:       string;
        isBanned:          boolean;
    };
    organization?: {
        uuid:      string;
        name:      string;
        createdAt:         Date;
        updatedAt:         Date;
        clerkOrganizationId: string;
        clerkCreatorId:      string;
        refreshFrequency:    number;
        // pricingModel, apiKeys, users, permittedDomains, endUsers to be added to org model
    };

    // These properties are not in the db schema, it is only in the dashboard version of the EZNotification object
    editing: boolean; 
    clerkCreatorId: null | string;
    clerkUserId: null | string;
    
};
