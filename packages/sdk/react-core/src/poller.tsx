import { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import type { SDKConfig, RestartPollingFunction, UsePollingReturnType } from './types';
import { useTinadSDK } from './context';

export const usePolling = (): UsePollingReturnType => {
  const { getTinadConfig, processNotificationsData, setFetchPending, setFetchError } = useTinadSDK();
  
  const backoffFactorRef = useRef(1); // Starts with no backoff
  const pollingPaused = useRef(false);
  const windowIsActive = useRef(true);
  // Initial polling interval time; can be overriden by header: X-Tinad-Poll-Interval (see below)
  const baseIntervalTime = useRef(10); 
  const timeoutIdRef = useRef<number | undefined>(undefined);
  const debounceTimeoutIdRef = useRef<number | undefined>(undefined);

  const MAX_BACKOFF_FACTOR = 128;
  const DEBOUNCE_DELAY = 30 * 1000; // stop polling only after 30 secs of no focus

  const buildApiUrl = (tinadConfig:SDKConfig) => {
    const apiUrl = new URL(`${tinadConfig.apiBaseUrl}/notifications`);
    apiUrl.searchParams.append('userId', tinadConfig.userId);
    if (tinadConfig.pageId) {
      apiUrl.searchParams.append('pageId', tinadConfig.pageId ?? '');
    }
    if (tinadConfig.environments) {
      apiUrl.searchParams.append('environments', tinadConfig.environments.join(',') ?? 'development');
    }
    if (tinadConfig.domains) {
      apiUrl.searchParams.append('domains', tinadConfig.domains.join(',') ?? '');
    }
    
    // apiUrl.searchParams.append('time', new Date().getTime().toString());
    const newApiUrlString = apiUrl.toString();
    console.log(`buildApiUrl output: ${newApiUrlString} `);
    return newApiUrlString;
  };

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
      //scheduleNextPoll(baseIntervalTime.current * 1000); // Use a base interval of 10 seconds
      setFetchError(null);
    } catch (error:any) {
      setFetchError(error as string);
      // Apply backoff factor (exponential backoff)
      const nextPollInterval = baseIntervalTime.current * 1000 * backoffFactorRef.current;
      //scheduleNextPoll(nextPollInterval);
      console.log(`We think backoffFactor = ${backoffFactorRef.current}`);
      const newBackoffFactor = Math.min(backoffFactorRef.current * 2, MAX_BACKOFF_FACTOR); // Double the backoff factor
      backoffFactorRef.current = newBackoffFactor; // Reset backoff after a successful request
      console.error("Polling error:", error, `\nBacking off to ${newBackoffFactor}`);
    } finally {
      setFetchPending(false);
    }
  };
  
  const scheduleNextPoll = (delay:number):void => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(fetchData, delay) as unknown as number;
  };

  const restartPolling:RestartPollingFunction = ():void => {
    console.log('Restart polling called');
    pollingPaused.current = false;
    scheduleNextPoll(10);
    if (debounceTimeoutIdRef.current !== null) {
      clearTimeout(debounceTimeoutIdRef.current);
      debounceTimeoutIdRef.current = undefined;
    }
  };

  // Adjust polling based on tab visibility
  const checkForContinuedPolling = ():void => {
    if (debounceTimeoutIdRef.current !== null) {
      clearTimeout(debounceTimeoutIdRef.current);
    }
    console.log('Queuing up to pause polling.');
    if (document.hidden || !windowIsActive.current) {
      // Set up to pause polling
      debounceTimeoutIdRef.current = setTimeout(():void => {
        console.log("Pausing polling due to an inactive tab/window.");
        pollingPaused.current = true;
      }, DEBOUNCE_DELAY) as unknown as number;
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    document.addEventListener("visibilitychange", checkForContinuedPolling);

    document.addEventListener('focus', () => {
      if (debounceTimeoutIdRef.current !== null) {
        clearTimeout(debounceTimeoutIdRef.current);
        debounceTimeoutIdRef.current = undefined;
      }
      windowIsActive.current = true;
      restartPolling();
    });

    document.addEventListener('mouseenter', () => {
      if (debounceTimeoutIdRef.current !== null) {
        clearTimeout(debounceTimeoutIdRef.current);
        debounceTimeoutIdRef.current = undefined;
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
      clearTimeout(timeoutIdRef.current);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount
  
  return { restartPolling };

};

