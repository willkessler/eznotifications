import React, { createContext, useContext } from 'react';
import { DateTime } from 'luxon';
import { useTimezone } from './TimezoneContext';

/*
  Library of date functionality needed throughout the front end of the app. 
  Used heavily by the NotificationsList, but also by the Sandbox interstitial.
*/

const DateFormattersContext = createContext({
});

export const useDateFormatters = () => useContext(DateFormattersContext);

export const DateFormattersProvider = ({ children }) => {
  // We need to get user's local timezone to format dates appropriated. 
    const { userTimezone, setUserTimezone } = useTimezone();

    /**
     * Converts an ISO date string from the API into the user's chosen timezone.
     * @param {string} apiDate - The ISO date string from the API (e.g., "2024-02-09T17:00:00.665Z").
     * @param {string} userTimezone - The user's chosen timezone (e.g., "America/New_York").
     * @returns {string} - The date formatted in the user's timezone.
     */

    const pastTense = (dateInISO: string) => {
        // Assuming 'date' is the ISO string you get from the API
        const utcDate = DateTime.fromISO(dateInISO, { zone: 'utc' });
        // Get the current date and time in UTC
        const now = DateTime.utc();
        // Check if the UTC date is in the past
        const isInPast = utcDate < now;
        return isInPast;
    };
    
    const formatDisplayDate = (prefix, date) => {
        if (date === null) {
            return '';
        }
        
        // Parse the ISO date string as UTC
        const utcDate = DateTime.fromISO(date, { zone: 'utc' });

        // Convert the DateTime object to the user's timezone
        const userTimezoneDate = utcDate.setZone(userTimezone);

        // Format the DateTime object for display using toFormat for precise control
        const displayFormat = "LLL dd, yyyy h:mma";
        const displayDate = userTimezoneDate.toFormat(displayFormat) + ' ' + userTimezoneDate.offsetNameShort;

        return `${prefix}: ${displayDate}`;

    };

    function formatDisplayTime(date) {
        if (!date) return '';

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const formatDateForAPISubmission = (frontendDate : Date) => {
        console.log(`Formatting date: ${frontendDate} for backend, timezone: ${userTimezone}`);
        const backendDateTime = DateTime.fromJSDate(frontendDate, { zone: userTimezone });
        const backendDateTimeUTC = backendDateTime.toUTC();
        const backendDateTimeUTCString = backendDateTimeUTC.toISO();
        return backendDateTimeUTCString;
    };

    return (
      <DateFormattersContext.Provider 
        value={{ 
            pastTense,
            formatDisplayDate,
            formatDisplayTime,
            formatDateForAPISubmission,
        }}>
        {children}
      </DateFormattersContext.Provider>
    );
};
          
