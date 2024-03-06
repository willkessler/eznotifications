import React, { useState, useEffect } from 'react';
import { TinadSDK, SDKNotification } from '@thisisnotadrill/react-core';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';


interface NotificationsComponentProps {
  displayMode: 'sequential' | 'single';
  autoDismissTime?: number; // milliseconds
  pageId?: string;
}

const NotificationsComponent: React.FC<NotificationsComponentProps> = ({
    displayMode,
    autoDismissTime = 0,
    pageId,
}) => {
    const { data: sdkNotifications, isLoading, isError, error } = TinadSDK.useSDKData(pageId);

    const [ currentNotification, setCurrentNotification ] = useState<SDKNotification | null>(null);
    const [ isAutoDismissing, setIsAutoDismissing ] = useState(false); // New state to track auto-dismiss state

    const dismissNotification = () => {
        setCurrentNotification(null);
    };

    // Handle empty or error states
    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        return <div>Error: {error?.message || "No notifications"}</div>;
    }

    if (sdkNotifications && sdkNotifications.length > 0) {
        console.log(`Checking sdkNotifications[0]: ${JSON.stringify(sdkNotifications[0], null, 2)}`);
        if (!isEqual(currentNotification, sdkNotifications[0])) {
            console.log('Setting current notif to 0 item');
            setCurrentNotification(_.cloneDeep(sdkNotifications[0]))
        }
    } else {
        console.log(`currentNotification: ${JSON.stringify(currentNotification,null,2)}`);
    }

    if (currentNotification === null) {
        return (
            <div>
                <div>
                    <p>No notifications yet</p>
                </div>
            </div>
        );
    }
    
    return (
        <div>
                <div>
                    <p>Message: {currentNotification.content}</p>
                    <p>Type:    {currentNotification.notificationType}</p>
                    <button onClick={dismissNotification}>Dismiss</button>
                </div>
        </div>
    );
};

export default NotificationsComponent;
