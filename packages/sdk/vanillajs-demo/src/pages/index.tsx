import { useEffect } from 'react';
import Head from 'next/head';
import Configurator from './configurator';
import TabbedEditor from './TabbedEditor';
import { useSdkConfiguration } from '../lib/configuratorContext';
import './css/widgets.css';
import LogRocket from 'logrocket';

export default function Home() {

  const { setBankIframeIsReadyState } = useSdkConfiguration();

  useEffect(() => {
    const isLocalhost = ():boolean => {
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    };

    // Initialize LogRocket for tracking all user sessions except local dev
    if (!isLocalhost()) {
      if (process.env.NEXT_PUBLIC_TINAD_LOGROCKET_API_KEY !== undefined) {
        LogRocket.init(process.env.NEXT_PUBLIC_TINAD_LOGROCKET_API_KEY);
      }
      if (process.env.NEXT_PUBLIC_TINAD_CLERK_DEMO_USER_ID !== undefined) {
        LogRocket.identify(process.env.NEXT_PUBLIC_TINAD_CLERK_DEMO_USER_ID);
      }
    }
  }, []);

  useEffect(() => {
    // Listen for a tinad-iframe-ready message from the bank iframe, and when we get it process all queued postmessages from configurator.
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data === 'tinad-iframe-ready') {
        setBankIframeIsReadyState(true);
      }
    };

    window.addEventListener("message", handlePostMessage);  // listen for post messages from the tabbed editor
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, [setBankIframeIsReadyState]);

  
  return (
    <div className="container">
      <Head>
        <title>SDK Configurator</title>
      </Head>
      <div className="top-panel">
        <div className="config-widget">
          <Configurator />
        </div>
        <div id="code-editor" className="code-editor">
          <TabbedEditor />
        </div>
      </div>

      <div className="bottom-panel">
        <iframe id="bank-app" src="/bank"></iframe>
      </div>
    </div>
  );
}
