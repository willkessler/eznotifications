import React, { useState, useEffect } from 'react';
import { TinadSDK, SDKNotification } from '@thisisnotadrill/react-core';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison


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
    const [notificationsQueue, setNotificationsQueue] = useState<SDKNotification[]>([]);
    const [isAutoDismissing, setIsAutoDismissing] = useState(false); // New state to track auto-dismiss state

    useEffect(() => {
        // Only update the queue with new notifications, avoiding duplicates
        if (!isLoading && sdkNotifications && sdkNotifications.length > 0) {
            setNotificationsQueue(currentQueue => {
                const newNotifications = sdkNotifications.filter(n => 
                    !currentQueue.some(cn => cn.id === n.id)
                );
                // Only update queue if there are truly new notifications
                if (!isEqual(newNotifications, [])) {
                    return [...currentQueue, ...newNotifications];
                }
                return currentQueue;
            });
        }
    }, [sdkNotifications, isLoading]);

    useEffect(() => {
        if (displayMode === 'sequential' && notificationsQueue.length > 0 && autoDismissTime > 0 && !isAutoDismissing) {
            setIsAutoDismissing(true); // Prevent re-entry
            const timer = setTimeout(() => {
                setIsAutoDismissing(false); // Reset for next possible auto-dismiss
                setNotificationsQueue(currentQueue => currentQueue.slice(1)); // Move to the next notification by slicing the queue
            }, autoDismissTime);
            return () => clearTimeout(timer);
        }
    }, [notificationsQueue, displayMode, autoDismissTime, isAutoDismissing]); // Including isAutoDismissing to manage auto-dismiss state

    const dismissNotification = () => {
        // Directly remove the first notification from the queue
        if (displayMode === 'single') {
            setNotificationsQueue([]);
        } else {
            setNotificationsQueue(currentQueue => currentQueue.slice(1));
        }
    };

    // Display logic for current notification
    const currentNotification = notificationsQueue[0]; // Always show the first notification in the queue

    // Handle empty or error states
    if (isLoading) return <div>Loading...</div>;
    if (isError || notificationsQueue.length === 0) return <div>Error: {error?.message || "No notifications"}</div>;

    return (
        <div>
            {currentNotification && (
                <div>
                    <p>Message: {currentNotification.content}</p>
                    <p>Type: {currentNotification.notificationType}</p>
                    <button onClick={dismissNotification}>Dismiss</button>
                </div>
            )}
        </div>
    );
};

export default NotificationsComponent;
