// src/pages/NewNotificationPage.js

import React from 'react';
import NotificationForm from '../components/Notifications/NotificationForm';
import { useNavigate } from 'react-router-dom';

export function NewNotificationPage () {
  const navigate = useNavigate();

  const handleSubmit = (notificationData) => {
    fetch(`${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/eznotifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Notification created:', data);
        // Redirect to notifications list or show a success message
      })
      .then((data) => {
        navigate('/');
      })        
      .catch((error) => console.error('Error creating notification:', error));
  };

  return (
    <div>
      <h1>New notification</h1>
      <NotificationForm onSubmit={handleSubmit} />
    </div>
  );
};

