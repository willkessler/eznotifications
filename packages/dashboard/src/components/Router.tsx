// Router.tsx
import React from 'react';
import { DatesProvider } from '@mantine/dates';
import { DateFormattersProvider } from '../lib/DateFormattersProvider';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import Notifications from './Notifications/Notifications';
import Settings from './Account/Settings';
import Statistics from './Account/Statistics';
import LoginComponent from './Account/LoginComponent'; 
import DemoLoginComponent from './Account/DemoLoginComponent'; 
import SignUpComponent from './Account/SignUpComponent'; 
import OnboardComponent from './Account/OnboardComponent';
import PlaygroundComponent from './Account/PlaygroundComponent'; 
import AuthWrapper from './Account/AuthWrapper'; 
import { SettingsProvider } from './Account/SettingsContext';
import { APIKeysProvider } from './Account/APIKeysContext';
import { useTimezone } from '../lib/TimezoneContext';

const DatesProviderWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { userTimezone } = useTimezone(); // Now safely within the context
  return (
    <DatesProvider settings={{ timezone: userTimezone }}>
      {children}
    </DatesProvider>
  );
};

const RouterComponent = () => {
  const { userTimezone, setUserTimezone } = useTimezone();
  return (
    <SettingsProvider>
      <APIKeysProvider>
        <AuthWrapper>
          <DatesProviderWrapper>
            <DateFormattersProvider>
              <Routes>
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/demo-login" element={<DemoLoginComponent />} />
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

                  <Route path="/playground" element={<PlaygroundComponent />} />

                </Route>
              </Routes>
            </DateFormattersProvider>
          </DatesProviderWrapper>
        </AuthWrapper>
      </APIKeysProvider>
    </SettingsProvider>
  );
};

export default RouterComponent;
