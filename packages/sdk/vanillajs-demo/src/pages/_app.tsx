import { AppProps } from 'next/app'; // Import the type for AppProps
import Layout from '../app/layout';  // Adjust the path as necessary
import '../app/globals.css'; // Global styles
import { useState, useEffect } from 'react'
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import { MantineProvider } from '@mantine/core';

function Configurator({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLocalStorageChecked, setIsLocalStorageChecked ] = useState<boolean>(false);

  // Because we want each time we enter the demo to be "starting fresh", we delete
  // the tinad userId and apiKey in localstorage on first load.
  const erasePreviousTinadLocalStorage = ():void => {
    if (typeof window !== 'undefined') {
      const previousFirstLoad = localStorage.getItem('tinadFirstLoad');
      // Check and remove the 'tinad' item from localStorage so userId is regenerated
      if (!previousFirstLoad) {
        localStorage.setItem('tinadFirstLoad', 'true');
      }
      // Clear user id so notifs will start from scratch
      const previousTinadConfigString = localStorage.getItem('tinad');
      if (previousTinadConfigString) {
        const previousTinadConfig = JSON.parse(previousTinadConfigString);
        if (previousTinadConfig['userId'] !== undefined) {
          delete(previousTinadConfig.userId);
          localStorage.setItem('tinad', JSON.stringify(previousTinadConfig));
        }
      }
    }
  }

  useEffect(() => {
    setIsClient(true)
    erasePreviousTinadLocalStorage();
    setIsLocalStorageChecked(true);
  }, [])

  // Do not render main app until we've done all the work in erasePreviousTinadLocalStorage
  if (!isLocalStorageChecked) {
    return <div>Loading...</div>;
  }

  return (
      <MantineProvider defaultColorScheme="dark">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
  );
}

export default Configurator;
