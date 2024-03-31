import React, { createContext, ReactNode, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SDKConfig, SDKNotification } from './types';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';

// Function to generate a UUID
const generateUniqueId = (): string  => {
  return 'tinad_user_' + uuidv4(); // This will generate a random UUID
};

const defaultTinadConfig = {
  apiKey: '',
  apiBaseUrl: 'https://api.this-is-not-a-drill.com',
  userId: 'user-1',
  environment: 'development',
  pageId: '',
}

interface TinadSDKContextType {
  getTinadConfig: () => SDKConfig;
  updateTinadConfig: (configPartial: Partial<SDKConfig>) => void;
  notificationsQueue: SDKNotification[];
  processNotificationsData: (data: any[]) => void;
  fetchPending: boolean;
  setFetchPending: (newValue: boolean) => void;
  fetchError: string | null;
  setFetchError: (newValue: string | null) => void;
  dismissNotificationCore: (notificationUuid:string) => Promise<boolean>;
  resetAllViewsCore: () => Promise<boolean>;
}  

const TinadSDKContext = createContext<TinadSDKContextType>({
  getTinadConfig: () => defaultTinadConfig,
  updateTinadConfig: (configPartial: Partial<SDKConfig>) => {},
  notificationsQueue: [],
  processNotificationsData: (data: any[]) => {},
  fetchPending: false,
  setFetchPending: (newValue:boolean) => {},
  fetchError: null,
  setFetchError: (newValue: string | null) => {},
  dismissNotificationCore: (notificationUuid: string) => Promise.resolve(true),
  resetAllViewsCore: () => Promise.resolve(true),
});

interface DismissedNotifications {
  [userId: string]: string[]; // Mapping of userId to an array of dismissed notification UUIDs
}


// Define a provider component. This will allow clients to persist their API key and other important configurations.
export const TinadSDKCoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [ notificationsQueue, setNotificationsQueue ] = useState<SDKNotification[]>([]);
  const [ dismissedNotificationIds, setDismissedNotificationIds ] = useState<DismissedNotifications>({});
  const [ fetchPending, setFetchPending ] = useState<boolean>(false);
  const [ fetchError, setFetchError ] = useState<string | null>(null);
  
  // Function to determine the latest date between startDate and endDate
  const getLatestDate = (startDate?: Date, endDate?: Date): Date => {
    if (!startDate) return endDate!;
    if (!endDate) return startDate;
    return startDate > endDate ? startDate : endDate;
  };

  const addNotificationsToQueue = (notifications:SDKNotification[]) => {
    const tinadConfig = getTinadConfig();
    console.log(`addNotificationsToQueue, queue length: ${notifications?.length}.`);
    if (notifications) {
      console.log(`In addNotificationsToQueue, validing ${notifications?.length} inbound notifications.`);
      // Step 2: Add new notifications that match the current userId
      // (and pageId and environment if those are set) and are not already in queue.
      const newNotifications = notifications.filter(
        notif => notif.userId === tinadConfig.userId &&
               notif.live &&
               (tinadConfig.pageId ? notif.pageId === tinadConfig.pageId : true) &&
               !notificationsQueue.some(cn => notif.uuid === cn.uuid)
      ).map(notif => _.cloneDeep(notif)); // Clone to ensure immutability

      if (newNotifications.length > 0) {
        console.log(`Updating new ${newNotifications.length} notifications to a queue of ${notificationsQueue.length} length.`);
        setNotificationsQueue([...notificationsQueue, ...newNotifications]);
      }
    }
  };

  const sortAndGroupNotifications = (data: any[]): SDKNotification[] => {
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

  const processNotificationsData = (data: any[]):void => {
    //console.log(`******* updateNotifications source data: ${JSON.stringify(data,null,2)}`);
    const mappedData = data.map((notification: any) => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
      startDate: notification.startDate ? new Date(notification.startDate) : undefined,
      endDate: notification.endDate ? new Date(notification.endDate) : undefined,
    }));
    const tinadConfig = getTinadConfig();
    const userId = tinadConfig.userId;

    const filteredData = mappedData.filter(
      (notification: any) => 
        dismissedNotificationIds[userId] == undefined || !dismissedNotificationIds[userId].includes(notification.uuid) );
    // Then apply sorting and grouping function to the filtered data before returning it.
    const sortedGroupedData = sortAndGroupNotifications(filteredData);

//    console.log(`******* fetchNotifications mappedData: ${JSON.stringify(mappedData,null,2)}`);
//    console.log(`******* fetchNotifications dismissedNotificationIds: ${JSON.stringify(dismissedNotificationIds,null,2)}`);
//    console.log(`******* fetchNotifications filteredData: ${JSON.stringify(filteredData,null,2)}`);
    console.log(`******* fetchNotifications returning: ${JSON.stringify(sortedGroupedData,null,2)}`);
    addNotificationsToQueue(sortedGroupedData);

  };

  const storeTinadConfig = (tinadConfig:SDKConfig) => {
    const b64Config = btoa(JSON.stringify(tinadConfig));
    console.log(`Storing tinadConfig : ${JSON.stringify(tinadConfig)}`);
    localStorage.setItem('tinad', b64Config);
  };

  const getTinadConfig = ():SDKConfig => {
    let currentConfig = { ...defaultTinadConfig };
    const previousConfigB64 = localStorage.getItem('tinad');
    if (previousConfigB64) {
      try {
        const previousConfigStr = atob(previousConfigB64);
        currentConfig = JSON.parse(previousConfigStr);
        //console.log(`index.tsx: currentConfig: ${JSON.stringify(currentConfig,null,2)}`);
      } catch (e) {
        console.log('Cannot restore config from local storage:', e);
      }
    }
    return currentConfig;
  };  

  const updateTinadConfig = (configPartial: Partial<SDKConfig>) => {
    //console.log(`updateTinadConfig: Updating tinad config with: ${JSON.stringify(configPartial,null,2)}`);
    let currentConfig = getTinadConfig();
    const isChanged = Object.entries(configPartial).some(([key, value]) => {
      if (key in currentConfig) {
        const currentValue = currentConfig[key as keyof SDKConfig];
        return currentValue !== value;
      }
      return false;
    });
    if (isChanged) {
      const updatedConfig = { ...currentConfig, ...configPartial };
      storeTinadConfig(updatedConfig);
      //const callStack = new Error(">>>>>>> updateTinadConfig: SDK Function Call Stack");
      //console.log(callStack.stack);
    }
    //console.log('No change to Tinad config.');
    return currentConfig;
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

    // Remove the notification from the queue (should be the first one in the queue).
    setNotificationsQueue(notificationsQueue.filter(
      (notification: SDKNotification) => 
        notification.uuid !== notificationUuid));

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

    return Promise.resolve(true);
  };


  return (
    <TinadSDKContext.Provider value={{ 
      getTinadConfig, 
      updateTinadConfig, 
      notificationsQueue, 
      processNotificationsData,
      fetchPending,
      setFetchPending,
      fetchError, 
      setFetchError,
      dismissNotificationCore,
      resetAllViewsCore
    }}>
      {children}
    </TinadSDKContext.Provider>
  );
}

// Export the context to be used by other parts of the SDK or the consuming app.
export const useTinadSDK = () => useContext(TinadSDKContext);
