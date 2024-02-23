// MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LogoComponent from './LogoComponent';
import UserAuthentication from './UserAuthentication';
import mainClasses from './css/MainLayout.module.css';
import introClasses from '../Account/css/IntroPages.module.css';
import logoClasses from '../Layout/css/MainLayout.module.css';
import Tutorial from './Tutorial';
import { ActionIcon, Anchor, AppShell, Burger, Code, CopyButton, Group, Skeleton, 
         Image, Button, rem, Space, Text, TextInput, Title, Tooltip, UnstyledButton } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

const MainLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell
      header={{ 
        height: 80,
        collapsed: !isSmallScreen,
      }}
      navbar={{ 
        width: 160,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" hiddenFrom="sm">
          <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md">
        <LogoComponent />
        <Navbar toggleMobile={toggleMobile} toggleDesktop={toggleDesktop} />

        <Text size="xs" className={logoClasses.versionContainer}>
          version: 1.0
        </Text>

      </AppShell.Navbar>

      <AppShell.Main>
        <AppShell.Section style={{paddingTop:'4px'}}>
          <main className={mainClasses.mainContent}>
            <Outlet /> {/* This is where the routed content is rendered */}
          </main>
          <Tutorial />
        </AppShell.Section>
      </AppShell.Main>

    </AppShell>
  );
};

export default MainLayout;


