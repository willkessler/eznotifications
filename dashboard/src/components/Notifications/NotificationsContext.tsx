import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext({
  refreshNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);

  const refreshNotifications = useCallback(() => {
    setRefreshToken((prev) => prev + 1); // Increment the token to trigger a refresh
  }, []);

  return (
    <NotificationsContext.Provider value={{ refreshNotifications, refreshToken }}>
      {children}
    </NotificationsContext.Provider>
  );
};
