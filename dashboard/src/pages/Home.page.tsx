
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Home } from '../components/Home/Home';
import { NotificationsList } from '../components/Notifications/NotificationsList';
import { Textarea, Button, Anchor } from '@mantine/core';

export function HomePage() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const goToNewNotification = () => {
    navigate('/new-notification'); // Use the path you've defined for the new notification form
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/eznotifications`)
      .then((response) => response.json())
      .then((data) => {
        setNotifications(data);
      })
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
        <Button onClick={goToNewNotification}>+ Add Notification</Button>
      <NotificationsList 
        notifications={notifications} 
        onEdit={handleEdit} 
        onCancel={handleCancel} 
      />
      </div>
    </div>
    
  );
};

