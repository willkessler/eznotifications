import React, { useState, useEffect } from 'react';
import { 
  Sandpack,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackProvider  
} from '@codesandbox/sandpack-react';
//import '@codesandbox/sandpack-react/dist/index.css'; // doesn't work
import { useUser } from "@clerk/clerk-react";
import { Navigate } from 'react-router-dom';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { ActionIcon, Anchor, Code, CopyButton, Group, Skeleton, 
         Image, Button, Paper, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAPIKeys } from './APIKeysContext';
import { useConfig } from '../../lib/ConfigContext';

import LogoComponent from '../Layout/LogoComponent';

const SandpackComponent = () => {
    const { isSignedIn,user } = useUser();
    const { apiBaseUrl, getBearerHeader } = useConfig();
    const [ filesObject, setFilesObject ] = useState<Object | null>(null);    

    const fetchExampleRepo = async () => {
        let filesObj = {};
        if (user) {
            const repoUrl = 'https://github.com/willkessler/this-is-not-a-drill-examples';
            try {
                const clerkId = user.id;
                const APIUrl = `${apiBaseUrl}/playground/fetch-example-app`;
                const response = await fetch(APIUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({
                        clerkId, 
                        repoUrl
                    })
                });
                if (!response.ok) {
                    throw new Error (`HTTP error! status: ${response.status}`);
                } else {
                    console.log('Fetched repo contents from Tinad API.');                  
                }
                
                console.log('inside fetchExampleRepo');
                filesObj = await response.json();

            } catch (error) {
                console.error(`Error fetching repo, url: ( ${repoUrl} ).`, error);
                return null;
            }
        }
        //console.log(`Files contains: ${JSON.stringify(filesObj,null,2)}`);
        return filesObj.files;
    }

    if (!isSignedIn) {
        return <Navigate to="/login" replace />;
    }
    
    useEffect(() => {
        fetchExampleRepo().then(filesObj => {
            setFilesObject(filesObj);
        });
    }, []);

    if (filesObject === null) {
        return <>Loading..., please wait.</>;
    }

    return (
        <>
            <Title order={1}>Playground</Title>
            <div >
            <SandpackProvider
        theme="dark" 
        files={filesObject}
        options={{
            openPaths: ["/src/components/App.tsx"],
            activePath: "/src/components/App.tsx",
            showNavigator: true,
            showTabs: true,
            closeableTables: true,
        }}
        customSetup={{
            dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-router-dom": "^6.22.3",
                "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
                "@mantine/core": "^7.6.1",
                "@mantine/hooks": "^7.6.1",
                "@tabler/icons-react": "^3.1.0",
                "@testing-library/jest-dom": "^5.17.0",
                "@testing-library/react": "^13.4.0",
                "@testing-library/user-event": "^13.5.0",
                "@this-is-not-a-drill/react-core": "latest",
                "@this-is-not-a-drill/react-ui": "latest",
                "@types/jest": "^27.5.2",
                "@types/node": "^16.18.83",
                "@types/react": "^18.2.58",
                "@types/react-dom": "^18.2.19",
                "dompurify": "^3.0.9",
                "lodash": "^4.17.21",
                "marked": "^12.0.1",
                // Specify any additional dependencies here
            },
            entry: '/src/main.tsx',
        }}
            >
            <SandpackLayout >
            <SandpackFileExplorer style={{ height:'90vh'}} />
            <SandpackCodeEditor style={{ height:'90vh'}} />
            <SandpackPreview style={{ height:'90vh'}} />
        </SandpackLayout>
        </SandpackProvider>
        </div>
        </>
    );
};


export default SandpackComponent;


/*
            // Define a file in the root directory
            "/index.js": {
                code: `// Entry point of your app
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';

ReactDOM.render(<App />, document.getElementById('root'));`,
            },
            "/index.html": {
                code: `<div id="root"></div>`,
            },
            // Define files within the 'src' folder
            "/src/App.js": {
                code: `import React from 'react';
import { initTinadSDK } from '@this-is-not-a-drill/react-core';
import MyComponent from './components/MyComponent';

export default function App() {
const tinadConfig = { 
// This can hold whatever end user id you want to use to distinguish individual users. 
userId: 'user123',
// Put your API key in the environment file .env so it can be picked up here.
apiKey: 'xyzpdq',
// For production, do not pass this in and TINAD will default to the production API endpoint.
apiBaseUrl: 'http://localhost:8080',
};
initTinadSDK(tinadConfig);

return <><div>Hello there, Sandpack!  <MyComponent /></div></> ;
}`,
            },
            // Example of adding a CSS file in a 'styles' folder
            "/src/styles/App.css": {
                code: `div {
color: red;
}`,
            },
            // Adding a file in a nested folder structure
            "/src/components/MyComponent.js": {
                code: `import React from 'react';

const MyComponent = () => {
return <div>My Component</div>;
};

export default MyComponent;`,
            },
        }
*/
