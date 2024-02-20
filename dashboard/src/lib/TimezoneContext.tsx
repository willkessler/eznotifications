import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const TimezoneContext = createContext();

// Provide a context provider
export const TimezoneProvider = ({ children }) => {
  const [userTimezone, setUserTimezone] = useState(localStorage.getItem('userTimezone') || 
                                                   Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    // Update the timezone from localStorage when the component mounts
    const storedTimezone = localStorage.getItem('userTimezone');
    if (storedTimezone) {
      setUserTimezone(storedTimezone);
    }
  }, []);

  return (
    <TimezoneContext.Provider value={{ userTimezone, setUserTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
};

// Custom hook to use the timezone context
export const useTimezone = () => useContext(TimezoneContext);
