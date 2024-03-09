import '@mantine/core/styles.css';
import RouterComponent from './Router';
import { TinadSDKProvider } from '@thisisnotadrill/react-core';

const App = () => {

    // Wrap your content in the This Is Not A Drill! (Tinad) SDK
    // provider.  Pass in your temporary API key and a unique user ID
    // so the service can track who saw each notification. (The user ID
    // can be any string unique to your application; it does not have
    // to include any private information, or Pii).

    const tinadConfig = { 
        userId: 'user1234d',
        apiKey: 'C0N94F27',
    };

    return (
        <>
            <TinadSDKProvider config={tinadConfig} >
              <RouterComponent />
            </TinadSDKProvider>
        </>
    );
}

export default App;
