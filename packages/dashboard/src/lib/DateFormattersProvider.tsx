import React, { createContext, useContext } from 'react';
import { DateTime } from 'luxon';
import { useTimezone } from './TimezoneContext';

/*
  Library of date functionality needed throughout the front end of the app. 
  Used heavily by the NotificationsList, but also by the Playground interstitial.
*/

interface DateFormattersContextType {
    pastTense: (dateInISO: string) => boolean;
    formatDisplayDate: (prefix: string, date: Date | null) => string;
    formatDisplayTime: (date: Date | null) => string;
    formatDateForAPISubmission: (frontendDate: Date | null) => string | null;
};

const DateFormattersContext = createContext<DateFormattersContextType>({
    pastTense: (dateInISO: string) => false,
    formatDisplayDate: (prefix: string, date: Date | null) => '', 
    formatDisplayTime: (date: Date | null) => '',
    formatDateForAPISubmission: (frontendDate: Date | null) => '',
});

export const useDateFormatters = () => useContext(DateFormattersContext);

export const DateFormattersProvider: React.FC<{children: React.ReactNode}>  = ({ children }) => {
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
    
    const formatDisplayDate = (prefix:string , date: Date | string | null) => {
        if (date === null) {
            return '';
        }

        let isoDate;
        // Convert the Date object to an ISO string if required
        if (typeof(date) !== 'string') {
            isoDate = date.toISOString();
        } else {
            isoDate = date;
        }
        
        // Parse the ISO date string as UTC
        const utcDate = DateTime.fromISO(isoDate, { zone: 'utc' });

        // Convert the DateTime object to the user's timezone
        const userTimezoneDate = utcDate.setZone(userTimezone);

        // Format the DateTime object for display using toFormat for precise control
        const displayFormat = "LLL dd, yyyy h:mma";
        const displayDate = userTimezoneDate.toFormat(displayFormat) + ' ' + userTimezoneDate.offsetNameShort;

        return `${prefix}: ${displayDate}`;

    };

    function formatDisplayTime(date: Date | null) {
        if (!date) return '';

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const formatDateForAPISubmission = (frontendDate : Date | null) => {
        console.log(`Formatting date: ${frontendDate} for backend, timezone: ${userTimezone}`);
        if (frontendDate) {
            const backendDateTime = DateTime.fromJSDate(frontendDate, { zone: userTimezone });
            const backendDateTimeUTC = backendDateTime.toUTC();
            const backendDateTimeUTCString = backendDateTimeUTC.toISO();
            return backendDateTimeUTCString;
        } else {
            console.log('Undefined frontendDate passed in.');
            return null;
        }
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
          
