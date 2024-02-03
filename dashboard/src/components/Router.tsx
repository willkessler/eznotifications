// Router.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import Notifications from './Notifications/Notifications';
import Settings from './Account/Settings';

const RouterComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        {/* Other routes go here */}
      </Route>
      {/* Define routes that should not use MainLayout here */}
    </Routes>
  );
};

export default RouterComponent;
