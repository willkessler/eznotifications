import React, { useEffect, useState } from 'react';
import { ActionIcon, Checkbox, CopyButton, Tooltip, rem, Anchor, Button, Text } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import classes from './css/Settings.module.css';
import toast, { Toaster } from 'react-hot-toast';

const APIKeysPanel = () => {
  const productionApiKeyValue = 'X123';
  const [agreeToRegenerateProdKey, setAgreeToRegenerateProdKey] = useState(false);

  const createApiKey = async (apiKeyType) => {
    console.log('creating an api key for env: ', apiKeyType);
    const apiUrl = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}` +
          `/eznotifications/api-keys/create`;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeyType }),
      });;
      if (!response.ok) {
        throw new Error (`HTTP error! status: ${response.status}`);
      } else {
        console.log('created an API key');
      }
    } catch (error) {
      console.error(`Error creating API key of type: ( ${apiKeyType} ).`, error);
      throw error;
    }
  };

  const createProdApiKey = () => {
    if (agreeToRegenerateProdKey) {
      console.log('regenerating API key');
      createApiKey('production');
    } else {
      toast.error('You must check the "Are you positive?" checkbox first.', {
        duration: 5000,
        position: 'top-center',

        // Styling
        style: {
          minWidth:'500px',
        },

        // Change colors of success/error/loading icon
        iconTheme: {
          primary: '#fff',
          secondary: '#f00',
        },

        // Aria
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }      
  };


  const handleCopy = () => {
    copy(text);
/*
    Notification({
      title: 'Success',
      message: 'Copied to clipboard!',
      color: 'green'
    });
*/
  };
  
  return (
      <div className={classes.team} >
        <Toaster />
        <Text size="xl">Your API Keys</Text>

        <Text size="md">Development API Keys</Text>
        <Button onClick={() => createApiKey('development')} size="xs" style={{marginTop:'10px'}}>Generate new development key</Button>

        <Text size="md" style={{marginTop:'10px'}}>Production API Key</Text>

        <div className={classes.apiKeyRow}>
          <Text size="sm" className={classes.apiKeyDisplay}>X123u8</Text>

          <CopyButton value={productionApiKeyValue} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                  {copied ? (
                    <IconCheck style={{ width: rem(16) }} />
                  ) : (
                    <IconCopy style={{ width: rem(16) }} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </div>
        <Button onClick={createProdApiKey} size="xs" style={{marginTop:'10px', backgroundColor:'#f00'}}>Regenerate Production API Key</Button>
        <Checkbox style={{marginTop:'10px'}} 
                  checked={agreeToRegenerateProdKey} 
                  onChange={(event) => setAgreeToRegenerateProdKey(event.currentTarget.checked) }
                  label="Are you positive?" />
      </div>
  );
}

export default APIKeysPanel;
