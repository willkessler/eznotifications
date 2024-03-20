import React, { ReactNode } from 'react';

export type SDKProviderProps = {
  children: ReactNode;
};

export interface SDKConfig {
  apiKey: string;
  apiBaseUrl?: string;
  userId?: string;
  environment?: string;
}

export interface SDKNotification {
  uuid: string,
  createdAt: Date,
  content: string;
  pageId?: string;
  notificationType: string;
  environments: [string];
  startDate?: Date;
  endDate?: Date;
  live: boolean;
  dismissed: boolean;
}

export interface SDKDataReturn {
  data: SDKNotification[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: any;
  pageId: string | undefined,
  dismiss: (notificationUuid: string) => Promise<boolean>;
  reset: () => Promise<boolean>;
}
