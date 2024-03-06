import React from 'react';
import './App.css';
import Notifications from './components/Notifications';
import { TinadSDK } from '@thisisnotadrill/react-core';

function App() {
  // initialize TINAD SDK
  TinadSDK.init({
    apiKey: 'C0N94F27',
    userId: 'user123',
  });
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Notifications</h1>
        <Notifications />
      </header>
    </div>
  );
}

export default App;
