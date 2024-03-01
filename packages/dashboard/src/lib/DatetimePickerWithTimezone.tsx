import { Text } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput, DateValue } from '@mantine/dates';
import { useState } from 'react';
import { DateTime } from 'luxon';
import Expando from './Expando';
import { useTimezone } from './TimezoneContext';

// Define the props expected by your component
interface DatetimePickerWithTimezoneProps {
    onChange: (date: DateValue) => void;
    // Include other props here as needed, using an intersection type
    [key: string]: any;
}

const DatetimePickerWithTimezone: React.FC<DatetimePickerWithTimezoneProps> = ({ onChange, ...props }) => {
    const [dateValue, setDateValue] = useState<DateValue | null>( null );
    const { userTimezone, setUserTimezone } = useTimezone();

    const handleDateChange = (date: DateValue) => {
        setDateValue(date);
        if (onChange) {
            // Note that we are passing a mantine DateValue down to the onChange function passed to this component, NOT a Date().
            onChange(date);
        }
    };

    return (
        <div>
            <DateTimePicker
        value={dateValue}
        onChange={handleDateChange}
        {...props}
            />
            </div>
    );
};

export default DatetimePickerWithTimezone;
