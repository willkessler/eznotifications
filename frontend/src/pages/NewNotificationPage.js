// src/pages/NewNotificationPage.js

import React from 'react';
import NotificationForm from '../components/NotificationForm';
import { useNavigate } from 'react-router-dom';

const NewNotificationPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/');
  };

  const handleSubmit = (notificationData) => {
    fetch(`${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/eznotifications`, {
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
      <h1>Create New Notification</h1>
      <NotificationForm onSubmit={handleSubmit} />
      <button type="button" onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default NewNotificationPage;
