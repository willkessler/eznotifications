// MainLayout.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { Anchor, AppShell, Burger, Group, Skeleton, Image, Button, rem, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import LogoComponent from '../Layout/LogoComponent';
import Navbar from '../Layout/Navbar';
import UserAuthentication from '../Layout/UserAuthentication';
import classes from './css/IntroPages.module.css';

const  OnboardComponent = () => {
  const { isSignedIn } = useUser();
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
    
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      header={{ height: 160, collapsed: { mobile: opened }  }}
      padding="lg"
    >
      <AppShell.Header >
        <Group h="100%" px="md">
          <Anchor href="/" className={classes.logoAnchor}>
          </Anchor>
        </Group>
      </AppShell.Header>
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

      <AppShell.Navbar p="xl">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <AppShell.Section>
          <Anchor href="/" className={classes.logoAnchor}>
            <Image src="/ThisIsNotADrill_cutout.png" w={155} />
          </Anchor>
          {/*<Navbar />*/}
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <AppShell.Section style={{paddingTop:'20px'}}>
          <Title order={2}>
            Welcome to <span className={classes.introBrandTitle}>This is Not A Drill!</span>
          </Title>
        </AppShell.Section>
      </AppShell.Main>
    </AppShell>
  );
};

export default OnboardComponent;
