import '@mantine/core/styles.css';
import RouterComponent from './Router';
import { initTinadSDK, TinadSDKProvider } from '@this-is-not-a-drill/react-core';

const App = () => {

    const tinadConfig = { 
        userId: 'user1234e',
        apiKey: 'OQONv9CK',
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL, // in actual production, set this to TINAD's production API url
    };
    initTinadSDK(tinadConfig);

    return (
        <>
          <TinadSDKProvider>
            <RouterComponent />
          </TinadSDKProvider>
        </>
    );
}

export default App;
