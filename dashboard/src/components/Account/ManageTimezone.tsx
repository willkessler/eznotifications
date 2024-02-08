import moment from 'moment-timezone';
import React, { useState } from 'react';
import { Select, Text } from '@mantine/core';

const ManageTimezone = () => {
    // Generate options for the Select component using moment-timezone

    const timezoneOptions = moment.tz.names().map((zone) => ({
        value: zone,
        label: zone,
    }));
    const [ selectedTimezone, setSelectedTimezone ] = useState('America/Los_Angeles');

    return (
        <>
        <Select
        checkIconPosition="left"
        label="Set your site's main timezone"
        value={selectedTimezone}
        description="All of your notifications will be set up in this timezone, regardless of where the recipient is."
        style={{maxWidth:'620px',marginTop:'10px'}}
        data={timezoneOptions}
        placeholder="Select your timezone"
        searchable
        allowDeselect={false}
        nothingFoundMessage="Nothing matches..."
        onChange={setSelectedTimezone}
            />
            </>
    );
}

export default ManageTimezone;
