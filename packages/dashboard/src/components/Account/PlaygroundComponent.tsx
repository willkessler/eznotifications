import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";
import { ActionIcon, Anchor, Code, CopyButton, Group, Skeleton, 
         Image, Button, Paper, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAPIKeys } from './APIKeysContext';
import { useDateFormatters } from '../../lib/DateFormattersProvider';
import sdk from '@stackblitz/sdk';

import LogoComponent from '../Layout/LogoComponent';
import Navbar from '../Layout/Navbar';
import UserAuthentication from '../Layout/UserAuthentication';
import introClasses from './css/IntroPages.module.css';
import logoClasses from '../Layout/css/MainLayout.module.css';
import apiKeyClasses from './css/APIKeys.module.css';

const PlaygroundComponent = () => {
  const { isSignedIn,user } = useUser();
  const { createAPIKey, fetchAPIKeys, playgroundAPIKeys } = useAPIKeys();
  const { pastTense, formatDisplayDate, formatDisplayTime } = useDateFormatters();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
    
  const [opened, { toggle }] = useDisclosure();
  const [ temporaryAPIKeyValue,  setTemporaryAPIKeyValue ] = useState('');
  const [ temporaryAPIKeyExpiration,  setTemporaryAPIKeyExpiration ] = useState('');

  const createTemporaryKey = async () => {
    if (!isSignedIn) {
      return; // can't do it if you ain't signed in
    }
    await createAPIKey('development', user.id, true);
    await fetchAPIKeys(user.id);
  }

  const openStackblitz = async () => {
    await sdk.openGithubProject('willkessler/eznotifications', {
      openFile:'examples/react_sdk/src/App.tsx',
      newWindow: true,
    });
  }


  useEffect(() => {
    if (user && user.id) {
      fetchAPIKeys(user.id);
    }
  }, [fetchAPIKeys, user]);

  useEffect(() => {
    if (playgroundAPIKeys.length > 0) {
      if (playgroundAPIKeys[0]?.expiresAt) {
        if (!pastTense(playgroundAPIKeys[0].expiresAt.toISOString())) {
          const temporaryKeyVal = playgroundAPIKeys[0].apiKey;

          const temporaryKeyExpiration = formatDisplayDate('expire at', playgroundAPIKeys[0].expiresAt);
          console.log(`Temporary API key: ${temporaryKeyVal}`);
          setTemporaryAPIKeyValue(temporaryKeyVal); // show latest one
          setTemporaryAPIKeyExpiration(temporaryKeyExpiration);
        }
      }
    }
  }, [playgroundAPIKeys]);
  
  const gotoPlayground = () => {
    const codeSandboxUrl = 'https://codesandbox.io/p/github/codesandbox/codesandbox-template-vite-react/main';
    window.open(codeSandboxUrl, '_blank');
  };
  
  return (
    <Paper style={{paddingTop:'10px',marginTop:'10px'}} radius="md" p="sm">
      <Title order={2}>
        Playground Testing
      </Title>
      <Text size="md" mt="md">You can try out the service immediately in a playground over at <Anchor href="https://codesandbox.io">CodeSandbox</Anchor>.</Text>
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
        <Button onClick={gotoPlayground}
                size="sm" variant="filled" color="green" style={{ marginLeft:'30px' }}>Open the playground!
        </Button>
      </div>
      <div>
        <Button onClick={createTemporaryKey} size="xs" variant="white" color="gray" style={{ marginTop: '10px' }}>
          Generate temporary API key
        </Button>
        { temporaryAPIKeyValue && (
            <Text fs="italic" style={{paddingTop:'15px'}}>
            The playground key <span style={{padding:'2px', border:'1px dotted #666', fontStyle:'normal', color:'green'}}>{temporaryAPIKeyValue}</span>
              &nbsp;is temporary and will {temporaryAPIKeyExpiration ? temporaryAPIKeyExpiration : ''}</Text>
          ) }
      </div>
      <div>
        <Title p="xl" order={5}>Stackblitz demo</Title>
        <Button onClick={openStackblitz} size="md">Open playground</Button>
      </div>
    </Paper>
  );
};


export default PlaygroundComponent;
