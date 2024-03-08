import '@mantine/core/styles.css';
import RouterComponent from './Router';
import { TinadSDK } from '@thisisnotadrill/react-core';

const App = () => {
  // Initialize the This Is Not A Drill! SDK here with your
  // temporary API key, and userId so the service will be able
  // to track which user saw which notification. (The userID can
  // be any string unique to your application; it does not have to include any PII).

  TinadSDK.init({
    apiKey: 'C0N94F27',
    userId: 'user1234d',
  });

    return (
        <>
          <RouterComponent />
        </>
  );
}

export default App;
