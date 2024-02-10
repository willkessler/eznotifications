// Router.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import Notifications from './Notifications/Notifications';
import Settings from './Account/Settings';
import Statistics from './Account/Statistics';
import LoginComponent from './Account/LoginComponent'; 
import SignUpComponent from './Account/SignUpComponent'; 
import AuthWrapper from './Account/AuthWrapper'; 
import { SettingsProvider } from './Account/SettingsContext';
import { APIKeysProvider } from './Account/APIKeysContext';

const RouterComponent = () => {
  return (
    <SettingsProvider>
      <APIKeysProvider>
        <AuthWrapper>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/sign-up" element={<SignUpComponent />} />
            <Route path="/" element={<MainLayout />} >
              <Route index element={<Notifications />} />
              <Route path="statistics" element={<Statistics />} />

              <Route path="/settings" element={<Navigate replace to="/settings/account" />} />

              <Route path="/settings/account" element={<Settings />} />
              <Route path="/settings/team" element={<Settings />} />
              <Route path="/settings/api-keys" element={<Settings />} />
              <Route path="/settings/app-config" element={<Settings />} />
              <Route path="/settings/account/tos" element={<Settings />} />
              <Route path="/settings/account/billing" element={<Settings />} />
            </Route>
          </Routes>
        </AuthWrapper>
      </APIKeysProvider>
    </SettingsProvider>
  );
};

export default RouterComponent;
