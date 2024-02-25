import React from 'react';
import useFetchData from '@thisisnotadrill/sdk';

interface Notification {
  content: string;
  pageId: string;
  notificationType: string;
  environments: [string];
}

const NotificationsComponent = () => {
  const { data: notifications, isLoading, error } = 
        useFetchData({
          userId: 'userAbc',
        });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {notifications?.map((notification:Notification, index:number) => (
          <li key={index}>
              - Message: {notification.content}<br />
              - Type: {notification.notificationType}<br />
          </li> // Assuming notifications have a 'message' property
      ))}
    </ul>
  );
};

export default NotificationsComponent;
