import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

export default function Editor() {

  const generateCodeFromConfig = (config) => {
    // Generate and return code as a string based on the config object
    return `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(config, null, 2)});`;
  };

  const sdkConfig = { param1: 'a', param2: 2 };

  return (
    <>
      <AceEditor
        mode="javascript"
        theme="monokai"
        value={generateCodeFromConfig(sdkConfig)}
        readOnly={true}
        name="editor-pane"
        fontSize="18px"
        style={{ width:'100%', height: '100%'}}
        editorProps={{ $blockScrolling: true }}
      />
    </>
  );
};


