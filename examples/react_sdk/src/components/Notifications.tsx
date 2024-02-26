import React from 'react';
import useFetchData, { TinadNotification } from '@thisisnotadrill/sdk';

const NotificationsComponent = () => {
    const { data: tinadNotifications, isLoading, isError, error } =
        useFetchData({
            userId: 'userTron',
        });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;

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
