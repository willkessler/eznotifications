// src/pages/NotificationsPage.js

import React, { useEffect, useState } from 'react';
import NotificationList from '../components/NotificationList';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/eznotifications`)
      .then((response) => response.json())
      .then(data => setNotifications(data))
      .catch((error) => console.error('Error fetching notifications:', error));
  }, []);

  const handleEdit = (notificationId, updatedData) => {
    // Call API to update the notification
    // Then update the state or re-fetch notifications
  };

  const handleCancel = (notificationId) => {
    // Call API to cancel the notification
    // Then update the state or re-fetch notifications
  };

  return (
    <div>
      <h1>Notifications</h1>
      <NotificationList 
        notifications={notifications} 
        onEdit={handleEdit} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default NotificationsPage;
