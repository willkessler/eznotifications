import React, { createContext, useContext, useState, useEffect } from 'react';
import type TimezoneContextType from '../../lib/shared_dts/TimezoneContext';

const defaultTimezoneContextValue: TimezoneContextType = {
  userTimezone: '',
  setUserTimezone: (tz: string) => {},
};

// Create a context with the defaults from above.
const TimezoneContext = createContext(defaultTimezoneContextValue);

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
