import React, { useState } from 'react';
import { Anchor, AppShell, Burger, Button, Container, Group, Image,  
         Stack, Skeleton, Text,Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { HomePage } from './components/HomePage';
import Footer from './components/Footer';
import classes from './App.module.css';


export function App() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <>
    <AppShell
      header={{ height: 170 }}
      navbar={{
          width: '200px',
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
      }}
      padding="md"
    >
     <AppShell.Header className={classes.header}>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
       <Group gap="xs">
            <a href="/">
          <Image
            pe="xs"
            h={220}
            src="UnifiedFinancialLogo.png" />
            </a>
            <a href="/">
          <Image 
            me="xs"
            h={300}
            src="UnifiedTextLogo2.png" />
            </a>
         </Group>
     </AppShell.Header>

      <AppShell.Navbar className={classes.nav} p="md">
          <Stack justify="flex-start" align="flex-start">
            <Anchor fw={500} fz="lg">Transfer Money</Anchor>
            <Anchor fw={500} fz="lg">Pay Bills</Anchor>
            <Anchor fw={500} fz="lg">Deposit Checks</Anchor>
            <Anchor fw={500} fz="lg">View Statements</Anchor>
            <br />
            <Anchor fw={500} fz="lg">Logout</Anchor>
          </Stack>
      </AppShell.Navbar>
 
       <AppShell.Main>
            <HomePage />
       </AppShell.Main>

       <AppShell.Footer className={classes.footer}>
            <Footer />
       </AppShell.Footer>

    </AppShell>
</>
  );
}

export default App;

