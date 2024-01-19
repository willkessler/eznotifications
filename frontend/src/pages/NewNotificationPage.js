// src/pages/NewNotificationPage.js

import React from 'react';
import NotificationForm from '../components/NotificationForm';

const NewNotificationPage = () => {
  const handleSubmit = (notificationData) => {
    fetch('http://localhost:5000/notifications', { // Adjust the URL based on your API endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Notification created:', data);
      // Redirect to notifications list or show a success message
    })
    .catch((error) => console.error('Error creating notification:', error));
  };

  return (
    <div>
      <h1>Create New Notification</h1>
      <NotificationForm onSubmit={handleSubmit} />
    </div>
  );
};

export default NewNotificationPage;
