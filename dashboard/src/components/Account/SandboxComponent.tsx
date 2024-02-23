import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";
import { ActionIcon, Anchor, Code, CopyButton, Group, Skeleton, 
         Image, Button, Paper, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAPIKeys } from './APIKeysContext';
import { useNotifications } from '../Notifications/NotificationsContext';

import LogoComponent from '../Layout/LogoComponent';
import Navbar from '../Layout/Navbar';
import UserAuthentication from '../Layout/UserAuthentication';
import introClasses from './css/IntroPages.module.css';
import logoClasses from '../Layout/css/MainLayout.module.css';
import apiKeyClasses from './css/APIKeys.module.css';

const SandboxComponent = () => {
  const { isSignedIn,user } = useUser();
  const { createAPIKey, fetchAPIKeys, sandboxAPIKeys } = useAPIKeys();
  const { formatDisplayDate, formatDisplayTime } = useNotifications();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
    
  const [opened, { toggle }] = useDisclosure();
  const [ temporaryAPIKeyValue,  setTemporaryAPIKeyValue ] = useState(null);
  const [ temporaryAPIKeyExpiration,  setTemporaryAPIKeyExpiration ] = useState(null);

  const createTemporaryKey = async () => {
    if (!isSignedIn) {
      return; // can't do it if you ain't signed in
    }
    await createAPIKey('development', user.id, true);
    await fetchAPIKeys(user.id);
  }

  useEffect(() => {
    if (user && user.id) {
      fetchAPIKeys(user.id);
    }
  }, [fetchAPIKeys, user]);

  useEffect(() => {
    if (sandboxAPIKeys.length > 0) {
      const temporaryKeyVal = sandboxAPIKeys[0].apiKey;
      const temporaryKeyExpiration = formatDisplayDate('Expires:', sandboxAPIKeys[0].expiresAt);
      console.log(`Temporary API key: ${temporaryKeyVal}`);
      setTemporaryAPIKeyValue(temporaryKeyVal); // show latest one
      setTemporaryAPIKeyExpiration(temporaryKeyExpiration);
    }
  }, [sandboxAPIKeys]);
  
  const gotoSandbox = () => {
    const codeSandboxUrl = 'https://codesandbox.io/p/github/codesandbox/codesandbox-template-vite-react/main';
    window.open(codeSandboxUrl, '_blank');
  };
  
  return (
    <Paper style={{paddingTop:'10px',marginTop:'10px'}} radius="md" p="sm">
      <Title order={2}>
        Sandbox Testing
      </Title>
      <Text size="md" mt="md">You can try out the service immediately in a sandbox over at <Anchor href="https://codesandbox.io">CodeSandbox</Anchor>.</Text>
      <Text size="md" mt="sm">
        Click "Generate" to get a key that is valid for the next hour. 
        Then, click the green button to experiment with the service with your temporary key.
      </Text>
      <div style={{marginTop:'20px'}} className={apiKeyClasses.apiKeyRow}>
        <Text size="md"  className={apiKeyClasses.apiTemporaryKeyDisplay}>
          {temporaryAPIKeyValue}
        </Text>

        <CopyButton value={temporaryAPIKeyValue} timeout={2000} >
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied Temporary API Key!' : 'Copy'} withArrow position="right">
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
        <Button onClick={gotoSandbox}
                size="sm" variant="filled" color="green" style={{ marginLeft:'30px' }}>Open the sandbox!
        </Button>
      </div>
      <div>
        <Button onClick={createTemporaryKey} size="xs" variant="white" color="gray" style={{ marginTop: '10px' }}>
          Generate temporary API key
        </Button>
      </div>
    </Paper>
  );
};


export default SandboxComponent;
