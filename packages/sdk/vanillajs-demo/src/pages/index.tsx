import Head from 'next/head';
import ConfiguratorContext from './configuratorContext';
import Configurator from './configurator';
import Editor from './editor';
import CodeSnippet from './codeSnippet';
import TabbedEditor from './TabbedEditor';
import './css/widgets.css';

export default function Home() {
  return (
    <ConfiguratorContext>
      <div className="container">
        <Head>
          <title>SDK Configurator</title>
        </Head>
        <div className="top-panel">
          <div className="config-widget">
            <Configurator />
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
