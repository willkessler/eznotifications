import { useEffect, useState } from 'react';
import Head from 'next/head';
import Configurator from './configurator';
import TabbedEditor from './TabbedEditor';
import { useSdkConfiguration } from '../lib/configuratorContext';
import './css/widgets.css';
import LogRocket from 'logrocket';

export default function Home() {

  const { setBankIframeIsReadyState } = useSdkConfiguration();
  const [ activePanel, setActivePanel ] = useState<string>('configurator');

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
    
    // Set the initial value of activePanel based on the viewport size
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setActivePanel('both');
      } else {
        setActivePanel('configurator');
      }
    };

    // Set the initial value on component mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };    

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
        {(activePanel === 'both' || window.innerWidth >= 768) && (
          <>
            <div className="config-widget on-screen">
              <Configurator />
            </div>
            <div id="code-editor" className="code-editor on-screen">
              <TabbedEditor />
            </div>
          </>
        )}
        {activePanel === 'configurator' && window.innerWidth < 768 && (
          <>
            <div className="config-widget on-screen">
              <Configurator />
            </div>
            <div id="code-editor" className="code-editor off-screen">
              <TabbedEditor />
            </div>
          </>
        )}
        {activePanel === 'codeEditor' && window.innerWidth < 768 && (
          <>
            <div className="config-widget off-screen">
              <Configurator />
            </div>
            <div id="code-editor" className="code-editor on-screen">
              <TabbedEditor />
            </div>
          </>
        )}
      </div>
      <div className="bottom-panel">
        <iframe id="bank-app" src="/bank"></iframe>
      </div>
      {window.innerWidth < 768 && (
        <>
          {activePanel === 'configurator' && (
            <>
              <div className="side-tab left chosen" onClick={() => setActivePanel('configurator')}>
                Configurator
              </div>
              <div className="side-tab right" onClick={() => setActivePanel('codeEditor')}>
                Code Viewer
              </div>
            </>
          )}
          {activePanel === 'codeEditor' && (
            <>
              <div className="side-tab left" onClick={() => setActivePanel('configurator')}>
                Configurator
              </div>
              <div className="side-tab right chosen" onClick={() => setActivePanel('codeEditor')}>
                Code Viewer
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
