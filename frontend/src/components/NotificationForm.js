import React, { useState } from 'react';

const NotificationForm = ({ onSubmit }) => {
  const [notificationData, setNotificationData] = useState({
    content: '',
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
        name="content" 
        value={notificationData.text} 
        onChange={handleChange} 
        placeholder="Enter notification text here" 
      />
      {/* Other fields for pageId, startDate, endDate */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default NotificationForm;
