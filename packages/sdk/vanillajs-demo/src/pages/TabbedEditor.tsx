import React, { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import { Tabs, rem } from '@mantine/core';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

import { TargetInsertType, SDKConfiguration } from './types';

type FileData = {
  filename: string;
  content: string;
};

const sdkConfig = {
  api: {
    displayMode : 'inline',
    userId: undefined, // will be set later by either the user or autoset
    key: '',
    endpoint: 'https://api.this-is-not-a-drill.com',
    environments: [ 'Development' ],
    domains: [],
  },
      inline: {
        targetClassname: '',
        targetPlacement: 'target-inside' as TargetInsertType,
        customControlClasses: {
          content: 'my-content',
          confirm: 'my-confirm',
          dismiss: 'my-dismiss',
        },
      },
      toast: {
        position: 'bottom-end',
        duration: 5000,
      },
      banner: {
        duration: 5000,
      },
      modal: {
        confirmButtonLabel: 'OK',
      }
};


const initialFiles: FileData[] = [
  { filename: 'config.js', content: `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(sdkConfig, null, 2)});` },
  { filename: 'config.css', content: "\n\nconsole.log('Hello from file 2');\n" }
];

const TabbedEditor: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>(initialFiles);
  const [activeTab, setActiveTab] = useState<string | null>('config.js');
  const [editorHeight, setEditorHeight] = useState('600px');
  const containerRef = useRef(null);

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
