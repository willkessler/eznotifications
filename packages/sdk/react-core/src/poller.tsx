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
  const restartAttempted = useRef<boolean>(false);
  const pending = useRef<boolean>(false);

  const MAX_BACKOFF_FACTOR = 128;
  const DEBOUNCE_PAUSE_DELAY = 1 * 1000; // stop polling only after 30 secs of no focus
  const DEBOUNCE_RESTART_DELAY = 100;

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
    if (pending.current) {
      console.log('already fetching, not executing fetchData again.');
      return;
    }

    setFetchPending(true);
    pending.current = true;
    try {
      // Dynamically get the latest SDK configuration before each poll
      if (!pollingPaused.current) { // don't poll while browser tab not focused
        console.log(`fetchData running, tidRef.current=${timeoutIdRef.current}`);
        const tinadConfig = getTinadConfig();
        const nowish = new Date().getTime();
        const apiUrl = buildApiUrl(tinadConfig) + `t=${nowish}`;;
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
        backoffFactorRef.current = 1; // Reset backoff after a successful request
        //scheduleNextPoll(baseIntervalTime.current * 1000); // Use a base interval of 10 seconds
        setFetchError(null);
      }
    } catch (error:any) {
      setFetchError(error as string);
      // Apply backoff factor (exponential backoff)
      const nextPollInterval = baseIntervalTime.current * 1000 * backoffFactorRef.current;
      scheduleNextPoll(nextPollInterval);
      console.log(`We think backoffFactor = ${backoffFactorRef.current}`);
      const newBackoffFactor = Math.min(backoffFactorRef.current * 2, MAX_BACKOFF_FACTOR); // Double the backoff factor
      backoffFactorRef.current = newBackoffFactor; // Reset backoff after a successful request
      console.error("Polling error:", error, `\nBacking off to ${newBackoffFactor}`);
    } finally {
      setFetchPending(false);
      pending.current=false;
    }
  };
  
  const scheduleNextPoll = (delay:number):void => {
    console.log(`scheduleNextPoll, delay ${delay}`);
    if (timeoutIdRef.current !== undefined) {
      console.log(`Clearing timeout because timeoutIdRef=${timeoutIdRef.current}`);
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(fetchData, delay) as unknown as number;
  };

  // A TypeScript version of the debounce function
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    return function(...args: Parameters<T>) {
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  // Assuming the context and usage of restartPolling remains the same
  const restartPolling: RestartPollingFunction = (): void => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined; // Reset the timeout reference.
    }
    console.log("Restarting polling.");
    pollingPaused.current = false;
//    const randomSchedule = Math.round(Math.random()*5000);
//    scheduleNextPoll(randomSchedule);
    scheduleNextPoll(0);
  };

  // Wrapping restartPolling with the TypeScript version of the debounce function
  const debouncedRestartPolling = debounce(restartPolling, DEBOUNCE_RESTART_DELAY);

  // Adjust polling based on tab visibility
  const checkForContinuedPolling = ():void => {
    console.log('Queuing up to pause polling.');
    if (debounceTimeoutIdRef.current !== null) {
      console.log('Clearing debounce timeout.');
      clearTimeout(debounceTimeoutIdRef.current);
    }
    if (document.hidden || !windowIsActive.current) {
      // Set up to pause polling
      debounceTimeoutIdRef.current = setTimeout(():void => {
        console.log("Pausing polling due to an inactive tab/window.");
        pollingPaused.current = true;
      }, DEBOUNCE_PAUSE_DELAY) as unknown as number;
    }
  };

  useEffect(() => {

    const nowish = new Date().getTime();
    console.log(`useEffect, time=${nowish}`);
    debouncedRestartPolling();

    //fetchData(); // Initial fetch and start the polling loop

/*

    const reentry = (e:MouseEvent) => {
      console.log('e:', e);
      debouncedRestartPolling();
    }
    
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now active.');
      } else if (document.visibilityState === 'hidden') {
        console.log('Tab is now inactive.');
        checkForContinuedPolling();
      }
    });

    //document.addEventListener('focus', debouncedRestartPolling, true); // Capture phase
    document.addEventListener('mouseenter', reentry, true); // Capture phase


    document.addEventListener('blur', ():void => {
      windowIsActive.current = false;
      checkForContinuedPolling();
    }, true);

    document.addEventListener('mouseleave', ():void => {
      windowIsActive.current = false;
      checkForContinuedPolling();
    }, true);
*/
    
    return () => {
      // Cleanup function to clear timeout when the component unmounts 
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (debounceTimeoutIdRef.current) {
        clearTimeout(debounceTimeoutIdRef.current);
      }
      // Remove event listeners to prevent memory leaks
      document.removeEventListener('focus', debouncedRestartPolling, true);
      document.removeEventListener('mouseenter', debouncedRestartPolling, true);
      document.removeEventListener('blur', checkForContinuedPolling, true);
      document.removeEventListener('mouseleave', checkForContinuedPolling, true);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount
  
  return { restartPolling };

};
