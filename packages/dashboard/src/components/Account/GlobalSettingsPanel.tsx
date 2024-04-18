import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Anchor, Button, Card, Menu, rem, Select, Stack, Title, Text, Textarea } from '@mantine/core';
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
          setPermittedDomains,
          environments,
          setEnvironments,
        } = useSettings();
  const { user } = useUser();

  const [isChanged, setIsChanged] = useState(false);
  
  const handlePermittedDomainsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPermittedDomains(e.target.value);
    setIsChanged(true);
  };
  
  const handleEnvironmentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEnvironments(e.target.value);
      setIsChanged(true);
  };

  const revertValues = () => {
    getSettings();
    setIsChanged(false);
  };

  const handleSaveSettings = () => {
      if (user) {
          const userDriven = true; // ensure whatever data the user has set in the form will override whatever is in the db.
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
        <Title style={{marginTop:'15px', marginBottom:'5px', borderBottom:'1px solid #555'}} order={3}>Domains and Environments</Title>
        <Stack>
          <Card p="sm" style={{marginTop:'10px'}}>
            <Textarea 
              style={{maxWidth:'620px'}}
              label="Web Domains"
              description="Enter any domains that you want to target notifications to (one per line, no commas). Each notification can be targeted to show up on one or more of these sites. If you leave this blank, notifications will appear wherever you have installed the SDK."
              placeholder={`example1.com
example2.com
              `}
              size="sm"
              minRows={5}
              autosize
              value={permittedDomains || ''}
              onChange={(e) => { handlePermittedDomainsChange(e) }}
            />
            <Textarea 
              style={{maxWidth:'620px',marginTop:'15px'}}
              label="Environments"
              description="Enter any environment labels where you want notifications to appear (one per line, no commas). Most common labels are included by default."
              placeholder={`Development
Staging
UAT
Production`}
              size="sm"
              minRows={5}
              autosize
              value={environments.split(',').join('\n') || ''}
              onChange={(e) => { handleEnvironmentsChange(e) }}
            />

            <div style={{ display: 'flex', flexDirection:'row', alignItems: 'center', marginTop:'15px' }}>
              <Button disabled={!isChanged}  onClick={handleSaveSettings} size="xs">Save Changes</Button>
              <Anchor size="xs" component="button" type="button" onClick={revertValues} style={{marginLeft:'10px', marginBottom:0, color:'#999'}} >
                Cancel
              </Anchor>
            </div>
          </Card>
        </Stack>
      </div>
  );
}

export default GlobalSettingsPanel;
