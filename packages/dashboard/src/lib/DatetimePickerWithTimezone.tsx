import { Text } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput } from '@mantine/dates';
import { useState } from 'react';
import { DateTime } from 'luxon';
import Expando from './Expando';
import { useTimezone } from './TimezoneContext';

const DatetimePickerWithTimezone = ({ onChange, ...props }) => {
  const [dateValue, setDateValue] = useState(new Date());
  const { userTimezone, setUserTimezone } = useTimezone();

  const handleDateChange = (date) => {
    setDateValue(date);
    if (onChange) {
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
