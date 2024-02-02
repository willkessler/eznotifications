// Router.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import NotificationsList from './Notifications/NotificationsList';
import Settings from './Account/Settings';

const RouterComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<NotificationsList />} />
        <Route path="settings" element={<Settings />} />
        {/* Other routes go here */}
      </Route>
      {/* Define routes that should not use MainLayout here */}
    </Routes>
  );
};

export default RouterComponent;
