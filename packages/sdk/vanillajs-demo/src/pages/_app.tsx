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
 
  useEffect(() => {
    setIsClient(true)
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
