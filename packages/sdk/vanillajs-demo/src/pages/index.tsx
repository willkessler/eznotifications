import Head from 'next/head';
import { useState } from 'react';
import Configurator from './configurator';
import Editor from './editor';
import './widgets.css';

export default function Home() {
  const [sdkConfig, setSdkConfig] = useState({});  // State to hold SDK configuration

  // Function to update SDK configuration
  const updateSdkConfig = (newConfig) => {
    setSdkConfig(newConfig);
  };

  return (
    <div className="container">
      <Head>
        <title>SDK Configurator</title>
      </Head>
      <style jsx>{`
      `}</style>

      <div className="top-panel">
        <div className="config-widget">
          <Configurator />
        </div>
        <div className="code-editor">
          <Editor />
        </div>
      </div>

      <div className="bottom-panel">
        <iframe id="bank-app" src="/bank"></iframe>
      </div>
    </div>
  );
}
