// usePollerInstance.ts
import { useState, useRef, useEffect } from 'react';
import { usePoller, PollerProps } from './poller';

export const usePollerInstance = (props: PollerProps) => {
  const [pollerInstance, setPollerInstance] = useState<ReturnType<typeof usePoller> | null>(null);
  const pollerRef = useRef<ReturnType<typeof usePoller> | null>(null);

  useEffect(() => {
    if (!pollerRef.current) {
      const newPollerInstance = usePoller(props);
      setPollerInstance(newPollerInstance);
      pollerRef.current = newPollerInstance;
    }
  }, [props]);

  return pollerRef.current || pollerInstance;
};
