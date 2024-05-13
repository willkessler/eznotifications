import Head from 'next/head';
import { useState } from 'react';
import ConfiguratorContext from './configuratorContext';
import Configurator2 from './configurator2';
import Editor from './editor';
import CodeSnippet from './codeSnippet';
import TabbedEditor from './TabbedEditor';
import './css/widgets.css';

export default function Home() {
  const [sdkConfig, setSdkConfig] = useState({});  // State to hold SDK configuration

  // Function to update SDK configuration
  const updateSdkConfig = (newConfig) => {
    setSdkConfig(newConfig);
  };

  return (
    <ConfiguratorContext>
      <div className="container">
        <Head>
          <title>SDK Configurator</title>
        </Head>
        <style jsx>{`
          `}</style>

        <div className="top-panel">
          <div className="config-widget">
            <Configurator2 />
          </div>
          <div className="code-editor">
            <TabbedEditor />
          </div>
        </div>

        <div className="bottom-panel">
          <iframe id="bank-app" src="/bank"></iframe>
        </div>
      </div>
    </ConfiguratorContext>
  );
}
