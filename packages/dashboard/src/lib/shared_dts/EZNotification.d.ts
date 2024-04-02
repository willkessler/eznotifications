export default interface EZNotification {
    uuid:                  string;
    createdAt:             Date;
    updatedAt:             Date | null;
    deletedAt:             Date | null;
    startDate:             Date | null,
    endDate:               Date | null,
    deleted:               boolean;
    live:                  boolean;
    mustBeDismissed:       boolean;
    content:               string;
    pageId:                string | null;
    notificationType:      string;
    notificationTypeOther: string | null;
    domains:               string[];
    environments:          string[];
    creator?: {
        uuid:              string;
        primaryEmail:      string;
        createdAt:         Date;
        updatedAt:         Date;
        clerkId:           string;
        lastLoginAt:       string;
        isBanned:          boolean;
    } | null;
    organization?: {
        uuid:      string;
        name:      string;
        createdAt:         Date;
        updatedAt:         Date;
        clerkOrganizationId: string;
        clerkCreatorId:      string;
        // pricingModel, apiKeys, users, permittedDomains, endUsers to be added to org model
    } | null;

    // These properties are not in the db schema, it is only in the dashboard version of the EZNotification object
    editing: boolean; 
    clerkCreatorId: string | null;
    clerkUserId: string | null;
    
};
