import ReactDOM from 'react-dom/client';
import App from './App';
import { dark, neobrutalism } from '@clerk/themes';
import { ClerkProvider } from '@clerk/clerk-react'

// Import your publishable key for Clerk
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
 
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        signIn: { baseTheme: neobrutalism }
      }}
    >
      <App />
    </ClerkProvider>
);
