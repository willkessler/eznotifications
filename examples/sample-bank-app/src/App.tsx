import { MantineProvider, Anchor, AppShell, Burger,Container, Group, Image,  Skeleton, Text,Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { HomePage } from './components/HomePage';
import classes from './App.module.css';

export function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <Container fluid style={{width:'100%'}}>
    <AppShell
      header={{ height: 120 }}
      navbar={{
          width: '150px',
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
            radius="md"
            h={100}
            fit="contain"
            src="PorfolioIcon.webp" />
          <Title className={classes.title}>Uncle Al's Savings and Loan</Title>
</Group>
     </AppShell.Header>

      <AppShell.Navbar className={classes.nav} p="md">
          <Anchor >Digital Wallet</Anchor>
          <Anchor >Get Help</Anchor>
          <Anchor >Logout</Anchor>
      </AppShell.Navbar>
 
       <AppShell.Main>
         <HomePage />
       </AppShell.Main>

       <AppShell.Footer className={classes.footer}>
          <Text>Copyright (c) 2024 Uncle Al's Savings and Loan, Inc</Text>
       </AppShell.Footer>

    </AppShell>
      </Container>
  );
}

export default App;

