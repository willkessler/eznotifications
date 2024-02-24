import React from 'react';
import useFetchData from '@thisisnotadrill/sdk';

interface Notification {
  message: string;
  // Add other properties of notifications here
}

const NotificationsComponent = () => {
  const { data: notifications, isLoading, error } = useFetchData({/* params here */});

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {notifications?.map((notification:Notification, index:number) => (
        <li key={index}>{notification.message}</li> // Assuming notifications have a 'message' property
      ))}
    </ul>
  );
};

export default NotificationsComponent;
