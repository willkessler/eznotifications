import { useEffect } from 'react';
import Head from 'next/head';
import Configurator from './configurator';
import Editor from './editor';
import CodeSnippet from './codeSnippet';
import TabbedEditor from './TabbedEditor';
import { useSdkConfiguration } from './configuratorContext';
import './css/widgets.css';

export default function Home() {

  const { setBankIframeIsReadyState } = useSdkConfiguration();

  // Listen for a tinad-iframe-ready message from the bank iframe, and when we get it process all queued postmessages from configurator.
  const handlePostMessage = (event: MessageEvent) => {
    if (event.data === 'tinad-iframe-ready') {
      setBankIframeIsReadyState(true);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handlePostMessage);  // listen for post messages from the tabbed editor
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  
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
