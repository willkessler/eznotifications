import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";
import { ActionIcon, Anchor, AppShell, Burger, Code, CopyButton, Group, Skeleton, 
         Image, Button, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import LogoComponent from '../Layout/LogoComponent';
import Navbar from '../Layout/Navbar';
import UserAuthentication from '../Layout/UserAuthentication';
import introClasses from './css/IntroPages.module.css';
import logoClasses from '../Layout/css/MainLayout.module.css';
import apiKeyClasses from './css/APIKeys.module.css';


const SandboxComponent = () => {
  const { isSignedIn } = useUser();
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
    
  const [opened, { toggle }] = useDisclosure();
  const [ temporaryAPIKeyValue,  setTemporaryAPIKeyValue ] = useState(null);

  const gotoSandbox = () => {
    const codeSandboxUrl = 'https://codesandbox.io/p/github/codesandbox/codesandbox-template-vite-react/main';
    window.open(codeSandboxUrl, '_blank');
  };
  
  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      header={{ height: 160, collapsed: { mobile: opened }  }}
      padding="lg"
    >
      <AppShell.Header >
        <Group h="100%" px="md">
          <Anchor href="/" className={introClasses.logoAnchor}></Anchor>
        </Group>
      </AppShell.Header>
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Anchor href="/" className={introClasses.logoAnchor}>
            <Image src="/ThisIsNotADrill_cutout.png" w={155} />
          </Anchor>
          <div className={logoClasses.versionContainer}>
            <Code fw={700}>v1.0</Code>
          </div>
          <Navbar />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <AppShell.Section style={{paddingTop:'20px'}}>
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
            <Button size="xs" variant="white" color="gray" style={{ marginLeft:'15px', marginTop: '10px' }}>Generate temporary API key</Button>
          </div>

        </AppShell.Section>
      </AppShell.Main>
    </AppShell>
  );
};


export default SandboxComponent;
