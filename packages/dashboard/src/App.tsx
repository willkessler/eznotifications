import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Anchor, Button, Code, Group, Image, Modal, Textarea, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import RouterComponent from './components/Router';
import { ConfigProvider } from './lib/ConfigContext';

import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes';
import classes from './pages/NavbarSimple.module.css';
import { TimezoneProvider } from './lib/TimezoneContext';
import { TinadSDKProvider } from '@this-is-not-a-drill/react-core';

// Import your publishable key for Clerk
const clerkKey = (import.meta.env.VITE_IS_DEMO_SITE === 'true' ? import.meta.env.VITE_CLERK_DEMO_PUBLISHABLE_KEY : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
 
if (!clerkKey) {
  throw new Error("Missing Publishable Key")
}

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={clerkKey}
      appearance={{
        baseTheme: dark,
        signIn: { baseTheme: 'neobrutalism' as any }
      }}
    >
      <ConfigProvider>
        <Router>
          <MantineProvider defaultColorScheme="dark" >
            <TimezoneProvider>
              <TinadSDKProvider environments="Development" skipPolling={true} >
                <RouterComponent />
              </TinadSDKProvider>
            </TimezoneProvider>
          </MantineProvider>
        </Router>
      </ConfigProvider>
    </ClerkProvider>
  );
}
