import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { UserButton, SignOutButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react"

export default function App() {
  return (
    <>
      <SignedOut>
        <p>This content is public. Only signed out users can see this.</p>
        <SignInButton afterSignInUrl="/dashboard" />
      </SignedOut>
      <SignedIn>
        <p>This content is truly private. Only signed in users can see this.</p>
        <UserButton />
        <MantineProvider theme={theme}>
          <Router />
        </MantineProvider>
      </SignedIn>
    </>
  );
}
