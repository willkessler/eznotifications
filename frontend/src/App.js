//import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import NewNotificationPage from './pages/NewNotificationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/new-notification" element={<NewNotificationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
