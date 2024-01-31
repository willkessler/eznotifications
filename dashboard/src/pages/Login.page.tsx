import React from 'react';
import AuthService from '../services/Auth.service';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    // Example login function; adapt as necessary
    AuthService.loginWithOAuth('providerName')
      .then(() => {
        // Redirect to dashboard after successful login
        window.location.href = '/dashboard';
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  };

  return (
    <div>
      <h2>Login / Sign Up</h2>
      <button onClick={handleLogin}>Login with OAuth Provider</button>
    </div>
  );
};

export default LoginPage;
