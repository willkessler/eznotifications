import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Anchor, Button, Code, Group, Image, Modal, Textarea, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import RouterComponent from './components/Router';
import { theme } from './theme';
//import { UserButton, SignOutButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react"
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import classes from './pages/NavbarSimple.module.css';

export default function App() {
  return (
      <KindeProvider
        clientId="77488266f6734f6285d3985eeab43af5"
        domain="https://thisisnotadrill-development.us.kinde.com"
        logoutUri={window.location.origin}
        redirectUri={window.location.origin}
      >
        <Router>
          <MantineProvider defaultColorScheme="dark" >

          {/*<SignedOut>
              <Text>You are signed out.</Text>
              <Button>
                  <SignInButton afterSignInUrl="/">
                    <Text>Sign in</Text>
                  </SignInButton>
              </Button>
            </SignedOut>
    
          <SignedIn>*/}
              <RouterComponent />
          {/*</SignedIn>*/}
          </MantineProvider>
        </Router>
       </KindeProvider>
    );
}
