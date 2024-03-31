import { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import type { SDKConfig } from './types';
import { useTinadSDK } from './context';

export const usePolling = ():void => {
  const { getTinadConfig, processNotificationsData, setFetchPending, setFetchError } = useTinadSDK();
  
  const backoffFactorRef = useRef(1); // Starts with no backoff
  const pollingPaused = useRef(false);
  const windowIsActive = useRef(true);
  // Initial polling interval time; can be overriden by header: X-Tinad-Poll-Interval (see below)
  const baseIntervalTime = useRef(10); 

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
    const DEBOUNCE_DELAY = 30 * 1000; // stop polling only after 30 secs of no focus
    let timeoutId: number | undefined = undefined;
    let debounceTimeoutId: number | undefined = undefined;
    const fetchData = async () => {
      setFetchPending(true);
      try {
        // Dynamically get the latest SDK configuration before each poll
        if (!pollingPaused.current) { // don't poll while browser tab not focused
          const tinadConfig = getTinadConfig();
          const apiUrl = buildApiUrl(tinadConfig);
          const response = await axios.get(apiUrl, {
            headers: {
              'Authorization': "Bearer " + tinadConfig.apiKey,
              'X-Tinad-Source': "SDK",
          }});
          const pollInterval = response.headers['x-tinad-poll-interval'];
          if (pollInterval) {
            const pollIntervalSeconds = parseInt(pollInterval); 
            console.log(`TINAD server is telling us the polling time should be: ${pollIntervalSeconds}`);
            baseIntervalTime.current = pollIntervalSeconds;
          }
          processNotificationsData(response.data); // Update context with new data
        }
        backoffFactorRef.current = 1; // Reset backoff after a successful request
        timeoutId = scheduleNextPoll(baseIntervalTime.current * 1000); // Use a base interval of 10 seconds
        setFetchError(null);
      } catch (error:any) {
        setFetchError(error as string);
        // Apply backoff factor (exponential backoff)
        const nextPollInterval = baseIntervalTime.current * 1000 *backoffFactorRef.current;
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

    // Adjust polling based on tab visibility
    const checkForContinuedPolling = ():void => {
      if (debounceTimeoutId !== null) {
        clearTimeout(debounceTimeoutId);
      }
      console.log('Queuing up to pause polling.');
      if (document.hidden || !windowIsActive.current) {
        // Set up to pause polling
        debounceTimeoutId = setTimeout(():void => {
          console.log("Pausing polling due to an inactive tab/window.");
          pollingPaused.current = true;
        }, DEBOUNCE_DELAY) as unknown as number;
      }
    };

    const restartPolling = ():void => {
      console.log('Restarting polling.');
      if (debounceTimeoutId !== null) {
        clearTimeout(debounceTimeoutId);
      }
      pollingPaused.current = false;
    };
      
    document.addEventListener("visibilitychange", checkForContinuedPolling);

    document.addEventListener('focus', () => {
      if (debounceTimeoutId !== null) {
        clearTimeout(debounceTimeoutId);
        debounceTimeoutId = undefined;
      }
      windowIsActive.current = true;
      restartPolling();
    });

    document.addEventListener('mouseenter', () => {
      if (debounceTimeoutId !== null) {
        clearTimeout(debounceTimeoutId);
        debounceTimeoutId = undefined;
      }
      windowIsActive.current = true;
      restartPolling();
    });

    document.addEventListener('blur', ():void => {
      windowIsActive.current = false;
      checkForContinuedPolling();
    });

    document.addEventListener('mouseleave', ():void => {
      windowIsActive.current = false;
      checkForContinuedPolling();
    });
    
    return () => {
      // Cleanup function to clear timeout when the component unmounts 
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

};
