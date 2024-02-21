import moment from 'moment-timezone';
import { useTimezone } from './TimezoneContext';
import { Select } from '@mantine/core';
import { DateTime } from 'luxon';

const timezoneOptions = moment.tz.names().map((zone) => ({
  value: zone,
  label: zone,
}));

const TimezonePicker = () => {
  const { userTimezone, setUserTimezone } = useTimezone();

  const onTimezoneChange = (selectedTimezone) => {
    setUserTimezone(selectedTimezone);
    localStorage.setItem('userTimezone', selectedTimezone);
  };

  return (
    <Select
      size="xs"
      label="Select the time zone you prefer to use (internally, we store UTC)."
      placeholder="Type to search"
      searchable
      nothingFoundMessage="No option found to match this choice"
      data={timezoneOptions}
      value={userTimezone}
      onChange={onTimezoneChange}
    />
  );
};

export default TimezonePicker;
