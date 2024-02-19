import { Text } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput } from '@mantine/dates';
import { useState } from 'react';
import { DateTime } from 'luxon';

const DatetimePickerWithTimezone = ({ onChange, ...props }) => {
  const [dateValue, setDateValue] = useState(new Date());
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
      <Text size="xs">Your timezone: {timeZone}</Text>
    </div>
  );
};

export default DatetimePickerWithTimezone;
