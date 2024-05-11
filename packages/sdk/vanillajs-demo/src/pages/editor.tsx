import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import { Button } from "@/components/ui/button"

export default function Editor() {

  const generateCodeFromConfig = (config) => {
    // Generate and return code as a string based on the config object
    return `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(config, null, 2)});`;
  };

  const sdkConfig = { param1: 'a', param2: 2 };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0px 10px', background: '#272822' }}>
        <Button variant="link"
          className="copy-button"
          onClick={() => navigator.clipboard.writeText(sdkConfig)}
        >
          Copy to clipboard
        </Button>
      </div>
      <AceEditor
        mode="javascript"
        theme="monokai"
        value={generateCodeFromConfig(sdkConfig)}
        readOnly={true}
        name="editor-pane"
        fontSize="18px"
        style={{ width: '100%', height: 'calc(100% - 40px)' }}  // Adjust height to account for header
        editorProps={{ $blockScrolling: true }}
        showPrintMargin={false}
      />
    </div>
  );
};


