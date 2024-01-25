import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext({
  refreshNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);
  const [highlightedId, setHighlightedId] = useState(null); // when we create or update a notification, we'll highlight it in the notificationsList

  const refreshNotifications = useCallback(() => {
    setRefreshToken((prev) => prev + 1); // Increment the token to trigger a refresh
  }, []);

  const highlightNotification = useCallback((id) => {
    setHighlightedId(id);

    // Remove highlight after 5 seconds
    setTimeout(() => setHighlightedId(null), 5000);
  }, []);
  

  return (
    <NotificationsContext.Provider value={{ refreshNotifications, refreshToken, highlightedId, highlightNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};
