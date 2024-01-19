import React, { useState } from 'react';

const NotificationForm = ({ onSubmit }) => {
  const [notificationData, setNotificationData] = useState({
    text: '',
    pageId: '',
    startDate: '',
    endDate: '',
    canceled: false
  });

  const handleChange = e => {
    setNotificationData({ ...notificationData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(notificationData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="text" 
        value={notificationData.text} 
        onChange={handleChange} 
        placeholder="Notification Text" 
      />
      {/* Other fields for pageId, startDate, endDate */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default NotificationForm;
