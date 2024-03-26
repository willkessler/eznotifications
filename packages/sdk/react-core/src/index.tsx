import React, { ReactNode, useState, useEffect } from 'react';
import {
  QueryClientProvider,
  QueryClient,
  useQueryClient,
  useQuery,
} from '@tanstack/react-query';
import { getSdkQueryClient } from './queryClientSingleton';

import type { SDKProviderProps, SDKConfig, SDKNotification, SDKDataReturn } from './types';
import { ReactQueryAction } from './types';

import { TinadSDKCoreProvider, useTinadSDK } from './context';

const TinadSDKProvider:React.FC<SDKProviderProps> = ({ children }) => {
  const queryClient = getSdkQueryClient();

  return (
    <TinadSDKCoreProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TinadSDKCoreProvider>
  );
};

export { SDKProviderProps, SDKNotification, SDKDataReturn } from './types';
export { TinadSDKProvider, useTinadSDK };

export const useSDKData = (): SDKDataReturn => {
  console.log('This Is Not A Drill (TINAD): Core fetch running now.');
  const queryClient = useQueryClient();
  const [ dismissedNotificationIds, setDismissedNotificationIds ] = useState<string[]>([]);
  const [ reactQueryTodo, setReactQueryTodo ] = useState<ReactQueryAction>(ReactQueryAction.OK_AS_IS);
  const { tinadConfig } = useTinadSDK();
  const apiUrlString = tinadConfig.apiUrlString;

/*
  useEffect (() => {
    console.log(`>>>> We noticed tinadConfig changed: ${JSON.stringify(tinadConfig,null,2)}`);
  }, [tinadConfig]);
*/

  useEffect( () => {
    if (reactQueryTodo !== ReactQueryAction.OK_AS_IS) {
      if (reactQueryTodo === ReactQueryAction.REFRESH) {
        console.log('Refreshing react queries.');
        queryClient.refetchQueries({ queryKey: ['notifications'] });
      } else if (reactQueryTodo === ReactQueryAction.INVALIDATE) {
        console.log('Invalidating react queries.');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
      setReactQueryTodo(ReactQueryAction.OK_AS_IS);
    }
  }, [reactQueryTodo]);

  const getLocalStorage = (key:string) => {
    const localStorageValue = localStorage.getItem(key);
    return localStorageValue;
  };        

  const setLocalStorage = (key:string, value:string) => {
    localStorage.setItem(key,value);
  };        

  // Function to determine the latest date between startDate and endDate
  const getLatestDate = (startDate?: Date, endDate?: Date): Date => {
    if (!startDate) return endDate!;
    if (!endDate) return startDate;
    return startDate > endDate ? startDate : endDate;
  };

  const getConfig = (): SDKConfig => {
    console.log(`getConfig, returning ${JSON.stringify(tinadConfig,null,2)}`);
    return tinadConfig;
  }

  const fetchNotifications = async () => {
    if (!tinadConfig) {
      throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
    }
    if (!tinadConfig.apiKey) {
      console.log('fetchNotifications: missing API key.');
      return null;
    }
    const apiKey = tinadConfig.apiKey;
    console.log(`fetchNotifications hitting: ${tinadConfig.apiUrlString} with apiKey ${tinadConfig.apiKey}`);
    const response = await fetch(tinadConfig.apiUrlString, {
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
      console.log(`Couldn't get actual json response from ${tinadConfig.apiUrlString}, error: ${error}`);
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
    //console.log(`******* sortAndGroupNotifications returning: ${JSON.stringify(sortedNotifications,null,2)}`);
    return sortedNotifications;
  };


  const dismissNotificationCore = async (notificationUuid: string): Promise<boolean> => {
    if (!tinadConfig) {
      throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
    }
    const apiKey = tinadConfig.apiKey;
    const apiBaseUrl = tinadConfig.apiBaseUrl;
    const apiUrl = new URL(apiBaseUrl + '/notifications/dismiss');
    const userId = tinadConfig.userId;
    const postData = {
      notificationUuid,
      userId, // note that in the backend this is called endUserId
    };
    //console.log(`react-core dismissNotificationCore post : ${JSON.stringify(postData,null,2)}`);
    
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

    setReactQueryTodo(ReactQueryAction.REFRESH);

    return Promise.resolve(true);
  };

  const resetAllViewsCore = async (): Promise<boolean> => {
    if (!tinadConfig) {
      throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
    }
    const apiKey = tinadConfig.apiKey;
    const apiBaseUrl = tinadConfig.apiBaseUrl;
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
    setReactQueryTodo(ReactQueryAction.REFRESH);

    return Promise.resolve(true);
  };

  const invalidateQueriesCore = ():void => {
    setReactQueryTodo(ReactQueryAction.INVALIDATE);
  }

  //
  //
  // Main invocation of tanstack/react-query begins here.
  //
  //

  // Main focus on the function here is using tanstack useQuery as per below.
  const { isPending, isFetching, error, data } = useQuery({
    queryKey: ['notifications', tinadConfig],
    queryFn: () => fetchNotifications(),
    select: (data: SDKNotification[] | undefined) => {
      if (!data) return [];
      // First, filter out dismissed notifications
      const filteredData = data.filter(
        (notification: SDKNotification) => 
          !dismissedNotificationIds.includes(notification.uuid) );
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
    getConfig: getConfig,
    dismiss: dismissNotificationCore,
    reset: resetAllViewsCore,
    invalidate: invalidateQueriesCore, // call this function in the demo apps when changing user so that React queries get rerun with a new page Id
  };

  //console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
  return returnObj;
};
