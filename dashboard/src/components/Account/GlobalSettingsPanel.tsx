import React, { useEffect, useState } from 'react';
import {  Button, Menu, rem, Text, Textarea } from '@mantine/core';
import ManageTimezone from './ManageTimezone';
import classes from './css/Settings.module.css';
import {
  IconSettings,
  IconSearch,
  IconPhoto,
  IconMessageCircle,
  IconTrash,
  IconArrowsLeftRight,
} from '@tabler/icons-react';

const GlobalSettingsPanel = () => {
  const [ lookForwardDuration, setLookForwardDuration] = useState('1 week');
  const lookForwardDurations = [ '1 week', '2 weeks', '4 weeks'];
  const updateAllowedDomains = () => {
    return null;
  };

  const updateLookForwardDuration = (value) => {
    setLookForwardDuration(value);
  };
  
  return (
      <div className={classes.team} >
        <Text size="xl">Application Settings</Text>
        <ManageTimezone />
        <Textarea 
          style={{maxWidth:'620px',marginTop:'10px'}}
          label="Set your site's permitted domains"
          description="Enter all top-level domains (TLD's) which are allowed to retrieve notifications from us (one per line, no commas). We will allow these domains using CORS."
          placeholder={`example1.com
example2.com
example3.com`}
          size="sm"
          minRows={5}
          autosize
        />
        <Button onClick={updateAllowedDomains} size="xs" style={{marginTop:'10px'}}>Save</Button>

        <Text size="md" style={{marginTop:'25px'}}>Set your look-forward duration to:</Text>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button size="xs">{lookForwardDuration}</Button>
          </Menu.Target>

          <Menu.Dropdown>
            {lookForwardDurations.map(choice => (
                <Menu.Item
                  key={choice}
                  onClick={() => setLookForwardDuration(choice)}
                  color={choice === lookForwardDuration ? 'blue' : 'white'}
                >
                  {choice}
            </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
  );
}

export default GlobalSettingsPanel;
