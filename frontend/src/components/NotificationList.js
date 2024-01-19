import React from 'react';

const NotificationList = ({ notifications }) => {
  return (
    <div class="Notifications-List">
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.content}
          {notification.text} - {notification.canceled ? 'Canceled' : 'Active'}
          {/* Dropdown menu for edit/cancel here */}
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
