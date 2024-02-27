import React from 'react';
import useFetchData, { TinadNotification } from '@thisisnotadrill/sdk';

const NotificationsComponent = () => {
  const { data: tinadNotifications, isLoading, isError, error } =
        useFetchData({
        });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !tinadNotifications) return <div>Error: {error?.message || "No notifications"}</div>;

    return (
        <ul>
            {tinadNotifications?.map((tinadNotification:TinadNotification, index:number) => (
                <li key={index}>
                    - Message: {tinadNotification.content}<br />
                    - Type: {tinadNotification.notificationType}<br />
                    </li>
            ))}
        </ul>
    );
};

export default NotificationsComponent;
