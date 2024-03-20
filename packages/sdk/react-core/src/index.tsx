import React, { ReactNode, useState, useEffect } from 'react';
import {
  QueryClientProvider,
  QueryClient,
  useQueryClient,
  useQuery,
} from '@tanstack/react-query';
import { getSdkQueryClient } from './queryClientSingleton';

import { v4 as uuidv4 } from 'uuid';

import type { SDKProviderProps, SDKConfig, SDKNotification, SDKDataReturn } from './types';
export { SDKProviderProps, SDKNotification, SDKDataReturn } from './types';

import { initTinadSDK, getTinadSDKConfig } from './config';
export { initTinadSDK, getTinadSDKConfig };

export const TinadSDKProvider:React.FC<SDKProviderProps> = ({ children }) => {
  const queryClient = getSdkQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};


export const useSDKData = (pageId?: string) => {
  console.log('TINAD: useSDKData w/tanstack');
  const sdkConfig = getTinadSDKConfig();
  const queryClient = useQueryClient();

  const [ queriesInvalid, setQueriesInvalid ] = useState<boolean>(false);
  const [ dismissedNotificationIds, setDismissedNotificationIds ] = useState<string[]>([]);
  //const [ currentPageId, setCurrentPageId ] = useState<string | null>(null);

  useEffect( () => {
    if (queriesInvalid) {
      console.log('Invalidating tanstack queries.');
      queryClient.refetchQueries({ queryKey: ['notifications'] });
      setQueriesInvalid(false);
    }
  }, [queriesInvalid]);

  if (!sdkConfig) {
    throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
  }
  const apiKey = sdkConfig.apiKey;

  //console.log('useSDKData: here is the sdkConfig:', sdkConfig);
  const apiBaseUrl = sdkConfig.apiBaseUrl;
  const apiUrl = new URL(apiBaseUrl + '/notifications');

  const getLocalStorage = (key:string) => {
    const localStorageValue = localStorage.getItem(key);
    return localStorageValue;
  };        

  const setLocalStorage = (key:string, value:string) => {
    localStorage.setItem(key,value);
  };        

  // Function to generate a UUID
  const generateUniqueId = (): string  => {
    return 'tinad_user_' + uuidv4(); // This will generate a random UUID
  };

  // Function to determine the latest date between startDate and endDate
  const getLatestDate = (startDate?: Date, endDate?: Date): Date => {
    if (!startDate) return endDate!;
    if (!endDate) return startDate;
    return startDate > endDate ? startDate : endDate;
  };


  const fetchNotifications = async (url: string) => {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': "Bearer " + apiKey,
        'X-Tinad-Source': "SDK",
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let data, mappedData = [];
    try {
      data = await response.json();
    } catch(error) {
      console.log(`Couldn't get json response, error: ${error}`);
    }
    if (data) {
      mappedData = data.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
        startDate: notification.startDate ? new Date(notification.startDate) : undefined,
        endDate: notification.endDate ? new Date(notification.endDate) : undefined,
      }));
    }
    //console.log(`******* fetchNotifications returning: ${JSON.stringify(mappedData,null,2)}`);
    return mappedData;
  };


  const sortAndGroupNotifications = (data: SDKNotification[]): SDKNotification[] => {
    // Sort the results into two (subsorted) groups, those with start and/or end dates, and those without.
    const noDateNotifications: SDKNotification[] = [];
    const withDateNotifications: SDKNotification[] = [];

    //console.log(`sortAndGroupNotifications got data: ${JSON.stringify(data)}`);
    data.forEach((notification: any) => { // 
      // Convert date strings to Date objects
      const sdkNotification: SDKNotification = {
        ...notification,
        createdAt: new Date(notification.createdAt),
        startDate: notification.startDate ? new Date(notification.startDate) : undefined,
        endDate: notification.endDate ? new Date(notification.endDate) : undefined,
      };

      if (!sdkNotification.startDate && !sdkNotification.endDate) {
        noDateNotifications.push(sdkNotification);
      } else {
        withDateNotifications.push(sdkNotification);
      }
    });

    // Sort noDateNotifications by createdAt descending
    noDateNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Sort withDateNotifications by the logic described
    withDateNotifications.sort((a, b) => {
      const latestDateA = getLatestDate(a.startDate, a.endDate);
      const latestDateB = getLatestDate(b.startDate, b.endDate);
      return latestDateB.getTime() - latestDateA.getTime(); // Assuming you want the most recent date first
    });

    // Concatenate the two arrays, with noDateNotifications first
    const sortedNotifications = noDateNotifications.concat(withDateNotifications);
    console.log(`******* sortAndGroupNotifications returning: ${JSON.stringify(sortedNotifications,null,2)}`);
    return sortedNotifications;
  };


  const dismissNotificationCore = async (notificationUuid: string): Promise<boolean> => {
    const sdkConfig = getTinadSDKConfig();
    if (!sdkConfig) {
      throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
    }
    const apiKey = sdkConfig.apiKey;
    const apiBaseUrl = sdkConfig.apiBaseUrl;
    const apiUrl = new URL(apiBaseUrl + '/notifications/dismiss');
    const userId = sdkConfig.userId;
    const postData = {
      notificationUuid,
      userId, // note that in the backend this is called endUserId
    };
    console.log(`react-core dismissNotificationCore post : ${JSON.stringify(postData,null,2)}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + apiKey,
        'X-Tinad-Source': "SDK",
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    setDismissedNotificationIds(currentIds => {
      // Check if the UUID is already in the array to avoid duplicates
      if (!currentIds.includes(notificationUuid)) {
        return [...currentIds, notificationUuid];
      }
      return currentIds; // Return the current state if UUID is already included
    });

    setQueriesInvalid(true);

    return Promise.resolve(true);
  };

  const resetAllViewsCore = async (): Promise<boolean> => {
    const sdkConfig = getTinadSDKConfig();
    if (!sdkConfig) {
      throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
    }
    const apiKey = sdkConfig.apiKey;
    const apiBaseUrl = sdkConfig.apiBaseUrl;
    const apiUrl = new URL(apiBaseUrl + '/notifications/reset-views/all');
    const postData = { apiKey };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + apiKey,
        'X-Tinad-Source': "SDK",
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    setDismissedNotificationIds([]); // need to be sure we can serve the ones that were previously dismissed 
    setQueriesInvalid(true);

    return Promise.resolve(true);
  };

  //
  //
  // Main code for SDK starts here.
  //
  //

  let userId;
  let sdkUserId = sdkConfig.userId;
  if (sdkUserId) {
    userId = sdkUserId;
    setLocalStorage('sdkUserId', userId);
  } else {    
    userId = getLocalStorage('sdkUserId');
    if (!userId) {
      userId = generateUniqueId();
      setLocalStorage('sdkUserId', userId);
      console.log(`Generated and saved user id ${userId}`);
    }
  }

  apiUrl.searchParams.append('userId', userId);
  if (pageId) {
    apiUrl.searchParams.append('pageId', pageId as string);
  }
  if (sdkConfig.environment) {
    apiUrl.searchParams.append('environment', sdkConfig.environment as string);
  }

  const apiUrlString = apiUrl.toString();
  console.log('React-query fetching data from : ' + apiUrlString);

  // save the current pageId so that reset views will reset for the correct page
  //setCurrentPageId(pageId);
  
  // Main focus on the function here is using tanstack useQuery as per below.
  const { isPending, isFetching, error, data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(apiUrlString),
    select: (data: SDKNotification[] | undefined) => {
      if (!data) return [];
      // First, filter out dismissed notifications
      const filteredData = data.filter((notification: SDKNotification) => 
        !dismissedNotificationIds.includes(notification.uuid)
                                      );
      // Then, apply sorting and grouping function to the filtered data
      return sortAndGroupNotifications(filteredData);
    },
    refetchInterval: 15000, // Polling interval
  });

  const returnObj: SDKDataReturn = {
    data: data,
    isPending: isPending,
    isError: !!error,
    error,
    pageId: pageId,
    dismiss: dismissNotificationCore,
    reset: resetAllViewsCore,
  };

  //console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
  return returnObj;
};

