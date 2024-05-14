import React, { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import { useSdkConfiguration } from './configuratorContext';
import { Tabs, rem } from '@mantine/core';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

//import { TargetInsertType, SDKConfiguration } from '../../../vanillajs/src/types';

type FileData = {
  filename: string;
  content: string;
};


const TabbedEditor: React.FC = () => {
  const { getSdkConfiguration, setSdkConfiguration, getFilteredSdkConfiguration, configurationChanged, setConfigurationChanged } = useSdkConfiguration();
  const [activeTab, setActiveTab] = useState<string | null>('snippet.js');
  const [editorHeight, setEditorHeight ] = useState('600px');
  const containerRef = useRef(null);
  const initialFiles: FileData[] = [
    { filename: 'snippet.js', content: `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(getFilteredSdkConfiguration(), null, 2)});` },
    { filename: 'custom.css', content: "\n\nconsole.log('Hello from file 2');\n" }
  ];
  const [files, setFiles] = useState<FileData[]>(initialFiles);

  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const totalHeight = containerRef.current.clientHeight;
        const tabHeight = containerRef.current.firstChild.clientHeight;
        setEditorHeight(`${totalHeight - tabHeight}px`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  useEffect(() => {
    const introPrefix =  "//\n// AUTO-GENERATED SCRIPT TAG\n" +
                         "// The configuration controls at left\n" +
                         "// update the script tag below.\n" +
                         "// To go live, simply embed a snippet like this\n" +
                         "// (along your API key) on your site/app.\n" +
                         "//\n\n" +
`<script 
  id="tinad-sdk"
  src="http://localhost:3500/bundle.js"
  tinad-configuration=
'`;    
    const currentConfig = getFilteredSdkConfiguration();
    const configStringified = JSON.stringify(currentConfig, null,2);
    const editorContents = introPrefix + configStringified + "'\n>\n\n";
    //console.log(`currentconfig: ${JSON.stringify(currentConfig,null,2)}`);
    setFiles(
      [
        { filename: 'snippet.js', content: editorContents },
        { filename: 'custom.css', content: files[1].content }
      ]
    );
    setConfigurationChanged(false);
  }, [configurationChanged]);
  
  const handleEditorChange = (newContent: string, index: number) => {
    setFiles(currentFiles =>
      currentFiles.map((file, idx) => ({
        ...file,
        content: idx === index ? newContent : file.content
      }))
    );
  };

  return (
    <div ref={containerRef} 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position:'relative', overflow:'hidden' }}> {/* Set the height as needed */}    
      <Tabs variant="outline" value={activeTab} onChange={setActiveTab} orientation="horizontal" style={{ height: '100%' }}>
        <Tabs.List>
          {files.map((file, index) => (
            <Tabs.Tab 
              key={file.filename} 
              value={file.filename}
              style={{ fontWeight: activeTab === file.filename ? 'bold' : 'normal', color: activeTab === file.filename ? '#eee' : '#666' }}
            >
              {file.filename}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {files.map((file, index) => (
          <Tabs.Panel key={file.filename} value={file.filename} style={{flex:1, minHeight: 0, height:'100%', position:'relative', overflow:'auto'}}>
            <AceEditor
              mode="javascript"
              theme="monokai"
              value={files[index].content}
              onChange={(newContent) => handleEditorChange(newContent, index)}
              name={`editor_${index}`}
              fontSize={16}
              fontFamily="Arial"
              tabSize={2}
              showPrintMargin={false}
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height={editorHeight}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabbedEditor;
