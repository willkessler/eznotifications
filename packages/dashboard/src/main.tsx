import ReactDOM from 'react-dom/client';
import App from './App';
import { dark, neobrutalism } from '@clerk/themes';
import LogRocket from 'logrocket';

const isLocalhost = ():boolean => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

// Initialize LogRocket for tracking all user sessions except local dev
if (!isLocalhost()) {
  LogRocket.init(import.meta.env.VITE_LOGROCKET_API_KEY);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
      <App />
);
