import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";
import { ActionIcon, Anchor, Code, CopyButton, Group, Skeleton, 
         Image, Button, Paper, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAPIKeys } from './APIKeysContext';
import { useDateFormatters } from '../../lib/DateFormattersProvider';
import { useConfig } from '../../lib/ConfigContext';
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
  const { tempKeyPresent, setTempKeyPresent } = useState(false);
  const { apiBaseUrl, getBearerHeader } = useConfig();
  const [ repoFiles, setRepoFiles ] = useState<Object | null>(null);

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

  const fetchExampleRepo = async () => {
    let filesObj = {};
    if (user) {
      const repoUrl = 'https://github.com/willkessler/this-is-not-a-drill-examples';
      try {
        const clerkId = user.id;
        const APIUrl = `${apiBaseUrl}/playground/fetch-example-app`;
        const response = await fetch(APIUrl, {
          method: 'POST',
          credentials: 'include',
          headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            clerkId, 
            repoUrl
          })
        });
        if (!response.ok) {
          throw new Error (`HTTP error! status: ${response.status}`);
        } else {
          console.log('Fetched repo contents from Tinad API.');                  
        }
        
        console.log('inside fetchExampleRepo');
        filesObj = await response.json();

      } catch (error) {
        console.error(`Error fetching repo, url: ( ${repoUrl} ).`, error);
        return null;
      }
    }

    // Inject a .env file using the current api key and other props into the file structure.
    // Since we cannot use import.meta.env (e.g. in stackBlitz), this file
    // is used to create "environment variables" on the fly.
    const envFileContents = `
export const VITE_API_BASE_URL = 'http://localhost:8080';
export const VITE_TINAD_ENDUSER_ID = 'user12345';
export const VITE_TINAD_IMAGE_LOCATION = 'https://raw.githubusercontent.com/willkessler/this-is-not-a-drill-examples/main/public/';
export const VITE_TINAD_API_KEY = 'OQONv9CK';
`;

    filesObj.files['src/env.ts'] = envFileContents;
    filesObj.files['public/index.html'] = filesObj.files['index.html'];
    filesObj.files['src/index.tsx'] = filesObj.files['src/main.tsx'];
    // make module resolution to be a known value for stackblitz
    filesObj.files['tsconfig.json'] = filesObj.files['tsconfig.json'].replace('bundler','nodenext');

    setRepoFiles(filesObj.files);
  }

  const openStackblitz = async () => {
    await sdk.openGithubProject('willkessler/eznotifications', {
      openFile:'examples/react_sdk/src/App.tsx',
      newWindow: true,
      height:'90vh',
      showSidebar: true,
      view: 'both'
    });
  }

  const gotoPlayground = async () => {
    // Check if a valid API key exists
    if (!temporaryAPIKeyValue || pastTense(playgroundAPIKeys[0]?.expiresAt.toISOString())) {
      // If no valid key, generate a new one
      await createTemporaryKey();
    }

    // Now, we assume `temporaryAPIKeyValue` holds a valid API key (either existing or newly generated)
    try {
      // Copy the API key to the clipboard
      await navigator.clipboard.writeText(temporaryAPIKeyValue);
      console.log('API Key copied to clipboard');
    } catch (err) {
      console.error('Failed to copy API key to clipboard', err);
    }

    // Open the playground
    //https://codesandbox.io/p/devbox/github/willkessler/this-is-not-a-drill-examples?file=%2FREADME.md
//    const codeSandboxUrl = 
//          'https://codesandbox.io/p/sandbox/github/willkessler/this-is-not-a-drill-examples/main?file=README.md';
    //const stackblitzUrl = 
    // 'https://stackblitz.com/~/github.com/willkessler/this-is-not-a-drill-examples?apiKey=abc123';
    
    //window.open(stackblitzUrl, '_blank');
    //sdk.embedGithubProject('stackblitz', 'willkessler/this-is-not-a-drill-examples', {

    // this works

    /* sdk.openGithubProject('willkessler/this-is-not-a-drill-examples', {
     *   newWindow: true,
     *   openFile: 'src/components/App.tsx',
     *   view: 'editor',
     *   height: 800,
     *   showSidebar: true,
     *   view: 'both'
     * }); */

    //console.log(`Files contains: ${JSON.stringify(repoFiles,null,2)}`);    
    console.log(`tsconfig.json: ${repoFiles['tsconfig.json']}`);

    sdk.openProject({
      files: repoFiles,
      newWindow: true,
      openFile: 'src/components/App.tsx',
      template: 'create-react-app',
      view: 'both',
      showSidebar: true,
      theme: 'dark',
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.22.3",
        "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
        "@mantine/core": "^7.6.1",
        "@mantine/hooks": "^7.6.1",
        "@tabler/icons-react": "^3.1.0",
        "@testing-library/jest-dom": "^5.17.0",
        "@testing-library/react": "^13.4.0",
        "@testing-library/user-event": "^13.5.0",
        "@this-is-not-a-drill/react-core": "latest",
        "@this-is-not-a-drill/react-ui": "latest",
        "@types/jest": "^27.5.2",
        "@types/node": "^16.18.83",
        "@types/react": "^18.2.58",
        "@types/react-dom": "^18.2.19",
        "dompurify": "^3.0.9",
        "lodash": "^4.17.21",
        "marked": "^12.0.1",
      }
    });
    
  }  

  useEffect(() => {
    fetchExampleRepo();
  }, []);

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
  
  return (
    <Paper style={{paddingTop:'10px',marginTop:'10px'}} radius="md" p="sm">
      <Title order={2}>
        Playground Testing
      </Title>
      <Text size="md" mt="md">You can try out the service instantly in <Anchor href="https://codesandbox.io">CodeSandbox</Anchor> playground.</Text>
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

        <Button onClick={gotoPlayground} style={{marginLeft:'10px'}}
          size="sm" variant="filled" color="green" disabled={repoFiles === null}>
          {temporaryAPIKeyValue === '' ? <>Generate + Copy A Key</> : <>Copy the Key</>}, and Open the Playground!
        </Button>
      </div>
      <div>
        { temporaryAPIKeyValue && (
            <Text fs="italic" style={{paddingTop:'15px'}}>
              Note: temporary key <span style={{padding:'2px', border:'1px dotted #666', fontStyle:'normal', color:'green'}}>{temporaryAPIKeyValue}</span> will {temporaryAPIKeyExpiration ? temporaryAPIKeyExpiration : ''}</Text>
        ) }
      </div>
      <div id="stackblitz">
      </div>
    </Paper>
  );
};


export default PlaygroundComponent;
