import { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import type { SDKConfig } from './types';
import { useTinadSDK } from './context';

export const usePolling = ():void => {
  const { getTinadConfig, processNotificationsData, setFetchPending, setFetchError } = useTinadSDK();
  
  const backoffFactorRef = useRef(1); // Starts with no backoff

  const buildApiUrl = (tinadConfig:SDKConfig) => {
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
    console.log(`buildApiUrl output: ${newApiUrlString} `);
    return newApiUrlString;
  };

  useEffect(() => {
    const MAX_BACKOFF_FACTOR = 128;
    const BASE_INTERVAL_TIME = 10000;
    let timeoutId: number | undefined = undefined;
    const fetchData = async () => {
      setFetchPending(true);
      try {
        // Dynamically get the latest SDK configuration before each poll
        const tinadConfig = getTinadConfig();
        const apiUrl = buildApiUrl(tinadConfig);
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': "Bearer " + tinadConfig.apiKey,
            'X-Tinad-Source': "SDK",
        }});
        processNotificationsData(response.data); // Update context with new data
        backoffFactorRef.current = 1; // Reset backoff after a successful request
        timeoutId = scheduleNextPoll(BASE_INTERVAL_TIME); // Use a base interval of 10 seconds
        setFetchError(null);
      } catch (error:any) {
        setFetchError(error as string);
        // Apply backoff factor (exponential backoff)
        const nextPollInterval = BASE_INTERVAL_TIME * backoffFactorRef.current;
        timeoutId = scheduleNextPoll(nextPollInterval);
        console.log(`We think backoffFactor = ${backoffFactorRef.current}`);
        const newBackoffFactor = Math.min(backoffFactorRef.current * 2, MAX_BACKOFF_FACTOR); // Double the backoff factor
        backoffFactorRef.current = newBackoffFactor; // Reset backoff after a successful request
        console.error("Polling error:", error, `\nBacking off to ${newBackoffFactor}`);
      } finally {
        setFetchPending(false);
      }
    };

    const scheduleNextPoll = (delay:number) => {
      const thisTimeoutId = setTimeout(fetchData, delay) as unknown as number;
      return thisTimeoutId;
    };

    fetchData(); // Initial fetch

    return () => {
      // Cleanup function to clear timeout when the component unmounts 
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

};
