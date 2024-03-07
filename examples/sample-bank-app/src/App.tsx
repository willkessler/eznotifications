import { MantineProvider, Anchor, AppShell, Burger, Button, Container, Group, Image,  Stack, Skeleton, Text,Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { HomePage } from './components/HomePage';
import classes from './App.module.css';

export function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <Container fluid className={classes.outerContainer}>
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
          <Group justify="flex-start">
          <Image 
            h={150}
            src="UncleAlsLogo.webp" />
          <Title className={classes.title}>Uncle Al's<span style={{fontSize:'20px'}}> Neighborhood Credit Union</span></Title>
         </Group>
     </AppShell.Header>

      <AppShell.Navbar className={classes.nav} p="md">
          <Stack justify="flex-start" align="flex-start">
            <Anchor fw={500} fz="lg" component="button">Transfer Money</Anchor>
            <Anchor fw={500} fz="lg" component="button">Pay Bills</Anchor>
            <Anchor fw={500} fz="lg" component="button">Deposit Checks</Anchor>
            <Anchor fw={500} fz="lg" component="button">View Statements</Anchor>
            <br />
            <Anchor fw={500} fz="lg" component="button">Logout</Anchor>
          </Stack>
      </AppShell.Navbar>
 
       <AppShell.Main className={classes.main}>
         <HomePage />
       </AppShell.Main>

       <AppShell.Footer className={classes.footer}>
          <Text>Copyright (c) 2024 Uncle Al's Neighborhood Credit Union, LLC</Text>
       </AppShell.Footer>

    </AppShell>
      </Container>
  );
}

export default App;

