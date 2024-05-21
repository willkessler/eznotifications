import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { Ace } from 'ace-builds';
import { useSdkConfiguration } from '../lib/configuratorContext';
import { useClipboard } from '@mantine/hooks';
import { Button, Group, Tabs, Tooltip, rem } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

type FileData = {
  filename: string;
  content: string;
};


const TabbedEditor: React.FC = () => {
  const { getSdkConfiguration,
          setSdkConfiguration,
          getCustomCss,
          setCustomCss,
          getFilteredSdkConfiguration,
          configurationChanged,
          setConfigurationChanged,
          activeTab,
          setActiveTab,
          activeTabJumpString,
          setActiveTabJumpString,
  } = useSdkConfiguration();

  const [editorHeight, setEditorHeight ] = useState('400px');
  const initialFiles: FileData[] = [
    { filename: 'snippet.js', content: `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(getFilteredSdkConfiguration(), null, 2)});` },
    { filename: 'custom.css', content: "\n\nconsole.log('Hello from file 2');\n" }
  ];
  const [files, setFiles] = useState<FileData[]>(initialFiles);
  const clipboard = useClipboard({ timeout: 1000 });
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const editorRefs = useRef<Map<string, Ace.Editor>>(new Map());

  const onEditorLoad = (editor: Ace.Editor, name: string) => {
    editorRefs.current.set(name, editor);
  };

  const handleCopyToClipboard = (content:string, filename:string):void => {
    clipboard?.copy(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 1000);
  }

  const updateSampleAppCss = (newCss: string) => {
    const bankIframe = document.getElementById('bank-app') as HTMLIFrameElement;
    if (bankIframe && bankIframe.contentWindow) {
      const newConfigMessage = {
        name: 'updateCss',
        css: newCss,
      };
      const messageString = JSON.stringify(newConfigMessage);
      bankIframe.contentWindow.postMessage(messageString, window.location.origin);
    }
  }

  const updateFiles = (file1:FileData, file2: FileData):void => {
    const introPrefix =  "//\n// AUTO-GENERATED SCRIPT TAG\n" +
                         "// The configuration controls at left\n" +
                         "// update the script tag below.\n" +
                         "// To go live, simply embed a snippet like this\n" +
                         "// (along your API key) on your site/app.\n" +
                         "//\n\n" +
`<script
  id="tinad-sdk"
  src="${process.env.NEXT_PUBLIC_TINAD_SOURCE_SCRIPT_URL}"
  defer
  tinad-configuration=
'`;
    const configStringified = file1.content;
    const editorContents = introPrefix + configStringified + "'\n>\n\n";
    const currentCustomCss = file2.content;
    setFiles(
      [
        { filename: file1.filename, content: editorContents },
        { filename: file2.filename, content: currentCustomCss }
      ]
    );
  }

  //
  // Code to support jumping to a specific line in an editor panel, used to help users
  // find the relevant css to play with.

  // Find the line number containing a specific substring
  const findLineContainingSubstring = (editor: Ace.Editor, substring: string): number => {
    const lines = editor.session.doc.getAllLines();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(substring)) {
        return i; // Line numbers are zero-based
      }
    }
    return -1; // Substring not found
  }

  // Smoothly scroll to a specific line
  const smoothScrollToLine = useCallback((editor: Ace.Editor, lineNumber: number, duration: number): void => {
    let startLine = editor.getFirstVisibleRow();
    const endLine = lineNumber;
    const distance = endLine - startLine;
    const step = distance / (duration / 10);

    const scroll = function () {
      startLine += step;
      if ((step > 0 && startLine >= endLine) || (step < 0 && startLine <= endLine)) {
        editor.scrollToLine(endLine, true, true, () => {});
        return;
      }
      editor.scrollToLine(Math.round(startLine), true, true, () => {});
      setTimeout(scroll, 10);
    };

    scroll();
  },[]);

  // Jump to a line containing a specific substring with smooth scroll
  const jumpToLineContainingSubstring = useCallback((editor: Ace.Editor, substring: string, duration: number = 500): void => {
    const lineNumber = findLineContainingSubstring(editor, substring);
    if (lineNumber !== -1) {
        smoothScrollToLine(editor, lineNumber, duration);
        setTimeout(() => {
            editor.gotoLine(lineNumber + 1, 0, true); // gotoLine expects 1-based line number
        }, duration);
    } else {
        console.log("Substring not found in any line");
    }
  }, [smoothScrollToLine]);

  useEffect(() => {
    const fetchCustomCss = async ():Promise<void> => {
      try {
        const cssUrl = '/bank.css';
        const response = await fetch(cssUrl);
        const rawCss = await response.text();
        const finalCss = "/*\n * Edit the CSS below to see how to\n * customize the inline notification's styles.\n*/\n" + rawCss;
        setCustomCss(finalCss);
        updateFiles(
          { filename: 'snippet.js', content: JSON.stringify(getFilteredSdkConfiguration(), null, 2) },
          { filename: 'custom.css', content: getCustomCss() },
        );
      } catch(error) {
        console.log(`Cannot fetch custom css: ${error}`);
      }
    }

    fetchCustomCss();
  }, [getFilteredSdkConfiguration, getCustomCss, setCustomCss]);

  useLayoutEffect(() => {
    const calculateHeight = () => {
      setTimeout(() => {
        const codeEditorElement = document.getElementById('code-editor');
        const tabsElement = document.getElementById('editor-tabs');
        if (codeEditorElement !== null && tabsElement !== null) {
          const totalHeight = codeEditorElement.clientHeight;
          const tabHeight = tabsElement.clientHeight;
          console.log(`calculated heights: total: ${totalHeight} tabs: ${tabHeight}`);
          setEditorHeight(`${totalHeight - tabHeight}px`);
        }
      },0);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    }
  }, []);

  useEffect(() => {
    if (activeTab && activeTab.length > 0) {
      const mapKey = `editor_${activeTab}`;
      const editor = editorRefs.current.get(mapKey);
      if (activeTabJumpString && (activeTabJumpString.length > 0)) {
        console.log(`Jumping active editor to line containing ${activeTabJumpString} in editor with filename ${activeTab}`);
        if (editor) {
          setTimeout(() => {
            jumpToLineContainingSubstring(editor, activeTabJumpString);
          }, 500);
        }
      }
    }
  }, [activeTab, activeTabJumpString, jumpToLineContainingSubstring]);

  useEffect(() => {
    console.log(`calling updateFiles with ${JSON.stringify(getFilteredSdkConfiguration(),null,2)}`);
    updateFiles(
      { filename: 'snippet.js', content: JSON.stringify(getFilteredSdkConfiguration(),null,2) },
      { filename: 'custom.css', content: getCustomCss() }
    );
    setConfigurationChanged(false);
  }, [configurationChanged, getCustomCss, getFilteredSdkConfiguration, setConfigurationChanged]);

  const handleEditorChange = (newContent: string, index: number) => {
    if (index === 1) {
      console.log('Updating bank app CSS.');
      setCustomCss(newContent);
      updateSampleAppCss(newContent);
    }
    setFiles(currentFiles =>
      currentFiles.map((file, idx) => ({
        ...file,
        content: idx === index ? newContent : file.content
      }))
    );
  };

  return (
    <div id="editors-container" className="editors-container">
      <Tabs
        variant="outline"
        value={activeTab}
        onChange={setActiveTab}
        orientation="horizontal"
        style={{ height: '100%' }}
      >
        <Tabs.List id="editor-tabs">
          {files.map((file, index) => (
            <Tabs.Tab
              key={file.filename}
              value={file.filename}
              style={{
                  fontWeight: activeTab === file.filename ? 'bold' : 'normal',
                  color: activeTab === file.filename ? '#eee' : '#666',
                  display:'flex',
                  alignItems: 'center',
                  justyContent: 'space-between',
              }}
            >
              <Group>
                <div>{file.filename}</div>
              <Tooltip
                label={copiedFile === file.filename ? 'Copied!' : 'Copy'}
                position="bottom"
                withArrow
                color={copiedFile === file.filename ? 'teal' : 'gray'}
              >
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  {copiedFile === file.filename ? (
                    <IconCheck size={16} color="teal" />
                  ) : (
                    <IconCopy size={16} onClick={() => handleCopyToClipboard(files[index].content, file.filename)} />
                  )}
                </div>
              </Tooltip>
              </Group>
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {files.map((file, index) => (
          <Tabs.Panel key={file.filename} value={file.filename}
            style={{flex:1, minHeight: 0, height:'100%', position:'relative', overflow:'auto'}}>
            <AceEditor
              mode="javascript"
              theme="monokai"
              value={files[index].content}
              onChange={(newContent) => handleEditorChange(newContent, index)}
              name={`editor_${index}`}
              fontSize={16}
              tabSize={2}
              showPrintMargin={false}
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height={editorHeight}
              onLoad={(editor) => onEditorLoad(editor, `editor_${file.filename}`)}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabbedEditor;
