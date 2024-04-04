// pollerInstance.ts
import { usePoller, PollerProps } from './poller';

let pollerInstance: ReturnType<typeof usePoller> | null = null;

export const getPollerInstance = (props: PollerProps) => {
  if (!pollerInstance) {
    pollerInstance = usePoller(props);
  }
  return pollerInstance;
};
