import React from 'react';
import useSDKData, { SDKNotification } from '@thisisnotadrill/react-core';

const NotificationsComponent = () => {
  const { data: SDKNotification[], isLoading, isError, error } =
        useSDKData({
        });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !sdkNotifications) return <div>Error: {error?.message || "No notifications"}</div>;

    return (
        <ul>
            {sdkNotifications?.map((sdkNotification:SdkNotification, index:number) => (
                <li key={index}>
                    - Message: {sdkNotification.content}<br />
                    - Type: {sdkNotification.notificationType}<br />
                    </li>
            ))}
        </ul>
    );
};

export default NotificationsComponent;
