import { ReactNode, useState, useEffect } from 'react';

import type { SDKProviderProps, SDKConfig, SDKNotification, SDKDataReturn } from './types';
import { TinadSDKCoreProvider, useTinadSDK } from './context';
import { usePolling } from './poller';

const TinadSDKProvider:React.FC<SDKProviderProps> = ({ children, domains, environments }) => {
  return (
    <TinadSDKCoreProvider domains={domains} environments={environments}>
      {children}
    </TinadSDKCoreProvider>
  );

};

export { SDKProviderProps, SDKNotification, SDKDataReturn } from './types';
export { TinadSDKProvider, useTinadSDK };

export const useSDKData = (): SDKDataReturn => {
  console.log('This Is Not A Drill (TINAD): Core fetch running now.');

  const { getTinadConfig, updateTinadConfig, notificationsQueue, fetchPending, fetchError, dismissNotificationCore, resetAllViewsCore, savePollerRestart } = useTinadSDK();

  const { restartPolling } = usePolling();
  savePollerRestart(restartPolling); // save the poller restart fn in the SDK for use by resetViewsAllCore
  
  const returnObj: SDKDataReturn = {
    data: notificationsQueue,
    fetchPending: fetchPending,
    fetchError: fetchError,
    dismiss: dismissNotificationCore,
    reset: resetAllViewsCore,
  };

  //console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
  return returnObj;
};
