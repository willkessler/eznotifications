import React, { useState } from 'react';
import { TinadSDK, SDKNotification } from '@thisisnotadrill/react-core';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';


interface NotificationsComponentProps {
  pageId?: string;
}

const NotificationsComponent: React.FC<NotificationsComponentProps> = ({
    pageId,
}) => {
    const { data: sdkNotifications, isLoading, isError, error } = TinadSDK.useSDKData(pageId);

    const [ currentNotifications, setCurrentNotifications ] = useState<SDKNotification[] | null>(null);
    const [ displayedIndex, setDisplayedIndex ] = useState<number>(0);

    const dismissNotification = () => {
        if (currentNotifications) {
            console.log(`dismissNotification: currentNotifications= ${JSON.stringify(currentNotifications, null, 2)}`);
            if (displayedIndex + 1 == currentNotifications.length) {
                setCurrentNotifications(null);
                setDisplayedIndex(-1);
            } else {
                setDisplayedIndex(displayedIndex + 1);
            }
        }
    };

    // Handle empty or error states
    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        return <div>Error: {error?.message || "No notifications"}</div>;
    }

    if (sdkNotifications && sdkNotifications.length > 0) {
        if (!isEqual(currentNotifications, sdkNotifications)) {
            //console.log(`New data received: ${JSON.stringify(sdkNotifications, null, 2)}`);
            console.log('Copying all notifications into currentNotifications.');
            setCurrentNotifications(_.cloneDeep(sdkNotifications));
            setDisplayedIndex(0);
        }
    }

    if (displayedIndex < 0 || currentNotifications === null) {
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
                    <p>Message: {currentNotifications[displayedIndex]?.content}</p>
                    <p>Type:    {currentNotifications[displayedIndex]?.notificationType}</p>
                    <button onClick={dismissNotification}>Dismiss</button>
                </div>
        </div>
    );
};

export default NotificationsComponent;
