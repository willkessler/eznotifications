import '@mantine/core/styles.css';
import RouterComponent from './Router';
import { initTinadSDK } from '@thisisnotadrill/react-core';

const App = () => {

    const tinadConfig = { 
        userId: 'user1234e',
        apiKey: 'OQONv9CK',
    };
    initTinadSDK(tinadConfig);

    return (
        <>
            <RouterComponent />
        </>
    );
}

export default App;
