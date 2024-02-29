import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Anchor, Button, Menu, rem, Select, Title, Text, TextInput, Textarea } from '@mantine/core';
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
          permittedDomains,
          refreshFrequency,
          setPermittedDomains,
          setRefreshFrequency,
        } = useSettings();
  const { user } = useUser();

  const [isChanged, setIsChanged] = useState(false);
  
  const handlePermittedDomainsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPermittedDomains(e.target.value);
      setIsChanged(true);
  };

  const handleRefreshFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Use a regular expression to allow only numbers
      if (/^[0-9]*$/.test(newValue)) {
          setRefreshFrequency(parseInt(newValue));
          setIsChanged(true);
      }
  };
  
  const revertValues = () => {
    getSettings();
    setIsChanged(false);
  };

  const handleSaveSettings = () => {
      if (user) {
          saveSettings(user.id);
          setIsChanged(false);
      }
  };
  
  useEffect(() => {
    if (user) {
      getSettings();
    }
  }, [user]);

  return (
      <div className={classes.globalSettingsPanel} >
        <Title style={{borderBottom:'1px solid #555', paddingTop:'15px', marginTop:'5px'}} order={3}>Application Settings</Title>

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
          value={permittedDomains || ''}
          onChange={(e) => { handlePermittedDomainsChange(e) }}
        />

        <Text size="sm" style={{marginTop:'10px'}}>SDK Refresh Frequency (seconds)</Text>
        <TextInput
          description="Enter how frequently you want the client SDK to check for new notifications for an active user."
          style={{maxWidth:'620px',marginTop:'5px'}}
          size="sm"
          value={refreshFrequency || 300}
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
