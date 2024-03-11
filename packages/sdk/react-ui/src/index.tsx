import React, { ReactElement, useState, ReactNode } from 'react';
import { SDKNotification, useSDKData, dismissNotificationCore } from '@thisisnotadrill/react-core';
import type { TinadTemplateProps, TinadNotificationsComponentProps } from './types';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';

// Internal template used only by the SDK.
const DefaultTemplate: React.FC<TinadTemplateProps> = ({ tinadContent, tinadType, dismiss }) => {
    return (
        <div>
            <div>Message: {tinadContent}</div>
            <div>Type:    {tinadType}</div>
            <div>{dismiss && <button onClick={dismiss}>Dismiss</button>}</div>
        </div>
    );
};

export const TinadComponent: React.FC<TinadNotificationsComponentProps> = ({ 
    template: CustomTemplate = DefaultTemplate,
    pageId,
    clientDismissFunction,
}) => {
    const { data: sdkNotifications, isLoading, isError, error } = useSDKData(pageId);

    const [ currentNotifications, setCurrentNotifications ] = useState<SDKNotification[]>([]);
    const [ displayedIndex, setDisplayedIndex ] = useState<number>(-1);

    const dismissNotification = async () => {
        console.log('react-ui: dismissNotification');
        if (currentNotifications) {
            const dismissedNotificationUuid = currentNotifications[displayedIndex].uuid;
            console.log(`Dismissing notification with uuid ${dismissedNotificationUuid}`);
            // Call core SDK to actually execute the dismissal API call.
            await dismissNotificationCore(dismissedNotificationUuid);
            
            if (displayedIndex + 1 == currentNotifications.length) {
                console.log('Clearing currentNotifications');
                setCurrentNotifications([]);
                setDisplayedIndex(-1);
            } else {
                setDisplayedIndex(displayedIndex + 1);
            }
            // Call client-provided dismiss function as a side effect (if one was passed in).
            if (clientDismissFunction) {
                clientDismissFunction();
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
            console.log(`New data received: ${JSON.stringify(sdkNotifications, null, 2)}`);
            console.log('Copying all notifications into currentNotifications.');
            setCurrentNotifications(_.cloneDeep(sdkNotifications));
            setDisplayedIndex(0);
        }
    }

    const TemplateToRender = CustomTemplate || DefaultTemplate;
    if (displayedIndex < 0) {
        console.log(`displayedIndex: ${displayedIndex} currentNotifications ${currentNotifications?.length}`);
        return <TemplateToRender tinadContent="None found" tinadType="none" />;
    }

    console.log('Returning datafull template where:');
    console.log(`displayedIndex: ${displayedIndex} currentNotifications ${currentNotifications?.length}`);

    // We do have a notification, so return its data merged into the template.
    return (
        <TemplateToRender 
        tinadContent={currentNotifications[displayedIndex]?.content}
        tinadType={currentNotifications[displayedIndex]?.notificationType}
        dismiss={dismissNotification}
        />);
}
