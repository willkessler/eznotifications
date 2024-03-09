export interface SDKConfig {
    apiKey: string;
    userId?: string;
    environment?: string;
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
