import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Anchor, Button, Menu, rem, Select, Text, TextInput, Textarea } from '@mantine/core';
import classes from './css/Settings.module.css';
import { useSettings } from './SettingsContext';
import {
  IconSettings,
  IconSearch,
  IconPhoto,
  IconMessageCircle,
  IconTrash,
  IconArrowsLeftRight,
} from '@tabler/icons-react';

const GlobalSettingsPanel = () => {
  const { getSettings,
          saveSettings,
          timezone,
          permittedDomains,
          refreshFrequency,
          setTimezone,
          setPermittedDomains,
          setRefreshFrequency,
        } = useSettings();
  const { user } = useUser();

  const timezoneOptions = moment.tz.names().map((zone) => ({
    value: zone,
    label: zone,
  }));

  const [isChanged, setIsChanged] = useState(false);

  const handleTimezoneChange = (e) => {
    console.log('htz:', e);
    setTimezone(e);
    setIsChanged(true);
  };
  
  const handlePermittedDomainsChange = (e) => {
    setPermittedDomains(e.target.value);
    setIsChanged(true);
  };

  const handleRefreshFrequencyChange = (e) => {
    const newValue = event.target.value;
  
    // Use a regular expression to allow only numbers
    if (/^[0-9]*$/.test(newValue)) {
      setRefreshFrequency(newValue);
      setIsChanged(true);
    }
  };
  
  const revertValues = () => {
    getSettings();
    setIsChanged(false);
  };

  const handleSaveSettings = () => {
    saveSettings();
    setIsChanged(false);
  };
  
  useEffect(() => {
    if (user) {
      getSettings();
    }
  }, [user]);

  return (
      <div className={classes.globalSettingsPanel} >
        <Text size="xl">Application Settings</Text>

        <Select
          checkIconPosition="left"
          label="Your application's  timezone"
          description="All of your notifications will be configured in this timezone (regardless of where the recipient is). It's best to set this to a timezone that makes the most sense to you and your team."
          placeholder="Select your timezone"
          style={{maxWidth:'620px',marginTop:'10px'}}
          value={timezone}
          data={timezoneOptions}
          searchable
          allowDeselect={false}
          nothingFoundMessage="Nothing matches..."
          onChange={(e) => { handleTimezoneChange(e) }}
        />

        <Textarea 
          style={{maxWidth:'620px',marginTop:'10px'}}
          label="Your site's permitted domains"
          description="Enter all top-level domains (TLD's) which are allowed to retrieve notifications from us (one per line, no commas). We will allow only these domains (using CORS headers). (Note: this only applies if your application is a web application.)"
          placeholder={`example1.com
example2.com
`}
          size="sm"
          minRows={5}
          autosize
          value={permittedDomains}
          onChange={(e) => { handlePermittedDomainsChange(e) }}
        />

        <Text size="sm" style={{marginTop:'10px'}}>Refresh Frequency (seconds)</Text>
        <TextInput
          description="Enter how frequently you want the SDK to check for new notifications for an active user. (Note: if you are calling the 'This is Not a Drill!' API directly, this won't apply to you.)"
          style={{maxWidth:'620px',marginTop:'5px'}}
          size="sm"
          value={refreshFrequency}
          onChange={(e) => { handleRefreshFrequencyChange(e) }}
          required
        />
        <div style={{ display: 'flex', flexDirection:'row', alignItems: 'center', marginTop:'10px' }}>
          <Button disabled={!isChanged}  onClick={handleSaveSettings} size="xs">Save Changes</Button>
          <Anchor size="xs" component="button" type="button" onClick={revertValues} style={{marginLeft:'10px', marginBottom:0, color:'#999'}} >
            Cancel
          </Anchor>
        </div>
      </div>
  );
}

export default GlobalSettingsPanel;
