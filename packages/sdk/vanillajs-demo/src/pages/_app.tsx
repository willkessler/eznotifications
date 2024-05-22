import { AppProps } from 'next/app'; // Import the type for AppProps
import Layout from '../app/layout';  // Adjust the path as necessary
import '../app/globals.css'; // Global styles
import { useState, useEffect } from 'react'
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import { MantineProvider } from '@mantine/core';

function Configurator({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)
  const [sdkConfig, setSdkConfig] = useState({}); // Initial state for the SDK config
  const [code, setCode] = useState('');
 
  // Because we want each time we enter the demo to be "starting fresh", we delete
  // the tinad userId and apiKey in localstorage on first load.
  const erasePreviousTinadLocalStorage = ():void => {
    if (typeof window !== 'undefined') {
      // Check and remove the 'tinad' item from localStorage
      const previousTinadConfigString = localStorage.getItem('tinad');
      if (previousTinadConfigString) {
        const previousTinadConfig = JSON.parse(previousTinadConfigString);
        if (previousTinadConfig.userId) {
          delete(previousTinadConfig.userId);
        }
        previousTinadConfig.firstLoad = true;
        localStorage.setItem('tinad', JSON.stringify(previousTinadConfig));
      }
    }
  }

  useEffect(() => {
    setIsClient(true)
    erasePreviousTinadLocalStorage();
  }, [])

  return (
      <MantineProvider defaultColorScheme="dark">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
  );
}

export default Configurator;
