import ReactDOM from 'react-dom/client';
import App from './App';
import { dark, neobrutalism } from '@clerk/themes';
import LogRocket from 'logrocket';

// Initialize LogRocket for tracking all user sessions
LogRocket.init(import.meta.env.VITE_LOGROCKET_API_KEY);

ReactDOM.createRoot(document.getElementById('root')!).render(
      <App />
);
