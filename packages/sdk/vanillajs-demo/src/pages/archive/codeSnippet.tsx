import { CodeHighlight } from '@mantine/code-highlight';

export default function CodeSnippet() {

  const sdkConfig = { param1: 'a', param2: 2 };

  const generateCodeFromConfig = (config) => {
    // Generate and return code as a string based on the config object
    return `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(config, null, 2)});`;
  };

  return (
    <>
      <CodeHighlight
        code={generateCodeFromConfig(sdkConfig)}
        language="tsx"
        copyLabel="Copy code"
        copiedLabel="Copied!"
      />
    </>
  );
};
