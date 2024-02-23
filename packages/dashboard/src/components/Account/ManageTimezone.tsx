import moment from 'moment-timezone';
import React, { useState } from 'react';
import { Button, Select, Text } from '@mantine/core';
import { useSettings } from './SettingsContext';

const ManageTimezone = () => {
    // Generate options for the Select component using moment-timezone
  const { timezone,
          setTimezone } = useSettings();

  const timezoneOptions = moment.tz.names().map((zone) => ({
    value: zone,
    label: zone,
  }));

  return (
    <>
      <Select
        checkIconPosition="left"
        label="Set your application's main timezone"
        value={timezone}
        description="All of your notifications will be set up in this timezone, regardless of where the recipient is."
        style={{maxWidth:'620px',marginTop:'10px'}}
        data={timezoneOptions}
        placeholder="Select your timezone"
        searchable
        allowDeselect={false}
        nothingFoundMessage="Nothing matches..."
        onChange={(e) => { persistSelectedTimezone(e) }}
      />
    </>

    );
}

export default ManageTimezone;
