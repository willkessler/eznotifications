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
         Image, Button, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const MainLayout = () => {
  const [opened, handlers] = useDisclosure(false);

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
      <Burger opened={opened} onClick={() => { handlers.open(); handlers.toggle(); }} hiddenFrom="sm" size="sm" />

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <LogoComponent />
          <Navbar />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <AppShell.Section style={{paddingTop:'8px'}}>
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
