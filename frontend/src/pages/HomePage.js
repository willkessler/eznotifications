// src/pages/Homepage.js

import React, { useEffect, useState } from 'react';
import NotificationList from '../components/NotificationList';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const goToNewNotification = () => {
    navigate('/new-notification'); // Use the path you've defined for the new notification form
  };

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
      <h1>EZNotifications Dashboard</h1>
      <div>
        <button onClick={goToNewNotification}>Create New Notification</button>
      </div>
      <NotificationList 
        notifications={notifications} 
        onEdit={handleEdit} 
        onCancel={handleCancel} 
      />
    </div>
    
  );
};

export default HomePage;

