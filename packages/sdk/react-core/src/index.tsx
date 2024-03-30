import { ReactNode, useState, useEffect } from 'react';
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

interface DismissedNotifications {
  [userId: string]: string[]; // Mapping of userId to an array of dismissed notification UUIDs
}


export { SDKProviderProps, SDKNotification, SDKDataReturn } from './types';
export { TinadSDKProvider, useTinadSDK };

export const useSDKData = (): SDKDataReturn => {
  console.log('This Is Not A Drill (TINAD): Core fetch running now.');
  const queryClient = useQueryClient();
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<DismissedNotifications>({});
  const [ reactQueryTodo, setReactQueryTodo ] = useState<ReactQueryAction>(ReactQueryAction.OK_AS_IS);
  const { getTinadConfig } = useTinadSDK();

  const buildApiUrlString = (tinadConfig:SDKConfig) => {
    const apiUrl = new URL(`${tinadConfig.apiBaseUrl}/notifications`);
    apiUrl.searchParams.append('userId', tinadConfig.userId);
    if (tinadConfig.pageId) {
      apiUrl.searchParams.append('pageId', tinadConfig.pageId ?? '');
    }
    if (tinadConfig.environments) {
      apiUrl.searchParams.append('environments', tinadConfig.environments ?? 'development');
    }
    
    // apiUrl.searchParams.append('time', new Date().getTime().toString());
    const newApiUrlString = apiUrl.toString();
    console.log(`buildApiUrlString built: ${newApiUrlString} `);
    return newApiUrlString;
  };


  useEffect( () => {
    if (reactQueryTodo !== ReactQueryAction.OK_AS_IS) {
      if (reactQueryTodo === ReactQueryAction.REFRESH) {
        console.log('Refreshing react queries.');
        queryClient.refetchQueries({ queryKey: ['notifications'] });
      } else if (reactQueryTodo === ReactQueryAction.INVALIDATE) {
        console.log('Invalidating react queries.');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setDismissedNotificationIds({});
      }
      setReactQueryTodo(ReactQueryAction.OK_AS_IS);
    }
  }, [reactQueryTodo]);

  // Function to determine the latest date between startDate and endDate
  const getLatestDate = (startDate?: Date, endDate?: Date): Date => {
    if (!startDate) return endDate!;
    if (!endDate) return startDate;
    return startDate > endDate ? startDate : endDate;
  };

  //
  // Core API fetch call for getting notifications back from TINAD API.
  //
  const fetchNotifications = async () => {
    const tinadConfig = getTinadConfig();
    if (!tinadConfig) {
      throw new Error("Be sure to initialize TinadSDK with a valid API key before using.");
    }
    if (!tinadConfig.apiKey) {
      console.log('fetchNotifications: missing API key.');
      return null;
    }
    const apiKey = tinadConfig.apiKey;
    const currentApiUrlString = buildApiUrlString(tinadConfig);
    console.log(`fetchNotifications hitting: ${currentApiUrlString} with apiKey ${tinadConfig.apiKey}`);
    const response = await fetch(currentApiUrlString, {
      headers: {
        'Authorization': "Bearer " + apiKey,
        'X-Tinad-Source': "SDK",
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const userId = tinadConfig.userId;
    let data;
    try {
      data = await response.json();
    } catch(error) {
      console.log(`Couldn't get actual json response from ${currentApiUrlString}, error: ${error}`);
    }
    if (data) {
      console.log(`******* fetchNotifications source data: ${JSON.stringify(data,null,2)}`);
      const mappedData = data.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
        startDate: notification.startDate ? new Date(notification.startDate) : undefined,
        endDate: notification.endDate ? new Date(notification.endDate) : undefined,
      }));
      const filteredData = mappedData.filter(
        (notification: any) => 
          dismissedNotificationIds[userId] == undefined || !dismissedNotificationIds[userId].includes(notification.uuid) );
      // Then apply sorting and grouping function to the filtered data before returning it.
      const sortedGroupedData = sortAndGroupNotifications(filteredData);

      console.log(`******* fetchNotifications mappedData: ${JSON.stringify(mappedData,null,2)}`);
      console.log(`******* fetchNotifications dismissedNotificationIds: ${JSON.stringify(dismissedNotificationIds,null,2)}`);
      console.log(`******* fetchNotifications filteredData: ${JSON.stringify(filteredData,null,2)}`);
      console.log(`******* fetchNotifications returning: ${JSON.stringify(sortedGroupedData,null,2)}`);
      return sortedGroupedData;
    }
    return [];
  };


  const sortAndGroupNotifications = (data: any[]): SDKNotification[] => {
    // Sort the results into two (subsorted) groups, those with start and/or end dates, and those without.
    const noDateNotifications: SDKNotification[] = [];
    const withDateNotifications: SDKNotification[] = [];

    console.log(`sortAndGroupNotifications got data: ${JSON.stringify(data)}`);
    data.forEach((notification: any) => { // 
      // Convert date strings to Date objects
      const sdkNotification: SDKNotification = {
        ...notification,
        createdAt: new Date(notification.createdAt),
        startDate: notification.startDate ? new Date(notification.startDate) : undefined,
        endDate: notification.endDate ? new Date(notification.endDate) : undefined,
        timeMarker: new Date().getTime(),
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
    const tinadConfig = getTinadConfig();
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

    setDismissedNotificationIds(currentState => {
      // Clone the current state to avoid mutating it directly
      const updatedState = { ...currentState };

      // Check if the userId exists
      if (updatedState[userId]) {
        // Check if the UUID is already in the user's array to avoid duplicates
        if (!updatedState[userId].includes(notificationUuid)) {
          // User exists and UUID is new, add it to the user's array
          updatedState[userId] = [...updatedState[userId], notificationUuid];
        }
      } else {
        // User does not exist, create a new array with the new UUID
        updatedState[userId] = [notificationUuid];
      }

      return updatedState; // Return the updated state
    });

    setReactQueryTodo(ReactQueryAction.REFRESH);

    return Promise.resolve(true);
  };

  const resetAllViewsCore = async (): Promise<boolean> => {
    const tinadConfig = getTinadConfig();
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

    setDismissedNotificationIds({}); // need to be sure we can serve the ones that were previously dismissed 
    setReactQueryTodo(ReactQueryAction.REFRESH);

    return Promise.resolve(true);
  };

  const invalidateQueriesCore = ():void => {
    setReactQueryTodo(ReactQueryAction.INVALIDATE);
  }

  useEffect(() => {
    invalidateQueriesCore();
    return () => {
      // Invalidate the query when the component unmounts
      invalidateQueriesCore();
    };
  }, [queryClient]);

  //
  //
  // Main invocation of tanstack/react-query begins here.
  //
  //

  // Main focus on the function here is using tanstack useQuery as per below.
  const { isPending, isFetching, error, data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    refetchInterval: 15000, // Polling interval
  });

  const returnObj: SDKDataReturn = {
    data: data,
    isPending: isPending,
    isError: !!error,
    error,
    dismiss: dismissNotificationCore,
    reset: resetAllViewsCore,
    invalidate: invalidateQueriesCore, // call this function in the demo apps when changing user so that React queries get rerun with a new page Id
  };

  //console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
  return returnObj;
};
