import React, { useEffect, useRef } from 'react';

export interface PollerProps {
  fetchData: () => Promise<any>;
  processData: (data: any) => void;
  pollInterval: number;
  maxRetries: number;
}

export const usePoller = ({
  fetchData,
  processData,
  pollInterval,
  maxRetries,
}: PollerProps) => {
  const isPolling = useRef<boolean>(true);
  const retries = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  console.log('Instatiating a usePoller object.');

  useEffect(() => {
    console.log('useEffect 1');
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isPolling.current = true; // Set isPolling to true when the tab gains visibility
      } else {
        isPolling.current = false; // Set isPolling to false when the tab loses visibility
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, []);


  useEffect(() => {
    console.log('useEffect 2');
    const fetchAndHandleData = async () => {
      try {
        console.log('Executing fetch.');
        const data = await fetchData();
        processData(data);
        retries.current = 0;
      } catch (error) {
        const nextRetryDelay = calculateNextRetryDelay(retries.current, pollInterval);
        timeoutRef.current = setTimeout(fetchAndHandleData, nextRetryDelay);
        retries.current = Math.min(retries.current + 1, maxRetries);
      }
    };

    console.log(`usePoller useEffect isPolling: ${isPolling.current}`);
    if (isPolling.current) {
      fetchAndHandleData();
      intervalRef.current = setInterval(fetchAndHandleData, pollInterval);
    } else {
      clearInterval(intervalRef.current!);
    }
  }, [fetchData, isPolling.current, processData, pollInterval, retries]);

  console.log(`Returning isPolling ${isPolling.current}`);
  const currentlyPolling = isPolling.current;
  return { isPolling: currentlyPolling };
};

const calculateNextRetryDelay = (retries: number, pollInterval: number) => {
  const delay = Math.pow(2, retries) * pollInterval;
  return Math.min(delay, 60000); // Max delay of 1 minute
};
