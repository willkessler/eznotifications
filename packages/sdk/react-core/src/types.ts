export interface SDKConfig {
    userId?: string;
    pageId?: string;
    environments?: string[];
}

export interface SDKNotification {
    id: string,
    createdAt: Date,
    content: string;
    pageId?: string;
    notificationType: string;
    environments: [string];
    startDate?: Date;
    endDate?: Date;
    live: boolean;
}

export interface SDKDataReturn {
    data: SDKNotification[] | null;
    isLoading: boolean;
    isError: boolean;
    error: any;
}
