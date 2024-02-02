import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProvider } from '@mantine/core';
import { Anchor, Button, Code, Group, Image, Modal, Textarea, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { Router } from './Router';
import { theme } from './theme';
import { UserButton, SignOutButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react"
import classes from './pages/NavbarSimple.module.css';

export default function App() {
  return (
    <>
      <MantineProvider theme={theme}>
        <SignedOut>
          <Text>You are signed out.</Text>
          <Button>
              <SignInButton afterSignInUrl="/dashboard">
                <Text>Sign in</Text>
              </SignInButton>
          </Button>
        </SignedOut>

        <SignedIn>
          <p>This content is truly private. Only signed in users can see this.</p>
          <UserButton />
            <Router />
        </SignedIn>
      </MantineProvider>
    </>
  );
}
