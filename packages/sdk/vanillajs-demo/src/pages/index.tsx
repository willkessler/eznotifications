import Head from 'next/head';
import { useState } from 'react';
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
          widget
      <button class="copy-button" onClick={() => navigator.clipboard.writeText(code)}>
        Copy Code
      </button>

        </div>
        <div className="code-editor">
          <Editor />
        </div>
      </div>

      <div className="bottom-panel">
        <iframe src="/bank"></iframe>
      </div>
    </div>
  );
}
