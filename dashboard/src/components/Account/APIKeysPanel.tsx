import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text, useClipboard } from '@mantine/core';
import classes from './css/Settings.module.css';


const APIKeysPanel = () => {
  const createApiKey = () => {
    return null;
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
        <Text size="xl">Your API Keys</Text>

        <Text size="md">Development API Keys</Text>
        <Button onClick={createApiKey} size="xs" style={{marginTop:'10px'}}>Create new API Key</Button>

        <Text size="md">Production API Key</Text>
        <Text size="sm" style={classes.apiKey}>X123u8</Text>
        <Button onClick={handleCopy}>Copy to Clipboard</Button>
        <Button onClick={createApiKey} size="xs" style={{marginTop:'10px', backgroundColor:'#f00'}}>Regenerate Production API Key</Button>

      </div>
  );
}

export default APIKeysPanel;
